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
exports.WorkOrdersController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let WorkOrdersController = class WorkOrdersController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list() {
        const items = await this.prisma.workOrder.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                inspections: {
                    orderBy: { order: 'asc' },
                    include: { template: true },
                },
            },
        });
        return items.map((wo) => ({
            id: wo.id,
            workOrderId: wo.workOrderId,
            title: wo.title,
            description: wo.description,
            createdAt: wo.createdAt,
            updatedAt: wo.updatedAt,
            dueDate: wo.dueDate ?? undefined,
            status: wo.status,
            assignedTo: wo.assignedTo,
            location: wo.location ?? undefined,
            priority: wo.priority,
            inspections: wo.inspections.map((i) => ({
                id: i.id,
                inspectionId: i.inspectionId,
                workOrderId: i.workOrderId,
                templateId: i.templateId,
                status: i.status,
                required: i.required,
                order: i.order,
                completedAt: i.completedAt ?? undefined,
                resultJson: i.resultJson ?? undefined,
                template: i.template,
            })),
        }));
    }
    async get(id) {
        const wo = await this.prisma.workOrder.findUnique({
            where: { id },
            include: {
                inspections: { orderBy: { order: 'asc' }, include: { template: true } },
            },
        });
        if (!wo)
            return null;
        return {
            id: wo.id,
            workOrderId: wo.workOrderId,
            title: wo.title,
            description: wo.description,
            createdAt: wo.createdAt,
            updatedAt: wo.updatedAt,
            dueDate: wo.dueDate ?? undefined,
            status: wo.status,
            assignedTo: wo.assignedTo,
            location: wo.location ?? undefined,
            priority: wo.priority,
            inspections: wo.inspections.map((i) => ({
                id: i.id,
                inspectionId: i.inspectionId,
                workOrderId: i.workOrderId,
                templateId: i.templateId,
                status: i.status,
                required: i.required,
                order: i.order,
                completedAt: i.completedAt ?? undefined,
                resultJson: i.resultJson ?? undefined,
                template: i.template,
            })),
        };
    }
    async create(body) {
        const workOrder = await this.prisma.workOrder.create({
            data: {
                workOrderId: body.workOrderId || `WO-${Date.now()}`,
                title: body.title,
                description: body.description,
                status: body.status || 'pending',
                priority: body.priority || 'medium',
                assignedTo: body.assignedTo,
                location: body.location,
                dueDate: body.dueDate ? new Date(body.dueDate) : null,
            },
            include: {
                inspections: {
                    orderBy: { order: 'asc' },
                    include: { template: true },
                },
            },
        });
        return {
            id: workOrder.id,
            workOrderId: workOrder.workOrderId,
            title: workOrder.title,
            description: workOrder.description,
            createdAt: workOrder.createdAt,
            updatedAt: workOrder.updatedAt,
            dueDate: workOrder.dueDate ?? undefined,
            status: workOrder.status,
            assignedTo: workOrder.assignedTo,
            location: workOrder.location ?? undefined,
            priority: workOrder.priority,
            inspections: workOrder.inspections.map((i) => ({
                id: i.id,
                inspectionId: i.inspectionId,
                workOrderId: i.workOrderId,
                templateId: i.templateId,
                status: i.status,
                required: i.required,
                order: i.order,
                completedAt: i.completedAt ?? undefined,
                resultJson: i.resultJson ?? undefined,
                template: i.template,
            })),
        };
    }
    async update(id, body) {
        const workOrder = await this.prisma.workOrder.update({
            where: { id },
            data: {
                title: body.title,
                description: body.description,
                status: body.status,
                priority: body.priority,
                assignedTo: body.assignedTo,
                location: body.location,
                dueDate: body.dueDate ? new Date(body.dueDate) : null,
            },
            include: {
                inspections: {
                    orderBy: { order: 'asc' },
                    include: { template: true },
                },
            },
        });
        return {
            id: workOrder.id,
            workOrderId: workOrder.workOrderId,
            title: workOrder.title,
            description: workOrder.description,
            createdAt: workOrder.createdAt,
            updatedAt: workOrder.updatedAt,
            dueDate: workOrder.dueDate ?? undefined,
            status: workOrder.status,
            assignedTo: workOrder.assignedTo,
            location: workOrder.location ?? undefined,
            priority: workOrder.priority,
            inspections: workOrder.inspections.map((i) => ({
                id: i.id,
                inspectionId: i.inspectionId,
                workOrderId: i.workOrderId,
                templateId: i.templateId,
                status: i.status,
                required: i.required,
                order: i.order,
                completedAt: i.completedAt ?? undefined,
                resultJson: i.resultJson ?? undefined,
                template: i.template,
            })),
        };
    }
    async delete(id) {
        await this.prisma.inspection.deleteMany({
            where: { workOrderId: id },
        });
        await this.prisma.workOrder.delete({
            where: { id },
        });
        return { success: true };
    }
};
exports.WorkOrdersController = WorkOrdersController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorkOrdersController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkOrdersController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkOrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkOrdersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkOrdersController.prototype, "delete", null);
exports.WorkOrdersController = WorkOrdersController = __decorate([
    (0, common_1.Controller)('work-orders'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkOrdersController);
//# sourceMappingURL=workorders.controller.js.map