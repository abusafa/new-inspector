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
exports.TemplatesController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let TemplatesController = class TemplatesController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list() {
        const items = await this.prisma.inspectionTemplate.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return items.map((t) => ({
            id: t.id,
            templateId: t.templateId,
            name: t.name,
            description: t.description,
            schemaJson: t.schemaJson,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
        }));
    }
    async get(id) {
        const item = await this.prisma.inspectionTemplate.findUnique({ where: { id } });
        if (!item)
            return null;
        return {
            id: item.id,
            templateId: item.templateId,
            name: item.name,
            description: item.description,
            schemaJson: item.schemaJson,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        };
    }
    async create(body) {
        const template = await this.prisma.inspectionTemplate.create({
            data: {
                templateId: body.templateId || `TPL-${Date.now()}`,
                name: body.name,
                description: body.description,
                schemaJson: body.schemaJson || {},
            },
        });
        return {
            id: template.id,
            templateId: template.templateId,
            name: template.name,
            description: template.description,
            schemaJson: template.schemaJson,
            createdAt: template.createdAt,
            updatedAt: template.updatedAt,
        };
    }
    async update(id, body) {
        const template = await this.prisma.inspectionTemplate.update({
            where: { id },
            data: {
                name: body.name,
                description: body.description,
                schemaJson: body.schemaJson,
            },
        });
        return {
            id: template.id,
            templateId: template.templateId,
            name: template.name,
            description: template.description,
            schemaJson: template.schemaJson,
            createdAt: template.createdAt,
            updatedAt: template.updatedAt,
        };
    }
    async delete(id) {
        await this.prisma.inspection.deleteMany({
            where: { templateId: id },
        });
        await this.prisma.inspectionTemplate.delete({
            where: { id },
        });
        return { success: true };
    }
};
exports.TemplatesController = TemplatesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "delete", null);
exports.TemplatesController = TemplatesController = __decorate([
    (0, common_1.Controller)('templates'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TemplatesController);
//# sourceMappingURL=templates.controller.js.map