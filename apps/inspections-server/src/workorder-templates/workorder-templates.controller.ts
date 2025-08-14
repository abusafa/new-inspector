import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

interface WorkOrderTemplateQueryDto {
  category?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Controller('work-order-templates')
export class WorkOrderTemplatesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query() query: WorkOrderTemplateQueryDto) {
    const {
      category,
      isActive,
      search,
      page = 1,
      limit = 20,
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = query;

    // Build where clause
    const where: any = {};
    
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive === true;
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [templates, total] = await Promise.all([
      this.prisma.workOrderTemplate.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          workOrders: {
            select: {
              id: true,
              workOrderId: true,
              title: true,
              status: true,
              createdAt: true
            }
          },
          recurringSchedules: {
            select: {
              id: true,
              name: true,
              isActive: true,
              nextDue: true
            }
          }
        }
      }),
      this.prisma.workOrderTemplate.count({ where })
    ]);

    return {
      data: templates.map(template => ({
        ...template,
        usageCount: template.workOrders.length,
        activeSchedules: template.recurringSchedules.filter(s => s.isActive).length,
        recentWorkOrders: template.workOrders
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
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
    const categories = await this.prisma.workOrderTemplate.groupBy({
      by: ['category'],
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } }
    });

    return categories.map(cat => ({
      name: cat.category,
      count: cat._count.category
    }));
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const template = await this.prisma.workOrderTemplate.findUnique({
      where: { id },
      include: {
        workOrders: {
          include: {
            inspections: {
              include: { template: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        recurringSchedules: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!template) {
      throw new Error('Work order template not found');
    }

    // Get inspection templates referenced by this work order template
    const inspectionTemplates = await this.prisma.inspectionTemplate.findMany({
      where: {
        id: { in: template.inspectionTemplateIds }
      },
      select: {
        id: true,
        templateId: true,
        name: true,
        description: true,
        category: true,
        estimatedDuration: true
      }
    });

    return {
      ...template,
      inspectionTemplates,
      statistics: {
        totalWorkOrders: template.workOrders.length,
        completedWorkOrders: template.workOrders.filter(wo => wo.status === 'completed').length,
        activeRecurringSchedules: template.recurringSchedules.filter(rs => rs.isActive).length,
        avgCompletionTime: this.calculateAvgCompletionTime(template.workOrders)
      }
    };
  }

  @Post()
  async create(@Body() body: any) {
    const template = await this.prisma.workOrderTemplate.create({
      data: {
        name: body.name,
        description: body.description,
        category: body.category,
        priority: body.priority || 'medium',
        estimatedDuration: body.estimatedDuration,
        defaultAssignee: body.defaultAssignee,
        requiredSkills: body.requiredSkills || [],
        inspectionTemplateIds: body.inspectionTemplateIds || [],
        checklist: body.checklist || [],
        notifications: body.notifications || [],
        isActive: body.isActive ?? true,
        createdBy: body.createdBy
      }
    });

    return template;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const template = await this.prisma.workOrderTemplate.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        category: body.category,
        priority: body.priority,
        estimatedDuration: body.estimatedDuration,
        defaultAssignee: body.defaultAssignee,
        requiredSkills: body.requiredSkills,
        inspectionTemplateIds: body.inspectionTemplateIds,
        checklist: body.checklist,
        notifications: body.notifications,
        isActive: body.isActive
      }
    });

    return template;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    // Check if template has active work orders or recurring schedules
    const [activeWorkOrders, activeSchedules] = await Promise.all([
      this.prisma.workOrder.count({
        where: {
          workOrderTemplateId: id,
          status: { in: ['pending', 'in-progress'] }
        }
      }),
      this.prisma.recurringSchedule.count({
        where: {
          workOrderTemplateId: id,
          isActive: true
        }
      })
    ]);

    if (activeWorkOrders > 0 || activeSchedules > 0) {
      throw new Error('Cannot delete template with active work orders or recurring schedules');
    }

    await this.prisma.workOrderTemplate.delete({
      where: { id }
    });

    return { message: 'Work order template deleted successfully' };
  }

  @Post(':id/duplicate')
  async duplicate(@Param('id') id: string, @Body() body: any) {
    const originalTemplate = await this.prisma.workOrderTemplate.findUnique({
      where: { id }
    });

    if (!originalTemplate) {
      throw new Error('Template not found');
    }

    const duplicatedTemplate = await this.prisma.workOrderTemplate.create({
      data: {
        name: body.name || `${originalTemplate.name} (Copy)`,
        description: body.description || originalTemplate.description,
        category: originalTemplate.category,
        priority: originalTemplate.priority,
        estimatedDuration: originalTemplate.estimatedDuration,
        defaultAssignee: originalTemplate.defaultAssignee,
        requiredSkills: originalTemplate.requiredSkills,
        inspectionTemplateIds: originalTemplate.inspectionTemplateIds,
        checklist: originalTemplate.checklist as Prisma.InputJsonValue,
        notifications: originalTemplate.notifications as Prisma.InputJsonValue,
        isActive: body.isActive ?? false, // Start as inactive by default
        createdBy: body.createdBy
      }
    });

    return duplicatedTemplate;
  }

  @Post(':id/create-work-order')
  async createWorkOrderFromTemplate(@Param('id') id: string, @Body() body: any) {
    const template = await this.prisma.workOrderTemplate.findUnique({
      where: { id }
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // Create work order from template
    const workOrder = await this.prisma.workOrder.create({
      data: {
        workOrderId: body.workOrderId || `WO-${Date.now()}`,
        title: body.title || template.name,
        description: body.description || template.description,
        assignedTo: body.assignedTo || template.defaultAssignee || '',
        location: body.location,
        priority: body.priority || template.priority,
        status: 'pending',
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        estimatedDuration: template.estimatedDuration,
        requiredSkills: template.requiredSkills,
        workOrderTemplateId: id,
        createdBy: body.createdBy
      }
    });

    // Create inspections from template's inspection templates
    if (template.inspectionTemplateIds.length > 0) {
      const inspections = template.inspectionTemplateIds.map((templateId, index) => ({
        inspectionId: `INS-${Date.now()}-${index}`,
        workOrderId: workOrder.id,
        templateId: templateId,
        status: 'not-started',
        required: true,
        order: index + 1
      }));

      await this.prisma.inspection.createMany({
        data: inspections
      });
    }

    // Link assets if provided
    if (body.assetIds && body.assetIds.length > 0) {
      const workOrderAssets = body.assetIds.map((assetId: string) => ({
        workOrderId: workOrder.id,
        assetId: assetId,
        priority: body.priority || template.priority,
        notes: body.assetNotes || ''
      }));

      await this.prisma.workOrderAsset.createMany({
        data: workOrderAssets
      });
    }

    // Return complete work order with relations
    return this.prisma.workOrder.findUnique({
      where: { id: workOrder.id },
      include: {
        inspections: {
          include: { template: true },
          orderBy: { order: 'asc' }
        },
        assets: {
          include: { asset: true }
        },
        workOrderTemplate: true
      }
    });
  }

  private calculateAvgCompletionTime(workOrders: any[]): number {
    const completedOrders = workOrders.filter(wo => 
      wo.status === 'completed' && wo.completedAt && wo.createdAt
    );

    if (completedOrders.length === 0) return 0;

    const totalTime = completedOrders.reduce((sum, wo) => {
      const duration = new Date(wo.completedAt).getTime() - new Date(wo.createdAt).getTime();
      return sum + (duration / (1000 * 60 * 60)); // Convert to hours
    }, 0);

    return Math.round(totalTime / completedOrders.length * 100) / 100;
  }
}
