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
exports.WorkOrderTemplatesController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let WorkOrderTemplatesController = class WorkOrderTemplatesController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(query) {
        const { category, isActive, search, page = 1, limit = 20, sortBy = 'updatedAt', sortOrder = 'desc' } = query;
        const where = {};
        if (category)
            where.category = category;
        if (isActive !== undefined)
            where.isActive = isActive === true;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { category: { contains: search, mode: 'insensitive' } }
            ];
        }
        const [templates, total] = await Promise.all([
            this.prisma.workOrderTemplate.findMany({
                where,
                orderBy: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    workOrders: {
                        select: {
                            id: true,
                            workOrderId: true,
                            title: true,
                            status: true,
                            createdAt: true
                        }
                    },
                    recurringSchedules: {
                        select: {
                            id: true,
                            name: true,
                            isActive: true,
                            nextDue: true
                        }
                    }
                }
            }),
            this.prisma.workOrderTemplate.count({ where })
        ]);
        return {
            data: templates.map(template => ({
                ...template,
                usageCount: template.workOrders.length,
                activeSchedules: template.recurringSchedules.filter(s => s.isActive).length,
                recentWorkOrders: template.workOrders
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5)
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
        const categories = await this.prisma.workOrderTemplate.groupBy({
            by: ['category'],
            _count: { category: true },
            orderBy: { _count: { category: 'desc' } }
        });
        return categories.map(cat => ({
            name: cat.category,
            count: cat._count.category
        }));
    }
    async get(id) {
        const template = await this.prisma.workOrderTemplate.findUnique({
            where: { id },
            include: {
                workOrders: {
                    include: {
                        inspections: {
                            include: { template: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                recurringSchedules: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        if (!template) {
            throw new Error('Work order template not found');
        }
        const inspectionTemplates = await this.prisma.inspectionTemplate.findMany({
            where: {
                id: { in: template.inspectionTemplateIds }
            },
            select: {
                id: true,
                templateId: true,
                name: true,
                description: true,
                category: true,
                estimatedDuration: true
            }
        });
        return {
            ...template,
            inspectionTemplates,
            statistics: {
                totalWorkOrders: template.workOrders.length,
                completedWorkOrders: template.workOrders.filter(wo => wo.status === 'completed').length,
                activeRecurringSchedules: template.recurringSchedules.filter(rs => rs.isActive).length,
                avgCompletionTime: this.calculateAvgCompletionTime(template.workOrders)
            }
        };
    }
    async create(body) {
        const template = await this.prisma.workOrderTemplate.create({
            data: {
                name: body.name,
                description: body.description,
                category: body.category,
                priority: body.priority || 'medium',
                estimatedDuration: body.estimatedDuration,
                defaultAssignee: body.defaultAssignee,
                requiredSkills: body.requiredSkills || [],
                inspectionTemplateIds: body.inspectionTemplateIds || [],
                checklist: body.checklist || [],
                notifications: body.notifications || [],
                isActive: body.isActive ?? true,
                createdBy: body.createdBy
            }
        });
        return template;
    }
    async update(id, body) {
        const template = await this.prisma.workOrderTemplate.update({
            where: { id },
            data: {
                name: body.name,
                description: body.description,
                category: body.category,
                priority: body.priority,
                estimatedDuration: body.estimatedDuration,
                defaultAssignee: body.defaultAssignee,
                requiredSkills: body.requiredSkills,
                inspectionTemplateIds: body.inspectionTemplateIds,
                checklist: body.checklist,
                notifications: body.notifications,
                isActive: body.isActive
            }
        });
        return template;
    }
    async delete(id) {
        const [activeWorkOrders, activeSchedules] = await Promise.all([
            this.prisma.workOrder.count({
                where: {
                    workOrderTemplateId: id,
                    status: { in: ['pending', 'in-progress'] }
                }
            }),
            this.prisma.recurringSchedule.count({
                where: {
                    workOrderTemplateId: id,
                    isActive: true
                }
            })
        ]);
        if (activeWorkOrders > 0 || activeSchedules > 0) {
            throw new Error('Cannot delete template with active work orders or recurring schedules');
        }
        await this.prisma.workOrderTemplate.delete({
            where: { id }
        });
        return { message: 'Work order template deleted successfully' };
    }
    async duplicate(id, body) {
        const originalTemplate = await this.prisma.workOrderTemplate.findUnique({
            where: { id }
        });
        if (!originalTemplate) {
            throw new Error('Template not found');
        }
        const duplicatedTemplate = await this.prisma.workOrderTemplate.create({
            data: {
                name: body.name || `${originalTemplate.name} (Copy)`,
                description: body.description || originalTemplate.description,
                category: originalTemplate.category,
                priority: originalTemplate.priority,
                estimatedDuration: originalTemplate.estimatedDuration,
                defaultAssignee: originalTemplate.defaultAssignee,
                requiredSkills: originalTemplate.requiredSkills,
                inspectionTemplateIds: originalTemplate.inspectionTemplateIds,
                checklist: originalTemplate.checklist,
                notifications: originalTemplate.notifications,
                isActive: body.isActive ?? false,
                createdBy: body.createdBy
            }
        });
        return duplicatedTemplate;
    }
    async createWorkOrderFromTemplate(id, body) {
        const template = await this.prisma.workOrderTemplate.findUnique({
            where: { id }
        });
        if (!template) {
            throw new Error('Template not found');
        }
        const workOrder = await this.prisma.workOrder.create({
            data: {
                workOrderId: body.workOrderId || `WO-${Date.now()}`,
                title: body.title || template.name,
                description: body.description || template.description,
                assignedTo: body.assignedTo || template.defaultAssignee || '',
                location: body.location,
                priority: body.priority || template.priority,
                status: 'pending',
                dueDate: body.dueDate ? new Date(body.dueDate) : null,
                estimatedDuration: template.estimatedDuration,
                requiredSkills: template.requiredSkills,
                workOrderTemplateId: id,
                createdBy: body.createdBy
            }
        });
        if (template.inspectionTemplateIds.length > 0) {
            const inspections = template.inspectionTemplateIds.map((templateId, index) => ({
                inspectionId: `INS-${Date.now()}-${index}`,
                workOrderId: workOrder.id,
                templateId: templateId,
                status: 'not-started',
                required: true,
                order: index + 1
            }));
            await this.prisma.inspection.createMany({
                data: inspections
            });
        }
        if (body.assetIds && body.assetIds.length > 0) {
            const workOrderAssets = body.assetIds.map((assetId) => ({
                workOrderId: workOrder.id,
                assetId: assetId,
                priority: body.priority || template.priority,
                notes: body.assetNotes || ''
            }));
            await this.prisma.workOrderAsset.createMany({
                data: workOrderAssets
            });
        }
        return this.prisma.workOrder.findUnique({
            where: { id: workOrder.id },
            include: {
                inspections: {
                    include: { template: true },
                    orderBy: { order: 'asc' }
                },
                assets: {
                    include: { asset: true }
                },
                workOrderTemplate: true
            }
        });
    }
    calculateAvgCompletionTime(workOrders) {
        const completedOrders = workOrders.filter(wo => wo.status === 'completed' && wo.completedAt && wo.createdAt);
        if (completedOrders.length === 0)
            return 0;
        const totalTime = completedOrders.reduce((sum, wo) => {
            const duration = new Date(wo.completedAt).getTime() - new Date(wo.createdAt).getTime();
            return sum + (duration / (1000 * 60 * 60));
        }, 0);
        return Math.round(totalTime / completedOrders.length * 100) / 100;
    }
};
exports.WorkOrderTemplatesController = WorkOrderTemplatesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkOrderTemplatesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorkOrderTemplatesController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkOrderTemplatesController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkOrderTemplatesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkOrderTemplatesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkOrderTemplatesController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/duplicate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkOrderTemplatesController.prototype, "duplicate", null);
__decorate([
    (0, common_1.Post)(':id/create-work-order'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkOrderTemplatesController.prototype, "createWorkOrderFromTemplate", null);
exports.WorkOrderTemplatesController = WorkOrderTemplatesController = __decorate([
    (0, common_1.Controller)('work-order-templates'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkOrderTemplatesController);
//# sourceMappingURL=workorder-templates.controller.js.map