import { Body, Controller, Get, Param, Post, Put, Delete } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('inspections')
export class InspectionsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list() {
    const items = await this.prisma.inspection.findMany({
      orderBy: { order: 'asc' },
      include: { template: true, workOrder: true },
    });
    return items.map((i) => ({
      id: i.id,
      inspectionId: i.inspectionId,
      workOrderId: i.workOrderId,
      templateId: i.templateId,
      status: i.status,
      required: i.required,
      order: i.order,
      completedAt: i.completedAt,
      resultJson: i.resultJson,
      template: i.template,
      workOrder: i.workOrder,
    }));
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const i = await this.prisma.inspection.findUnique({
      where: { id },
      include: { template: true, workOrder: true },
    });
    if (!i) return null;
    return {
      inspection_id: i.id,
      template_id: i.templateId,
      template_name: i.template?.name ?? 'Template',
      template_description: i.template?.description ?? '',
      status: i.status,
      required: i.required,
      completed_at: i.completedAt ?? undefined,
      result: i.resultJson ?? undefined,
      order: i.order,
      work_order_id: i.workOrderId,
    };
  }

  @Post()
  async create(@Body() body: any) {
    const {
      inspectionId,
      workOrderId,
      templateId,
      status = 'not-started',
      required = true,
      order = 1,
      resultJson = {},
    } = body;

    const inspection = await this.prisma.inspection.create({
      data: {
        inspectionId,
        workOrderId,
        templateId,
        status,
        required,
        order,
        resultJson,
      },
      include: { template: true, workOrder: true },
    });

    return {
      id: inspection.id,
      inspectionId: inspection.inspectionId,
      workOrderId: inspection.workOrderId,
      templateId: inspection.templateId,
      status: inspection.status,
      required: inspection.required,
      order: inspection.order,
      completedAt: inspection.completedAt,
      resultJson: inspection.resultJson,
      template: inspection.template,
      workOrder: inspection.workOrder,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const {
      inspectionId,
      workOrderId,
      templateId,
      status,
      required,
      order,
      resultJson,
    } = body;

    const inspection = await this.prisma.inspection.update({
      where: { id },
      data: {
        ...(inspectionId && { inspectionId }),
        ...(workOrderId && { workOrderId }),
        ...(templateId && { templateId }),
        ...(status && { status }),
        ...(required !== undefined && { required }),
        ...(order !== undefined && { order }),
        ...(resultJson && { resultJson }),
        ...(status === 'completed' && { completedAt: new Date() }),
      },
      include: { template: true, workOrder: true },
    });

    return {
      id: inspection.id,
      inspectionId: inspection.inspectionId,
      workOrderId: inspection.workOrderId,
      templateId: inspection.templateId,
      status: inspection.status,
      required: inspection.required,
      order: inspection.order,
      completedAt: inspection.completedAt,
      resultJson: inspection.resultJson,
      template: inspection.template,
      workOrder: inspection.workOrder,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.prisma.inspection.delete({
      where: { id },
    });
    return { success: true };
  }

  @Post(':id/complete')
  async complete(@Param('id') id: string, @Body() body: any) {
    const { resultJson } = body;
    const updated = await this.prisma.inspection.update({
      where: { id },
      data: { status: 'completed', completedAt: new Date(), resultJson },
    });
    return {
      inspection_id: updated.id,
      status: updated.status,
      completed_at: updated.completedAt ?? undefined,
      result: updated.resultJson ?? undefined,
    };
  }
}


