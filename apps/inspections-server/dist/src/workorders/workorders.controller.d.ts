import { PrismaService } from '../prisma.service';
export declare class WorkOrdersController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(): Promise<{
        work_order_id: string;
        title: string;
        description: string;
        created_at: Date;
        due_date: Date | undefined;
        status: any;
        assigned_to: string;
        location: string | undefined;
        priority: any;
        inspections: {
            inspection_id: string;
            template_id: string;
            template_name: string;
            template_description: string;
            status: any;
            required: boolean;
            completed_at: Date | undefined;
            result: string | number | boolean | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray | undefined;
            order: number;
        }[];
    }[]>;
    get(id: string): Promise<{
        work_order_id: string;
        title: string;
        description: string;
        created_at: Date;
        due_date: Date | undefined;
        status: any;
        assigned_to: string;
        location: string | undefined;
        priority: any;
        inspections: {
            inspection_id: string;
            template_id: string;
            template_name: string;
            template_description: string;
            status: any;
            required: boolean;
            completed_at: Date | undefined;
            result: string | number | boolean | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray | undefined;
            order: number;
        }[];
    } | null>;
    create(body: any): Promise<{
        id: string;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        workOrderId: string;
        title: string;
        dueDate: Date | null;
        status: string;
        assignedTo: string;
        priority: string;
    }>;
}
