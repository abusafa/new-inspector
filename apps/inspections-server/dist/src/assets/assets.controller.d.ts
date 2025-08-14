import { PrismaService } from '../prisma.service';
interface AssetQueryDto {
    category?: string;
    status?: string;
    type?: string;
    location?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class AssetsController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(query: AssetQueryDto): Promise<{
        data: {
            workOrderCount: number;
            recentWorkOrders: {
                id: string;
                createdAt: Date;
                status: string;
                workOrderId: string;
                title: string;
            }[];
            workOrders: ({
                workOrder: {
                    id: string;
                    createdAt: Date;
                    status: string;
                    workOrderId: string;
                    title: string;
                };
            } & {
                id: string;
                workOrderId: string;
                priority: string;
                assetId: string;
                notes: string | null;
            })[];
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
            specifications: import("@prisma/client/runtime/library").JsonValue | null;
            notes: string | null;
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
    getTypes(): Promise<{
        name: string;
        count: number;
    }[]>;
    getLocations(): Promise<(string | null)[]>;
    get(id: string): Promise<{
        workOrderHistory: {
            assetNotes: string | null;
            assetPriority: string;
            inspections: ({
                template: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    templateId: string;
                    description: string;
                    schemaJson: import("@prisma/client/runtime/library").JsonValue;
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
                resultJson: import("@prisma/client/runtime/library").JsonValue | null;
            })[];
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
        }[];
        workOrders: ({
            workOrder: {
                inspections: ({
                    template: {
                        id: string;
                        name: string;
                        createdAt: Date;
                        updatedAt: Date;
                        templateId: string;
                        description: string;
                        schemaJson: import("@prisma/client/runtime/library").JsonValue;
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
                    resultJson: import("@prisma/client/runtime/library").JsonValue | null;
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
            };
        } & {
            id: string;
            workOrderId: string;
            priority: string;
            assetId: string;
            notes: string | null;
        })[];
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
        specifications: import("@prisma/client/runtime/library").JsonValue | null;
        notes: string | null;
    }>;
    create(body: any): Promise<{
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
        specifications: import("@prisma/client/runtime/library").JsonValue | null;
        notes: string | null;
    }>;
    update(id: string, body: any): Promise<{
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
        specifications: import("@prisma/client/runtime/library").JsonValue | null;
        notes: string | null;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
    getAssetWorkOrders(id: string, query: any): Promise<{
        assetNotes: string | null;
        assetPriority: string;
        inspections: ({
            template: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                templateId: string;
                description: string;
                schemaJson: import("@prisma/client/runtime/library").JsonValue;
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
            resultJson: import("@prisma/client/runtime/library").JsonValue | null;
        })[];
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
    }[]>;
    updateMaintenanceSchedule(id: string, body: any): Promise<{
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
        specifications: import("@prisma/client/runtime/library").JsonValue | null;
        notes: string | null;
    }>;
}
export {};
