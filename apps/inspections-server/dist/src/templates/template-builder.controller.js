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
exports.TemplateBuilderController = void 0;
const common_1 = require("@nestjs/common");
const template_builder_service_1 = require("./template-builder.service");
let TemplateBuilderController = class TemplateBuilderController {
    builderService;
    constructor(builderService) {
        this.builderService = builderService;
    }
    getComponents() {
        return this.builderService.getComponents();
    }
    getPatterns() {
        return [
            {
                id: 'safety_inspection',
                name: 'Safety Inspection',
                description: 'Comprehensive workplace safety checklist',
                category: 'Safety',
                icon: 'shield',
                estimatedDuration: 15
            },
            {
                id: 'equipment_check',
                name: 'Equipment Check',
                description: 'Pre-use equipment inspection',
                category: 'Equipment',
                icon: 'tool',
                estimatedDuration: 10
            },
            {
                id: 'quality_audit',
                name: 'Quality Audit',
                description: 'Quality control audit checklist',
                category: 'Quality',
                icon: 'check-circle',
                estimatedDuration: 30
            },
            {
                id: 'maintenance_log',
                name: 'Maintenance Log',
                description: 'Equipment maintenance record',
                category: 'Maintenance',
                icon: 'wrench',
                estimatedDuration: 20
            }
        ];
    }
    async generateFromPattern(patternType, options) {
        return await this.builderService.generateFromPattern(patternType, options);
    }
    async applyOperations(templateId, body) {
        return await this.builderService.applyOperations(templateId, body.operations);
    }
    async addComponent(templateId, body) {
        const components = this.builderService.getComponents();
        const component = components.find(c => c.id === body.componentType);
        if (!component) {
            throw new Error(`Component type '${body.componentType}' not found`);
        }
        const operation = {
            type: 'add',
            parentId: body.parentId,
            position: body.position,
            data: {
                ...component.defaultConfig,
                ...body.customConfig
            }
        };
        return await this.builderService.applyOperations(templateId, [operation]);
    }
    async updateItem(templateId, itemId, updateData) {
        const operation = {
            type: 'update',
            targetId: itemId,
            data: updateData
        };
        return await this.builderService.applyOperations(templateId, [operation]);
    }
    async duplicateItem(templateId, itemId, body) {
        const operation = {
            type: 'duplicate',
            targetId: itemId,
            parentId: body.parentId,
            position: body.position
        };
        return await this.builderService.applyOperations(templateId, [operation]);
    }
    async moveItem(templateId, itemId, body) {
        const operation = {
            type: 'move',
            targetId: itemId,
            parentId: body.parentId,
            position: body.position
        };
        return await this.builderService.applyOperations(templateId, [operation]);
    }
    async deleteItem(templateId, itemId) {
        const operation = {
            type: 'delete',
            targetId: itemId
        };
        return await this.builderService.applyOperations(templateId, [operation]);
    }
};
exports.TemplateBuilderController = TemplateBuilderController;
__decorate([
    (0, common_1.Get)('components'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TemplateBuilderController.prototype, "getComponents", null);
__decorate([
    (0, common_1.Get)('patterns'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TemplateBuilderController.prototype, "getPatterns", null);
__decorate([
    (0, common_1.Post)('generate/:patternType'),
    __param(0, (0, common_1.Param)('patternType')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TemplateBuilderController.prototype, "generateFromPattern", null);
__decorate([
    (0, common_1.Post)(':templateId/operations'),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TemplateBuilderController.prototype, "applyOperations", null);
__decorate([
    (0, common_1.Post)(':templateId/add-component'),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TemplateBuilderController.prototype, "addComponent", null);
__decorate([
    (0, common_1.Put)(':templateId/update-item/:itemId'),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TemplateBuilderController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Post)(':templateId/duplicate-item/:itemId'),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TemplateBuilderController.prototype, "duplicateItem", null);
__decorate([
    (0, common_1.Post)(':templateId/move-item/:itemId'),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TemplateBuilderController.prototype, "moveItem", null);
__decorate([
    (0, common_1.Post)(':templateId/delete-item/:itemId'),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TemplateBuilderController.prototype, "deleteItem", null);
exports.TemplateBuilderController = TemplateBuilderController = __decorate([
    (0, common_1.Controller)('template-builder'),
    __metadata("design:paramtypes", [template_builder_service_1.TemplateBuilderService])
], TemplateBuilderController);
//# sourceMappingURL=template-builder.controller.js.map