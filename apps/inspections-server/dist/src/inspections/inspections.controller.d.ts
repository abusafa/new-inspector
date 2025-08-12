import { PrismaService } from '../prisma.service';
export declare class InspectionsController {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    complete(id: string, body: any): Promise<{
        inspection_id: string;
        status: string;
        completed_at: Date | undefined;
        result: string | number | boolean | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray | undefined;
    }>;
}
