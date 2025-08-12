import { PrismaService } from '../prisma.service';
export declare class TemplatesController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(): Promise<{
        id: string;
        name: string;
        description: string;
    }[]>;
    get(id: string): Promise<{
        id: string;
        name: string;
        description: string;
        schema: import("@prisma/client/runtime/library").JsonValue;
    } | null>;
}
