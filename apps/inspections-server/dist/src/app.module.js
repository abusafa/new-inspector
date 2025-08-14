"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_service_1 = require("./prisma.service");
const templates_module_1 = require("./templates/templates.module");
const workorders_module_1 = require("./workorders/workorders.module");
const inspections_module_1 = require("./inspections/inspections.module");
const users_module_1 = require("./users/users.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const assets_module_1 = require("./assets/assets.module");
const workorder_templates_module_1 = require("./workorder-templates/workorder-templates.module");
const recurring_schedules_module_1 = require("./recurring-schedules/recurring-schedules.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            templates_module_1.TemplatesModule,
            workorders_module_1.WorkOrdersModule,
            inspections_module_1.InspectionsModule,
            users_module_1.UsersModule,
            dashboard_module_1.DashboardModule,
            assets_module_1.AssetsModule,
            workorder_templates_module_1.WorkOrderTemplatesModule,
            recurring_schedules_module_1.RecurringSchedulesModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, prisma_service_1.PrismaService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map