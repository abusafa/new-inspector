import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
interface WorkOrderTemplateQueryDto {
    category?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class WorkOrderTemplatesController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(query: WorkOrderTemplateQueryDto): Promise<{
        data: {
            usageCount: number;
            activeSchedules: number;
            recentWorkOrders: {
                id: string;
                createdAt: Date;
                status: string;
                workOrderId: string;
                title: string;
            }[];
            workOrders: {
                id: string;
                createdAt: Date;
                status: string;
                workOrderId: string;
                title: string;
            }[];
            recurringSchedules: {
                id: string;
                name: string;
                isActive: boolean;
                nextDue: Date | null;
            }[];
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            notifications: Prisma.JsonValue;
            description: string;
            category: string;
            createdBy: string | null;
            estimatedDuration: number;
            priority: string;
            requiredSkills: string[];
            defaultAssignee: string | null;
            inspectionTemplateIds: string[];
            checklist: Prisma.JsonValue;
            isActive: boolean;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getCategories(): Promise<{
        name: string;
        count: number;
    }[]>;
    get(id: string): Promise<{
        inspectionTemplates: {
            id: string;
            name: string;
            templateId: string;
            description: string;
            category: string;
            estimatedDuration: number | null;
        }[];
        statistics: {
            totalWorkOrders: number;
            completedWorkOrders: number;
            activeRecurringSchedules: number;
            avgCompletionTime: number;
        };
        workOrders: ({
            inspections: ({
                template: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    templateId: string;
                    description: string;
                    schemaJson: Prisma.JsonValue;
                    category: string;
                    tags: string[];
                    version: string;
                    status: string;
                    isPublic: boolean;
                    createdBy: string | null;
                    lastModifiedBy: string | null;
                    estimatedDuration: number | null;
                    difficulty: string | null;
                    industry: string | null;
                    equipmentType: string | null;
                    parentId: string | null;
                    isLatestVersion: boolean;
                };
            } & {
                required: boolean;
                id: string;
                templateId: string;
                status: string;
                workOrderId: string;
                inspectionId: string;
                order: number;
                completedAt: Date | null;
                resultJson: Prisma.JsonValue | null;
            })[];
        } & {
            id: string;
            location: string | null;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            status: string;
            createdBy: string | null;
            estimatedDuration: number | null;
            workOrderId: string;
            title: string;
            dueDate: Date | null;
            assignedTo: string;
            priority: string;
            requiredSkills: string[];
            dependencies: string[];
            workOrderTemplateId: string | null;
        })[];
        recurringSchedules: {
            id: string;
            name: string;
            location: string | null;
            createdAt: Date;
            updatedAt: Date;
            timezone: string;
            description: string;
            createdBy: string | null;
            assignedTo: string | null;
            priority: string;
            workOrderTemplateId: string;
            isActive: boolean;
            assignedGroup: string | null;
            frequency: string;
            interval: number;
            startDate: Date;
            endDate: Date | null;
            daysOfWeek: number[];
            dayOfMonth: number | null;
            time: string | null;
            lastGenerated: Date | null;
            nextDue: Date | null;
            totalGenerated: number;
            completedCount: number;
            overdueCount: number;
        }[];
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        notifications: Prisma.JsonValue;
        description: string;
        category: string;
        createdBy: string | null;
        estimatedDuration: number;
        priority: string;
        requiredSkills: string[];
        defaultAssignee: string | null;
        inspectionTemplateIds: string[];
        checklist: Prisma.JsonValue;
        isActive: boolean;
    }>;
    create(body: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        notifications: Prisma.JsonValue;
        description: string;
        category: string;
        createdBy: string | null;
        estimatedDuration: number;
        priority: string;
        requiredSkills: string[];
        defaultAssignee: string | null;
        inspectionTemplateIds: string[];
        checklist: Prisma.JsonValue;
        isActive: boolean;
    }>;
    update(id: string, body: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        notifications: Prisma.JsonValue;
        description: string;
        category: string;
        createdBy: string | null;
        estimatedDuration: number;
        priority: string;
        requiredSkills: string[];
        defaultAssignee: string | null;
        inspectionTemplateIds: string[];
        checklist: Prisma.JsonValue;
        isActive: boolean;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
    duplicate(id: string, body: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        notifications: Prisma.JsonValue;
        description: string;
        category: string;
        createdBy: string | null;
        estimatedDuration: number;
        priority: string;
        requiredSkills: string[];
        defaultAssignee: string | null;
        inspectionTemplateIds: string[];
        checklist: Prisma.JsonValue;
        isActive: boolean;
    }>;
    createWorkOrderFromTemplate(id: string, body: any): Promise<({
        inspections: ({
            template: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                templateId: string;
                description: string;
                schemaJson: Prisma.JsonValue;
                category: string;
                tags: string[];
                version: string;
                status: string;
                isPublic: boolean;
                createdBy: string | null;
                lastModifiedBy: string | null;
                estimatedDuration: number | null;
                difficulty: string | null;
                industry: string | null;
                equipmentType: string | null;
                parentId: string | null;
                isLatestVersion: boolean;
            };
        } & {
            required: boolean;
            id: string;
            templateId: string;
            status: string;
            workOrderId: string;
            inspectionId: string;
            order: number;
            completedAt: Date | null;
            resultJson: Prisma.JsonValue | null;
        })[];
        assets: ({
            asset: {
                id: string;
                name: string;
                location: string | null;
                createdAt: Date;
                updatedAt: Date;
                category: string;
                status: string;
                createdBy: string | null;
                assetId: string;
                type: string;
                manufacturer: string | null;
                model: string | null;
                serialNumber: string | null;
                lastInspected: Date | null;
                nextInspectionDue: Date | null;
                purchaseDate: Date | null;
                warrantyExpiry: Date | null;
                specifications: Prisma.JsonValue | null;
                notes: string | null;
            };
        } & {
            id: string;
            workOrderId: string;
            priority: string;
            assetId: string;
            notes: string | null;
        })[];
        workOrderTemplate: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            notifications: Prisma.JsonValue;
            description: string;
            category: string;
            createdBy: string | null;
            estimatedDuration: number;
            priority: string;
            requiredSkills: string[];
            defaultAssignee: string | null;
            inspectionTemplateIds: string[];
            checklist: Prisma.JsonValue;
            isActive: boolean;
        } | null;
    } & {
        id: string;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        status: string;
        createdBy: string | null;
        estimatedDuration: number | null;
        workOrderId: string;
        title: string;
        dueDate: Date | null;
        assignedTo: string;
        priority: string;
        requiredSkills: string[];
        dependencies: string[];
        workOrderTemplateId: string | null;
    }) | null>;
    private calculateAvgCompletionTime;
}
export {};
