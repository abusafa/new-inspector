import { PrismaService } from '../prisma.service';
import { CreateTemplateDto, UpdateTemplateDto, DuplicateTemplateDto, TemplateQueryDto } from './dto/template.dto';
export declare class TemplatesController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(query: TemplateQueryDto): Promise<{
        data: {
            usageCount: number;
            name: string;
            description: string;
            templateId: string;
            category: string;
            tags: string[];
            version: string;
            status: string;
            isPublic: boolean;
            createdBy: string | null;
            estimatedDuration: number | null;
            difficulty: string | null;
            industry: string | null;
            equipmentType: string | null;
            lastModifiedBy: string | null;
            createdAt: Date;
            updatedAt: Date;
            id: string;
            isLatestVersion: boolean;
            _count: {
                inspections: number;
            };
        }[];
        pagination: {
            page: any;
            limit: any;
            total: number;
            pages: number;
        };
    }>;
    getCategories(): Promise<{
        name: string;
        count: number;
    }[]>;
    getTags(): Promise<{
        name: string;
        count: number;
    }[]>;
    get(id: string): Promise<{
        usageCount: number;
        _count: {
            inspections: number;
        };
        name: string;
        description: string;
        schemaJson: import("@prisma/client/runtime/library").JsonValue;
        templateId: string;
        category: string;
        tags: string[];
        version: string;
        status: string;
        isPublic: boolean;
        createdBy: string | null;
        estimatedDuration: number | null;
        difficulty: string | null;
        industry: string | null;
        equipmentType: string | null;
        lastModifiedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: string;
        parentId: string | null;
        isLatestVersion: boolean;
    }>;
    preview(id: string): Promise<{
        valid: boolean;
        errors: {
            property: string;
            constraints: {
                [type: string]: string;
            } | undefined;
        }[];
        template: import("@prisma/client/runtime/library").JsonValue;
        metadata?: undefined;
    } | {
        valid: boolean;
        errors: never[];
        template: import("@prisma/client/runtime/library").JsonValue;
        metadata: {
            totalQuestions: number;
            totalSections: number;
            estimatedDuration: number | null;
            difficulty: string | null;
        };
    } | {
        valid: boolean;
        errors: {
            message: string;
        }[];
        template: import("@prisma/client/runtime/library").JsonValue;
        metadata?: undefined;
    }>;
    getVersions(id: string): Promise<{
        name: string;
        templateId: string;
        version: string;
        status: string;
        createdBy: string | null;
        createdAt: Date;
        id: string;
        isLatestVersion: boolean;
    }[]>;
    create(createTemplateDto: CreateTemplateDto): Promise<{
        name: string;
        description: string;
        schemaJson: import("@prisma/client/runtime/library").JsonValue;
        templateId: string;
        category: string;
        tags: string[];
        version: string;
        status: string;
        isPublic: boolean;
        createdBy: string | null;
        estimatedDuration: number | null;
        difficulty: string | null;
        industry: string | null;
        equipmentType: string | null;
        lastModifiedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: string;
        parentId: string | null;
        isLatestVersion: boolean;
    }>;
    duplicate(id: string, duplicateDto: DuplicateTemplateDto): Promise<{
        name: string;
        description: string;
        schemaJson: import("@prisma/client/runtime/library").JsonValue;
        templateId: string;
        category: string;
        tags: string[];
        version: string;
        status: string;
        isPublic: boolean;
        createdBy: string | null;
        estimatedDuration: number | null;
        difficulty: string | null;
        industry: string | null;
        equipmentType: string | null;
        lastModifiedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: string;
        parentId: string | null;
        isLatestVersion: boolean;
    }>;
    createNewVersion(id: string, body: {
        version: string;
        createdBy?: string;
    }): Promise<{
        name: string;
        description: string;
        schemaJson: import("@prisma/client/runtime/library").JsonValue;
        templateId: string;
        category: string;
        tags: string[];
        version: string;
        status: string;
        isPublic: boolean;
        createdBy: string | null;
        estimatedDuration: number | null;
        difficulty: string | null;
        industry: string | null;
        equipmentType: string | null;
        lastModifiedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: string;
        parentId: string | null;
        isLatestVersion: boolean;
    }>;
    update(id: string, updateTemplateDto: UpdateTemplateDto): Promise<{
        name: string;
        description: string;
        schemaJson: import("@prisma/client/runtime/library").JsonValue;
        templateId: string;
        category: string;
        tags: string[];
        version: string;
        status: string;
        isPublic: boolean;
        createdBy: string | null;
        estimatedDuration: number | null;
        difficulty: string | null;
        industry: string | null;
        equipmentType: string | null;
        lastModifiedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: string;
        parentId: string | null;
        isLatestVersion: boolean;
    }>;
    publish(id: string, body: {
        publishedBy?: string;
    }): Promise<{
        name: string;
        description: string;
        schemaJson: import("@prisma/client/runtime/library").JsonValue;
        templateId: string;
        category: string;
        tags: string[];
        version: string;
        status: string;
        isPublic: boolean;
        createdBy: string | null;
        estimatedDuration: number | null;
        difficulty: string | null;
        industry: string | null;
        equipmentType: string | null;
        lastModifiedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: string;
        parentId: string | null;
        isLatestVersion: boolean;
    }>;
    archive(id: string, body: {
        archivedBy?: string;
    }): Promise<{
        name: string;
        description: string;
        schemaJson: import("@prisma/client/runtime/library").JsonValue;
        templateId: string;
        category: string;
        tags: string[];
        version: string;
        status: string;
        isPublic: boolean;
        createdBy: string | null;
        estimatedDuration: number | null;
        difficulty: string | null;
        industry: string | null;
        equipmentType: string | null;
        lastModifiedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: string;
        parentId: string | null;
        isLatestVersion: boolean;
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
    private countQuestions;
    private countQuestionsInItems;
    private countSections;
    private countSectionsInItems;
    private getDefaultSchema;
}
