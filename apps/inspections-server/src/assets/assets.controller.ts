import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

interface AssetQueryDto {
  category?: string;
  status?: string;
  type?: string;
  location?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Controller('assets')
export class AssetsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query() query: AssetQueryDto) {
    const {
      category,
      status,
      type,
      location,
      search,
      page = 1,
      limit = 20,
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = query;

    // Build where clause
    const where: any = {};
    
    if (category) where.category = category;
    if (status) where.status = status;
    if (type) where.type = type;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { assetId: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [assets, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          workOrders: {
            include: {
              workOrder: {
                select: {
                  id: true,
                  workOrderId: true,
                  title: true,
                  status: true,
                  createdAt: true
                }
              }
            }
          }
        }
      }),
      this.prisma.asset.count({ where })
    ]);

    return {
      data: assets.map(asset => ({
        ...asset,
        workOrderCount: asset.workOrders.length,
        recentWorkOrders: asset.workOrders
          .sort((a, b) => new Date(b.workOrder.createdAt).getTime() - new Date(a.workOrder.createdAt).getTime())
          .slice(0, 3)
          .map(wo => wo.workOrder)
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  @Get('categories')
  async getCategories() {
    const categories = await this.prisma.asset.groupBy({
      by: ['category'],
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } }
    });

    return categories.map(cat => ({
      name: cat.category,
      count: cat._count.category
    }));
  }

  @Get('types')
  async getTypes() {
    const types = await this.prisma.asset.groupBy({
      by: ['type'],
      _count: { type: true },
      orderBy: { _count: { type: 'desc' } }
    });

    return types.map(type => ({
      name: type.type,
      count: type._count.type
    }));
  }

  @Get('locations')
  async getLocations() {
    const locations = await this.prisma.asset.findMany({
      select: { location: true },
      where: { location: { not: null } },
      distinct: ['location']
    });

    return locations
      .map(l => l.location)
      .filter(Boolean)
      .sort();
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        workOrders: {
          include: {
            workOrder: {
              include: {
                inspections: {
                  include: { template: true }
                }
              }
            }
          },
          orderBy: {
            workOrder: { createdAt: 'desc' }
          }
        }
      }
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    return {
      ...asset,
      workOrderHistory: asset.workOrders.map(wo => ({
        ...wo.workOrder,
        assetNotes: wo.notes,
        assetPriority: wo.priority
      }))
    };
  }

  @Post()
  async create(@Body() body: any) {
    const asset = await this.prisma.asset.create({
      data: {
        assetId: body.assetId || `AST-${Date.now()}`,
        name: body.name,
        type: body.type,
        category: body.category || 'Equipment',
        location: body.location,
        manufacturer: body.manufacturer,
        model: body.model,
        serialNumber: body.serialNumber,
        status: body.status || 'active',
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
        warrantyExpiry: body.warrantyExpiry ? new Date(body.warrantyExpiry) : null,
        specifications: body.specifications,
        notes: body.notes,
        createdBy: body.createdBy,
        nextInspectionDue: body.nextInspectionDue ? new Date(body.nextInspectionDue) : null
      }
    });

    return asset;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const asset = await this.prisma.asset.update({
      where: { id },
      data: {
        name: body.name,
        type: body.type,
        category: body.category,
        location: body.location,
        manufacturer: body.manufacturer,
        model: body.model,
        serialNumber: body.serialNumber,
        status: body.status,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : undefined,
        warrantyExpiry: body.warrantyExpiry ? new Date(body.warrantyExpiry) : undefined,
        specifications: body.specifications,
        notes: body.notes,
        nextInspectionDue: body.nextInspectionDue ? new Date(body.nextInspectionDue) : undefined
      }
    });

    return asset;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    // Check if asset has active work orders
    const activeWorkOrders = await this.prisma.workOrderAsset.count({
      where: {
        assetId: id,
        workOrder: {
          status: { in: ['pending', 'in-progress'] }
        }
      }
    });

    if (activeWorkOrders > 0) {
      throw new Error('Cannot delete asset with active work orders');
    }

    await this.prisma.asset.delete({
      where: { id }
    });

    return { message: 'Asset deleted successfully' };
  }

  @Get(':id/work-orders')
  async getAssetWorkOrders(@Param('id') id: string, @Query() query: any) {
    const { status, limit = 10, offset = 0 } = query;

    const where: any = { assetId: id };
    if (status) {
      where.workOrder = { status };
    }

    const workOrderAssets = await this.prisma.workOrderAsset.findMany({
      where,
      include: {
        workOrder: {
          include: {
            inspections: {
              include: { template: true }
            }
          }
        },
        asset: true
      },
      orderBy: {
        workOrder: { createdAt: 'desc' }
      },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    return workOrderAssets.map(wo => ({
      ...wo.workOrder,
      assetNotes: wo.notes,
      assetPriority: wo.priority
    }));
  }

  @Post(':id/maintenance-schedule')
  async updateMaintenanceSchedule(@Param('id') id: string, @Body() body: any) {
    const asset = await this.prisma.asset.update({
      where: { id },
      data: {
        nextInspectionDue: body.nextInspectionDue ? new Date(body.nextInspectionDue) : null
      }
    });

    return asset;
  }
}
