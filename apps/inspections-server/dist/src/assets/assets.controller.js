"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let AssetsController = class AssetsController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(query) {
        const { category, status, type, location, search, page = 1, limit = 20, sortBy = 'updatedAt', sortOrder = 'desc' } = query;
        const where = {};
        if (category)
            where.category = category;
        if (status)
            where.status = status;
        if (type)
            where.type = type;
        if (location)
            where.location = { contains: location, mode: 'insensitive' };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { assetId: { contains: search, mode: 'insensitive' } },
                { serialNumber: { contains: search, mode: 'insensitive' } },
                { manufacturer: { contains: search, mode: 'insensitive' } },
                { model: { contains: search, mode: 'insensitive' } }
            ];
        }
        const [assets, total] = await Promise.all([
            this.prisma.asset.findMany({
                where,
                orderBy: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    workOrders: {
                        include: {
                            workOrder: {
                                select: {
                                    id: true,
                                    workOrderId: true,
                                    title: true,
                                    status: true,
                                    createdAt: true
                                }
                            }
                        }
                    }
                }
            }),
            this.prisma.asset.count({ where })
        ]);
        return {
            data: assets.map(asset => ({
                ...asset,
                workOrderCount: asset.workOrders.length,
                recentWorkOrders: asset.workOrders
                    .sort((a, b) => new Date(b.workOrder.createdAt).getTime() - new Date(a.workOrder.createdAt).getTime())
                    .slice(0, 3)
                    .map(wo => wo.workOrder)
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async getCategories() {
        const categories = await this.prisma.asset.groupBy({
            by: ['category'],
            _count: { category: true },
            orderBy: { _count: { category: 'desc' } }
        });
        return categories.map(cat => ({
            name: cat.category,
            count: cat._count.category
        }));
    }
    async getTypes() {
        const types = await this.prisma.asset.groupBy({
            by: ['type'],
            _count: { type: true },
            orderBy: { _count: { type: 'desc' } }
        });
        return types.map(type => ({
            name: type.type,
            count: type._count.type
        }));
    }
    async getLocations() {
        const locations = await this.prisma.asset.findMany({
            select: { location: true },
            where: { location: { not: null } },
            distinct: ['location']
        });
        return locations
            .map(l => l.location)
            .filter(Boolean)
            .sort();
    }
    async get(id) {
        const asset = await this.prisma.asset.findUnique({
            where: { id },
            include: {
                workOrders: {
                    include: {
                        workOrder: {
                            include: {
                                inspections: {
                                    include: { template: true }
                                }
                            }
                        }
                    },
                    orderBy: {
                        workOrder: { createdAt: 'desc' }
                    }
                }
            }
        });
        if (!asset) {
            throw new Error('Asset not found');
        }
        return {
            ...asset,
            workOrderHistory: asset.workOrders.map(wo => ({
                ...wo.workOrder,
                assetNotes: wo.notes,
                assetPriority: wo.priority
            }))
        };
    }
    async create(body) {
        const asset = await this.prisma.asset.create({
            data: {
                assetId: body.assetId || `AST-${Date.now()}`,
                name: body.name,
                type: body.type,
                category: body.category || 'Equipment',
                location: body.location,
                manufacturer: body.manufacturer,
                model: body.model,
                serialNumber: body.serialNumber,
                status: body.status || 'active',
                purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
                warrantyExpiry: body.warrantyExpiry ? new Date(body.warrantyExpiry) : null,
                specifications: body.specifications,
                notes: body.notes,
                createdBy: body.createdBy,
                nextInspectionDue: body.nextInspectionDue ? new Date(body.nextInspectionDue) : null
            }
        });
        return asset;
    }
    async update(id, body) {
        const asset = await this.prisma.asset.update({
            where: { id },
            data: {
                name: body.name,
                type: body.type,
                category: body.category,
                location: body.location,
                manufacturer: body.manufacturer,
                model: body.model,
                serialNumber: body.serialNumber,
                status: body.status,
                purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : undefined,
                warrantyExpiry: body.warrantyExpiry ? new Date(body.warrantyExpiry) : undefined,
                specifications: body.specifications,
                notes: body.notes,
                nextInspectionDue: body.nextInspectionDue ? new Date(body.nextInspectionDue) : undefined
            }
        });
        return asset;
    }
    async delete(id) {
        const activeWorkOrders = await this.prisma.workOrderAsset.count({
            where: {
                assetId: id,
                workOrder: {
                    status: { in: ['pending', 'in-progress'] }
                }
            }
        });
        if (activeWorkOrders > 0) {
            throw new Error('Cannot delete asset with active work orders');
        }
        await this.prisma.asset.delete({
            where: { id }
        });
        return { message: 'Asset deleted successfully' };
    }
    async getAssetWorkOrders(id, query) {
        const { status, limit = 10, offset = 0 } = query;
        const where = { assetId: id };
        if (status) {
            where.workOrder = { status };
        }
        const workOrderAssets = await this.prisma.workOrderAsset.findMany({
            where,
            include: {
                workOrder: {
                    include: {
                        inspections: {
                            include: { template: true }
                        }
                    }
                },
                asset: true
            },
            orderBy: {
                workOrder: { createdAt: 'desc' }
            },
            take: parseInt(limit),
            skip: parseInt(offset)
        });
        return workOrderAssets.map(wo => ({
            ...wo.workOrder,
            assetNotes: wo.notes,
            assetPriority: wo.priority
        }));
    }
    async updateMaintenanceSchedule(id, body) {
        const asset = await this.prisma.asset.update({
            where: { id },
            data: {
                nextInspectionDue: body.nextInspectionDue ? new Date(body.nextInspectionDue) : null
            }
        });
        return asset;
    }
};
exports.AssetsController = AssetsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "getTypes", null);
__decorate([
    (0, common_1.Get)('locations'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "getLocations", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)(':id/work-orders'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "getAssetWorkOrders", null);
__decorate([
    (0, common_1.Post)(':id/maintenance-schedule'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "updateMaintenanceSchedule", null);
exports.AssetsController = AssetsController = __decorate([
    (0, common_1.Controller)('assets'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AssetsController);
//# sourceMappingURL=assets.controller.js.map