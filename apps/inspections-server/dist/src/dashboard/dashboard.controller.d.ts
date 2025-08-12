import { PrismaService } from '../prisma.service';
export declare class DashboardController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getStats(): Promise<{
        totalWorkOrders: number;
        activeWorkOrders: number;
        completedInspections: number;
        pendingInspections: number;
        totalUsers: number;
        totalTemplates: number;
        recentActivity: {
            id: string;
            type: string;
            title: string;
            description: string;
            timestamp: string;
            user: string;
        }[];
    }>;
}
