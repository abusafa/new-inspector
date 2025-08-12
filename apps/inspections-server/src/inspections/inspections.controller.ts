import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('inspections')
export class InspectionsController {
  constructor(private readonly prisma: PrismaService) {}

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


