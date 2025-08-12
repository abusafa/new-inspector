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
exports.InspectionsController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let InspectionsController = class InspectionsController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async get(id) {
        const i = await this.prisma.inspection.findUnique({
            where: { id },
            include: { template: true, workOrder: true },
        });
        if (!i)
            return null;
        return {
            inspection_id: i.id,
            template_id: i.templateId,
            template_name: i.template?.name ?? 'Template',
            template_description: i.template?.description ?? '',
            status: i.status,
            required: i.required,
            completed_at: i.completedAt ?? undefined,
            result: i.resultJson ?? undefined,
            order: i.order,
            work_order_id: i.workOrderId,
        };
    }
    async complete(id, body) {
        const { resultJson } = body;
        const updated = await this.prisma.inspection.update({
            where: { id },
            data: { status: 'completed', completedAt: new Date(), resultJson },
        });
        return {
            inspection_id: updated.id,
            status: updated.status,
            completed_at: updated.completedAt ?? undefined,
            result: updated.resultJson ?? undefined,
        };
    }
};
exports.InspectionsController = InspectionsController;
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InspectionsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InspectionsController.prototype, "complete", null);
exports.InspectionsController = InspectionsController = __decorate([
    (0, common_1.Controller)('inspections'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InspectionsController);
//# sourceMappingURL=inspections.controller.js.map