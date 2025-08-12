import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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
    return items.map((wo) => ({
      work_order_id: wo.id,
      title: wo.title,
      description: wo.description,
      created_at: wo.createdAt,
      due_date: wo.dueDate ?? undefined,
      status: wo.status as any,
      assigned_to: wo.assignedTo,
      location: wo.location ?? undefined,
      priority: wo.priority as any,
      inspections: wo.inspections.map((i) => ({
        inspection_id: i.id,
        template_id: i.templateId,
        template_name: i.template?.name ?? 'Template',
        template_description: i.template?.description ?? '',
        status: i.status as any,
        required: i.required,
        completed_at: i.completedAt ?? undefined,
        result: i.resultJson ?? undefined,
        order: i.order,
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
      work_order_id: wo.id,
      title: wo.title,
      description: wo.description,
      created_at: wo.createdAt,
      due_date: wo.dueDate ?? undefined,
      status: wo.status as any,
      assigned_to: wo.assignedTo,
      location: wo.location ?? undefined,
      priority: wo.priority as any,
      inspections: wo.inspections.map((i) => ({
        inspection_id: i.id,
        template_id: i.templateId,
        template_name: i.template?.name ?? 'Template',
        template_description: i.template?.description ?? '',
        status: i.status as any,
        required: i.required,
        completed_at: i.completedAt ?? undefined,
        result: i.resultJson ?? undefined,
        order: i.order,
      })),
    };
  }

  @Post()
  async create(@Body() body: any) {
    // Expecting create payload with camelCase fields matching prisma
    const created = await this.prisma.workOrder.create({ data: body });
    return created;
  }
}


