import { PrismaService } from '../prisma.service';
export declare class InspectionsController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(): Promise<{
        id: string;
        inspectionId: string;
        workOrderId: string;
        templateId: string;
        status: string;
        required: boolean;
        order: number;
        completedAt: Date | null;
        resultJson: import("@prisma/client/runtime/library").JsonValue;
        template: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            templateId: string;
            description: string;
            schemaJson: import("@prisma/client/runtime/library").JsonValue;
        };
        workOrder: {
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
        };
    }[]>;
    get(id: string): Promise<{
        inspection_id: string;
        template_id: string;
        template_name: string;
        template_description: string;
        status: string;
        required: boolean;
        completed_at: Date | undefined;
        result: string | number | boolean | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray | undefined;
        order: number;
        work_order_id: string;
    } | null>;
    create(body: any): Promise<{
        id: string;
        inspectionId: string;
        workOrderId: string;
        templateId: string;
        status: string;
        required: boolean;
        order: number;
        completedAt: Date | null;
        resultJson: import("@prisma/client/runtime/library").JsonValue;
        template: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            templateId: string;
            description: string;
            schemaJson: import("@prisma/client/runtime/library").JsonValue;
        };
        workOrder: {
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
        };
    }>;
    update(id: string, body: any): Promise<{
        id: string;
        inspectionId: string;
        workOrderId: string;
        templateId: string;
        status: string;
        required: boolean;
        order: number;
        completedAt: Date | null;
        resultJson: import("@prisma/client/runtime/library").JsonValue;
        template: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            templateId: string;
            description: string;
            schemaJson: import("@prisma/client/runtime/library").JsonValue;
        };
        workOrder: {
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
        };
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
    complete(id: string, body: any): Promise<{
        inspection_id: string;
        status: string;
        completed_at: Date | undefined;
        result: string | number | boolean | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray | undefined;
    }>;
}
