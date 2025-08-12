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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let DashboardController = class DashboardController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats() {
        const [workOrders, inspections, users, templates] = await Promise.all([
            this.prisma.workOrder.findMany({
                include: {
                    inspections: true,
                },
            }),
            this.prisma.inspection.findMany(),
            this.prisma.user.findMany(),
            this.prisma.inspectionTemplate.findMany(),
        ]);
        const totalWorkOrders = workOrders.length;
        const activeWorkOrders = workOrders.filter(wo => wo.status !== 'completed').length;
        const completedInspections = inspections.filter(i => i.status === 'completed').length;
        const pendingInspections = inspections.filter(i => i.status !== 'completed').length;
        const recentActivity = [
            ...workOrders.slice(0, 3).map(wo => ({
                id: wo.id,
                type: 'work_order_created',
                title: 'Work Order Created',
                description: wo.title,
                timestamp: wo.createdAt.toISOString(),
                user: wo.assignedTo,
            })),
            ...inspections
                .filter(i => i.completedAt)
                .slice(0, 2)
                .map(i => ({
                id: i.id,
                type: 'inspection_completed',
                title: 'Inspection Completed',
                description: `Inspection ${i.inspectionId} completed`,
                timestamp: i.completedAt.toISOString(),
                user: 'Inspector',
            })),
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return {
            totalWorkOrders,
            activeWorkOrders,
            completedInspections,
            pendingInspections,
            totalUsers: users.length,
            totalTemplates: templates.length,
            recentActivity,
        };
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getStats", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('dashboard'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map