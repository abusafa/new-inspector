"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplatesModule = void 0;
const common_1 = require("@nestjs/common");
const templates_controller_1 = require("./templates.controller");
const template_builder_controller_1 = require("./template-builder.controller");
const template_builder_service_1 = require("./template-builder.service");
const prisma_service_1 = require("../prisma.service");
let TemplatesModule = class TemplatesModule {
};
exports.TemplatesModule = TemplatesModule;
exports.TemplatesModule = TemplatesModule = __decorate([
    (0, common_1.Module)({
        controllers: [templates_controller_1.TemplatesController, template_builder_controller_1.TemplateBuilderController],
        providers: [prisma_service_1.PrismaService, template_builder_service_1.TemplateBuilderService],
        exports: [template_builder_service_1.TemplateBuilderService],
    })
], TemplatesModule);
//# sourceMappingURL=templates.module.js.map