import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

interface RecurringScheduleQueryDto {
  isActive?: boolean;
  frequency?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Controller('recurring-schedules')
export class RecurringSchedulesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query() query: RecurringScheduleQueryDto) {
    const {
      isActive,
      frequency,
      search,
      page = 1,
      limit = 20,
      sortBy = 'nextDue',
      sortOrder = 'asc'
    } = query;

    // Build where clause
    const where: any = {};
    
    if (isActive !== undefined) where.isActive = isActive === true;
    if (frequency) where.frequency = frequency;
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [schedules, total] = await Promise.all([
      this.prisma.recurringSchedule.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          workOrderTemplate: {
            select: {
              id: true,
              name: true,
              category: true,
              estimatedDuration: true
            }
          }
        }
      }),
      this.prisma.recurringSchedule.count({ where })
    ]);

    return {
      data: schedules.map(schedule => ({
        ...schedule,
        nextDueIn: this.calculateTimeUntilNext(schedule.nextDue),
        isOverdue: schedule.nextDue ? new Date(schedule.nextDue) < new Date() : false
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  @Get('due-today')
  async getDueToday() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const schedules = await this.prisma.recurringSchedule.findMany({
      where: {
        isActive: true,
        nextDue: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        workOrderTemplate: true
      }
    });

    return schedules;
  }

  @Get('overdue')
  async getOverdue() {
    const now = new Date();

    const schedules = await this.prisma.recurringSchedule.findMany({
      where: {
        isActive: true,
        nextDue: {
          lt: now
        }
      },
      include: {
        workOrderTemplate: true
      },
      orderBy: {
        nextDue: 'asc'
      }
    });

    return schedules;
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const schedule = await this.prisma.recurringSchedule.findUnique({
      where: { id },
      include: {
        workOrderTemplate: {
          include: {
            workOrders: {
              where: {
                // Only show work orders created from this schedule
                createdAt: {
                  gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
                }
              },
              orderBy: { createdAt: 'desc' },
              take: 20
            }
          }
        }
      }
    });

    if (!schedule) {
      throw new Error('Recurring schedule not found');
    }

    return {
      ...schedule,
      nextDueIn: this.calculateTimeUntilNext(schedule.nextDue),
      isOverdue: schedule.nextDue ? new Date(schedule.nextDue) < new Date() : false,
      recentWorkOrders: schedule.workOrderTemplate.workOrders
    };
  }

  @Post()
  async create(@Body() body: any) {
    const nextDue = this.calculateNextDue(body);

    const schedule = await this.prisma.recurringSchedule.create({
      data: {
        name: body.name,
        description: body.description,
        workOrderTemplateId: body.workOrderTemplateId,
        assignedTo: body.assignedTo,
        assignedGroup: body.assignedGroup,
        location: body.location,
        priority: body.priority || 'medium',
        frequency: body.frequency,
        interval: body.interval || 1,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        daysOfWeek: body.daysOfWeek || [],
        dayOfMonth: body.dayOfMonth,
        time: body.time,
        timezone: body.timezone || 'UTC',
        isActive: body.isActive ?? true,
        createdBy: body.createdBy,
        nextDue
      },
      include: {
        workOrderTemplate: true
      }
    });

    return schedule;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const nextDue = body.frequency ? this.calculateNextDue(body) : undefined;

    const schedule = await this.prisma.recurringSchedule.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        assignedTo: body.assignedTo,
        assignedGroup: body.assignedGroup,
        location: body.location,
        priority: body.priority,
        frequency: body.frequency,
        interval: body.interval,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        daysOfWeek: body.daysOfWeek,
        dayOfMonth: body.dayOfMonth,
        time: body.time,
        timezone: body.timezone,
        isActive: body.isActive,
        nextDue: nextDue
      },
      include: {
        workOrderTemplate: true
      }
    });

    return schedule;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.prisma.recurringSchedule.delete({
      where: { id }
    });

    return { message: 'Recurring schedule deleted successfully' };
  }

  @Post(':id/generate-work-order')
  async generateWorkOrder(@Param('id') id: string, @Body() body: any) {
    const schedule = await this.prisma.recurringSchedule.findUnique({
      where: { id },
      include: {
        workOrderTemplate: true
      }
    });

    if (!schedule) {
      throw new Error('Schedule not found');
    }

    const template = schedule.workOrderTemplate;

    // Create work order from schedule
    const workOrder = await this.prisma.workOrder.create({
      data: {
        workOrderId: `WO-${Date.now()}`,
        title: `${template.name} - ${schedule.name}`,
        description: template.description,
        assignedTo: schedule.assignedTo || template.defaultAssignee || '',
        location: schedule.location,
        priority: schedule.priority,
        status: 'pending',
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        estimatedDuration: template.estimatedDuration,
        requiredSkills: template.requiredSkills,
        workOrderTemplateId: template.id,
        createdBy: 'system'
      }
    });

    // Create inspections from template
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

    // Update schedule statistics and next due date
    const nextDue = this.calculateNextDue(schedule);
    await this.prisma.recurringSchedule.update({
      where: { id },
      data: {
        lastGenerated: new Date(),
        nextDue,
        totalGenerated: { increment: 1 }
      }
    });

    return this.prisma.workOrder.findUnique({
      where: { id: workOrder.id },
      include: {
        inspections: {
          include: { template: true },
          orderBy: { order: 'asc' }
        },
        workOrderTemplate: true
      }
    });
  }

  @Post(':id/toggle-active')
  async toggleActive(@Param('id') id: string) {
    const schedule = await this.prisma.recurringSchedule.findUnique({
      where: { id },
      select: { isActive: true }
    });

    if (!schedule) {
      throw new Error('Schedule not found');
    }

    const updatedSchedule = await this.prisma.recurringSchedule.update({
      where: { id },
      data: { isActive: !schedule.isActive }
    });

    return updatedSchedule;
  }

  private calculateNextDue(scheduleData: any): Date {
    const now = new Date();
    const startDate = new Date(scheduleData.startDate);
    let nextDue = new Date(Math.max(now.getTime(), startDate.getTime()));

    switch (scheduleData.frequency) {
      case 'daily':
        nextDue.setDate(nextDue.getDate() + (scheduleData.interval || 1));
        break;
      case 'weekly':
        nextDue.setDate(nextDue.getDate() + (7 * (scheduleData.interval || 1)));
        break;
      case 'monthly':
        nextDue.setMonth(nextDue.getMonth() + (scheduleData.interval || 1));
        if (scheduleData.dayOfMonth) {
          nextDue.setDate(scheduleData.dayOfMonth);
        }
        break;
      case 'quarterly':
        nextDue.setMonth(nextDue.getMonth() + (3 * (scheduleData.interval || 1)));
        break;
      case 'yearly':
        nextDue.setFullYear(nextDue.getFullYear() + (scheduleData.interval || 1));
        break;
    }

    // Set time if specified
    if (scheduleData.time) {
      const [hours, minutes] = scheduleData.time.split(':');
      nextDue.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }

    return nextDue;
  }

  private calculateTimeUntilNext(nextDue: Date | null): string {
    if (!nextDue) return 'Not scheduled';

    const now = new Date();
    const diff = nextDue.getTime() - now.getTime();

    if (diff < 0) return 'Overdue';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} days`;
    if (hours > 0) return `${hours} hours`;
    return 'Less than 1 hour';
  }
}
