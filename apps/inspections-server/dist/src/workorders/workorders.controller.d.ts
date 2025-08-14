import { PrismaService } from '../prisma.service';
export declare class WorkOrdersController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(): Promise<{
        id: any;
        workOrderId: any;
        title: any;
        description: any;
        createdAt: any;
        updatedAt: any;
        dueDate: any;
        status: any;
        assignedTo: any;
        location: any;
        priority: any;
        inspections: any;
    }[]>;
    get(id: string): Promise<{
        id: string;
        workOrderId: string;
        title: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        dueDate: Date | undefined;
        status: string;
        assignedTo: string;
        location: string | undefined;
        priority: string;
        inspections: {
            id: any;
            inspectionId: any;
            workOrderId: any;
            templateId: any;
            status: any;
            required: any;
            order: any;
            completedAt: any;
            resultJson: any;
            template: any;
        }[];
    } | null>;
    create(body: any): Promise<{
        id: any;
        workOrderId: any;
        title: any;
        description: any;
        createdAt: any;
        updatedAt: any;
        dueDate: any;
        status: any;
        assignedTo: any;
        location: any;
        priority: any;
        estimatedDuration: any;
        requiredSkills: any;
        dependencies: any;
        createdBy: any;
        workOrderTemplate: any;
        assets: any;
        inspections: any;
    }>;
    update(id: string, body: any): Promise<{
        id: string;
        workOrderId: string;
        title: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        dueDate: Date | undefined;
        status: string;
        assignedTo: string;
        location: string | undefined;
        priority: string;
        inspections: {
            id: any;
            inspectionId: any;
            workOrderId: any;
            templateId: any;
            status: any;
            required: any;
            order: any;
            completedAt: any;
            resultJson: any;
            template: any;
        }[];
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
    private formatWorkOrderResponse;
}
