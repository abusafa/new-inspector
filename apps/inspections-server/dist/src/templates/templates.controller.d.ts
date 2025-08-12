import { PrismaService } from '../prisma.service';
export declare class TemplatesController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(): Promise<{
        id: string;
        templateId: string;
        name: string;
        description: string;
        schemaJson: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    get(id: string): Promise<{
        id: string;
        templateId: string;
        name: string;
        description: string;
        schemaJson: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    create(body: any): Promise<{
        id: string;
        templateId: string;
        name: string;
        description: string;
        schemaJson: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, body: any): Promise<{
        id: string;
        templateId: string;
        name: string;
        description: string;
        schemaJson: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
