import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('stats')
  async getStats() {
    const [workOrders, inspections, users, templates] = await Promise.all([
      this.prisma.workOrder.findMany({
        include: {
          inspections: true,
        },
      }),
      this.prisma.inspection.findMany(),
      this.prisma.user.findMany(),
      this.prisma.inspectionTemplate.findMany(),
    ]);

    const totalWorkOrders = workOrders.length;
    const activeWorkOrders = workOrders.filter(wo => wo.status !== 'completed').length;
    const completedInspections = inspections.filter(i => i.status === 'completed').length;
    const pendingInspections = inspections.filter(i => i.status !== 'completed').length;

    // Generate recent activity from actual data
    const recentActivity = [
      ...workOrders.slice(0, 3).map(wo => ({
        id: wo.id,
        type: 'work_order_created',
        title: 'Work Order Created',
        description: wo.title,
        timestamp: wo.createdAt.toISOString(),
        user: wo.assignedTo,
      })),
      ...inspections
        .filter(i => i.completedAt)
        .slice(0, 2)
        .map(i => ({
          id: i.id,
          type: 'inspection_completed',
          title: 'Inspection Completed',
          description: `Inspection ${i.inspectionId} completed`,
          timestamp: i.completedAt!.toISOString(),
          user: 'Inspector',
        })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      totalWorkOrders,
      activeWorkOrders,
      completedInspections,
      pendingInspections,
      totalUsers: users.length,
      totalTemplates: templates.length,
      recentActivity,
    };
  }
}
