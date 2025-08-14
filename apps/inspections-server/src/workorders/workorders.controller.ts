import { Body, Controller, Get, Param, Post, Put, Delete, Query } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('work-orders')
export class WorkOrdersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list() {
    const items = await this.prisma.workOrder.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        inspections: {
          orderBy: { order: 'asc' },
          include: { template: true },
        },
      },
    });
    return items.map((wo: any) => ({
      id: wo.id,
      workOrderId: wo.workOrderId,
      title: wo.title,
      description: wo.description,
      createdAt: wo.createdAt,
      updatedAt: wo.updatedAt,
      dueDate: wo.dueDate ?? undefined,
      status: wo.status,
      assignedTo: wo.assignedTo,
      location: wo.location ?? undefined,
      priority: wo.priority,
      inspections: wo.inspections.map((i: any) => ({
        id: i.id,
        inspectionId: i.inspectionId,
        workOrderId: i.workOrderId,
        templateId: i.templateId,
        status: i.status,
        required: i.required,
        order: i.order,
        completedAt: i.completedAt ?? undefined,
        resultJson: i.resultJson ?? undefined,
        template: i.template,
      })),
    }));
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const wo = await this.prisma.workOrder.findUnique({
      where: { id },
      include: {
        inspections: { orderBy: { order: 'asc' }, include: { template: true } },
      },
    });
    if (!wo) return null;
    return {
      id: wo.id,
      workOrderId: wo.workOrderId,
      title: wo.title,
      description: wo.description,
      createdAt: wo.createdAt,
      updatedAt: wo.updatedAt,
      dueDate: wo.dueDate ?? undefined,
      status: wo.status,
      assignedTo: wo.assignedTo,
      location: wo.location ?? undefined,
      priority: wo.priority,
      inspections: wo.inspections.map((i: any) => ({
        id: i.id,
        inspectionId: i.inspectionId,
        workOrderId: i.workOrderId,
        templateId: i.templateId,
        status: i.status,
        required: i.required,
        order: i.order,
        completedAt: i.completedAt ?? undefined,
        resultJson: i.resultJson ?? undefined,
        template: i.template,
      })),
    };
  }

  @Post()
  async create(@Body() body: any) {
    const workOrder = await this.prisma.workOrder.create({
      data: {
        workOrderId: body.workOrderId || `WO-${Date.now()}`,
        title: body.title,
        description: body.description,
        status: body.status || 'pending',
        priority: body.priority || 'medium',
        assignedTo: body.assignedTo,
        location: body.location,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        estimatedDuration: body.estimatedDuration,
        requiredSkills: body.requiredSkills || [],
        workOrderTemplateId: body.workOrderTemplateId,
        createdBy: body.createdBy,
        dependencies: body.dependencies || []
      },
      include: {
        inspections: {
          orderBy: { order: 'asc' },
          include: { template: true },
        },
        assets: {
          include: { asset: true }
        },
        workOrderTemplate: true
      },
    });

    // Create inspections if templateIds provided
    if (body.templateIds && body.templateIds.length > 0) {
      const inspections = body.templateIds.map((templateId: string, index: number) => ({
        inspectionId: `INS-${Date.now()}-${index}`,
        workOrderId: workOrder.id,
        templateId: templateId,
        status: 'not-started',
        required: body.requiredInspections?.[index] ?? true,
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
        priority: body.priority || 'medium',
        notes: body.assetNotes || ''
      }));

      await this.prisma.workOrderAsset.createMany({
        data: workOrderAssets
      });
    }

    // Return complete work order with all relations
    const completeWorkOrder = await this.prisma.workOrder.findUnique({
      where: { id: workOrder.id },
      include: {
        inspections: {
          orderBy: { order: 'asc' },
          include: { template: true },
        },
        assets: {
          include: { asset: true }
        },
        workOrderTemplate: true
      }
    });

    return this.formatWorkOrderResponse(completeWorkOrder);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const workOrder = await this.prisma.workOrder.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        status: body.status,
        priority: body.priority,
        assignedTo: body.assignedTo,
        location: body.location,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
      },
      include: {
        inspections: {
          orderBy: { order: 'asc' },
          include: { template: true },
        },
      },
    });

    return {
      id: workOrder.id,
      workOrderId: workOrder.workOrderId,
      title: workOrder.title,
      description: workOrder.description,
      createdAt: workOrder.createdAt,
      updatedAt: workOrder.updatedAt,
      dueDate: workOrder.dueDate ?? undefined,
      status: workOrder.status,
      assignedTo: workOrder.assignedTo,
      location: workOrder.location ?? undefined,
      priority: workOrder.priority,
      inspections: workOrder.inspections.map((i: any) => ({
        id: i.id,
        inspectionId: i.inspectionId,
        workOrderId: i.workOrderId,
        templateId: i.templateId,
        status: i.status,
        required: i.required,
        order: i.order,
        completedAt: i.completedAt ?? undefined,
        resultJson: i.resultJson ?? undefined,
        template: i.template,
      })),
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    // First delete related inspections
    await this.prisma.inspection.deleteMany({
      where: { workOrderId: id },
    });

    // Then delete the work order
    await this.prisma.workOrder.delete({
      where: { id },
    });

    return { success: true };
  }

  private formatWorkOrderResponse(wo: any) {
    return {
      id: wo.id,
      workOrderId: wo.workOrderId,
      title: wo.title,
      description: wo.description,
      createdAt: wo.createdAt,
      updatedAt: wo.updatedAt,
      dueDate: wo.dueDate ?? undefined,
      status: wo.status,
      assignedTo: wo.assignedTo,
      location: wo.location ?? undefined,
      priority: wo.priority,
      estimatedDuration: wo.estimatedDuration,
      requiredSkills: wo.requiredSkills || [],
      dependencies: wo.dependencies || [],
      createdBy: wo.createdBy,
      workOrderTemplate: wo.workOrderTemplate,
      assets: wo.assets?.map((wa: any) => ({
        ...wa.asset,
        workOrderAssetId: wa.id,
        notes: wa.notes,
        priority: wa.priority
      })) || [],
      inspections: wo.inspections?.map((i: any) => ({
        id: i.id,
        inspectionId: i.inspectionId,
        workOrderId: i.workOrderId,
        templateId: i.templateId,
        status: i.status,
        required: i.required,
        order: i.order,
        completedAt: i.completedAt ?? undefined,
        resultJson: i.resultJson ?? undefined,
        template: i.template,
      })) || [],
    };
  }
}


