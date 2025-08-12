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
            work_order_id: wo.id,
            title: wo.title,
            description: wo.description,
            created_at: wo.createdAt,
            due_date: wo.dueDate ?? undefined,
            status: wo.status,
            assigned_to: wo.assignedTo,
            location: wo.location ?? undefined,
            priority: wo.priority,
            inspections: wo.inspections.map((i) => ({
                inspection_id: i.id,
                template_id: i.templateId,
                template_name: i.template?.name ?? 'Template',
                template_description: i.template?.description ?? '',
                status: i.status,
                required: i.required,
                completed_at: i.completedAt ?? undefined,
                result: i.resultJson ?? undefined,
                order: i.order,
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
            work_order_id: wo.id,
            title: wo.title,
            description: wo.description,
            created_at: wo.createdAt,
            due_date: wo.dueDate ?? undefined,
            status: wo.status,
            assigned_to: wo.assignedTo,
            location: wo.location ?? undefined,
            priority: wo.priority,
            inspections: wo.inspections.map((i) => ({
                inspection_id: i.id,
                template_id: i.templateId,
                template_name: i.template?.name ?? 'Template',
                template_description: i.template?.description ?? '',
                status: i.status,
                required: i.required,
                completed_at: i.completedAt ?? undefined,
                result: i.resultJson ?? undefined,
                order: i.order,
            })),
        };
    }
    async create(body) {
        const created = await this.prisma.workOrder.create({ data: body });
        return created;
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
exports.WorkOrdersController = WorkOrdersController = __decorate([
    (0, common_1.Controller)('work-orders'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkOrdersController);
//# sourceMappingURL=workorders.controller.js.map