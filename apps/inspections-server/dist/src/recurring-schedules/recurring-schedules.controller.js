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
exports.RecurringSchedulesController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let RecurringSchedulesController = class RecurringSchedulesController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(query) {
        const { isActive, frequency, search, page = 1, limit = 20, sortBy = 'nextDue', sortOrder = 'asc' } = query;
        const where = {};
        if (isActive !== undefined)
            where.isActive = isActive === true;
        if (frequency)
            where.frequency = frequency;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }
        const [schedules, total] = await Promise.all([
            this.prisma.recurringSchedule.findMany({
                where,
                orderBy: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    workOrderTemplate: {
                        select: {
                            id: true,
                            name: true,
                            category: true,
                            estimatedDuration: true
                        }
                    }
                }
            }),
            this.prisma.recurringSchedule.count({ where })
        ]);
        return {
            data: schedules.map(schedule => ({
                ...schedule,
                nextDueIn: this.calculateTimeUntilNext(schedule.nextDue),
                isOverdue: schedule.nextDue ? new Date(schedule.nextDue) < new Date() : false
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async getDueToday() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const schedules = await this.prisma.recurringSchedule.findMany({
            where: {
                isActive: true,
                nextDue: {
                    gte: today,
                    lt: tomorrow
                }
            },
            include: {
                workOrderTemplate: true
            }
        });
        return schedules;
    }
    async getOverdue() {
        const now = new Date();
        const schedules = await this.prisma.recurringSchedule.findMany({
            where: {
                isActive: true,
                nextDue: {
                    lt: now
                }
            },
            include: {
                workOrderTemplate: true
            },
            orderBy: {
                nextDue: 'asc'
            }
        });
        return schedules;
    }
    async get(id) {
        const schedule = await this.prisma.recurringSchedule.findUnique({
            where: { id },
            include: {
                workOrderTemplate: {
                    include: {
                        workOrders: {
                            where: {
                                createdAt: {
                                    gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
                                }
                            },
                            orderBy: { createdAt: 'desc' },
                            take: 20
                        }
                    }
                }
            }
        });
        if (!schedule) {
            throw new Error('Recurring schedule not found');
        }
        return {
            ...schedule,
            nextDueIn: this.calculateTimeUntilNext(schedule.nextDue),
            isOverdue: schedule.nextDue ? new Date(schedule.nextDue) < new Date() : false,
            recentWorkOrders: schedule.workOrderTemplate.workOrders
        };
    }
    async create(body) {
        const nextDue = this.calculateNextDue(body);
        const schedule = await this.prisma.recurringSchedule.create({
            data: {
                name: body.name,
                description: body.description,
                workOrderTemplateId: body.workOrderTemplateId,
                assignedTo: body.assignedTo,
                assignedGroup: body.assignedGroup,
                location: body.location,
                priority: body.priority || 'medium',
                frequency: body.frequency,
                interval: body.interval || 1,
                startDate: new Date(body.startDate),
                endDate: body.endDate ? new Date(body.endDate) : null,
                daysOfWeek: body.daysOfWeek || [],
                dayOfMonth: body.dayOfMonth,
                time: body.time,
                timezone: body.timezone || 'UTC',
                isActive: body.isActive ?? true,
                createdBy: body.createdBy,
                nextDue
            },
            include: {
                workOrderTemplate: true
            }
        });
        return schedule;
    }
    async update(id, body) {
        const nextDue = body.frequency ? this.calculateNextDue(body) : undefined;
        const schedule = await this.prisma.recurringSchedule.update({
            where: { id },
            data: {
                name: body.name,
                description: body.description,
                assignedTo: body.assignedTo,
                assignedGroup: body.assignedGroup,
                location: body.location,
                priority: body.priority,
                frequency: body.frequency,
                interval: body.interval,
                startDate: body.startDate ? new Date(body.startDate) : undefined,
                endDate: body.endDate ? new Date(body.endDate) : undefined,
                daysOfWeek: body.daysOfWeek,
                dayOfMonth: body.dayOfMonth,
                time: body.time,
                timezone: body.timezone,
                isActive: body.isActive,
                nextDue: nextDue
            },
            include: {
                workOrderTemplate: true
            }
        });
        return schedule;
    }
    async delete(id) {
        await this.prisma.recurringSchedule.delete({
            where: { id }
        });
        return { message: 'Recurring schedule deleted successfully' };
    }
    async generateWorkOrder(id, body) {
        const schedule = await this.prisma.recurringSchedule.findUnique({
            where: { id },
            include: {
                workOrderTemplate: true
            }
        });
        if (!schedule) {
            throw new Error('Schedule not found');
        }
        const template = schedule.workOrderTemplate;
        const workOrder = await this.prisma.workOrder.create({
            data: {
                workOrderId: `WO-${Date.now()}`,
                title: `${template.name} - ${schedule.name}`,
                description: template.description,
                assignedTo: schedule.assignedTo || template.defaultAssignee || '',
                location: schedule.location,
                priority: schedule.priority,
                status: 'pending',
                dueDate: body.dueDate ? new Date(body.dueDate) : null,
                estimatedDuration: template.estimatedDuration,
                requiredSkills: template.requiredSkills,
                workOrderTemplateId: template.id,
                createdBy: 'system'
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
        const nextDue = this.calculateNextDue(schedule);
        await this.prisma.recurringSchedule.update({
            where: { id },
            data: {
                lastGenerated: new Date(),
                nextDue,
                totalGenerated: { increment: 1 }
            }
        });
        return this.prisma.workOrder.findUnique({
            where: { id: workOrder.id },
            include: {
                inspections: {
                    include: { template: true },
                    orderBy: { order: 'asc' }
                },
                workOrderTemplate: true
            }
        });
    }
    async toggleActive(id) {
        const schedule = await this.prisma.recurringSchedule.findUnique({
            where: { id },
            select: { isActive: true }
        });
        if (!schedule) {
            throw new Error('Schedule not found');
        }
        const updatedSchedule = await this.prisma.recurringSchedule.update({
            where: { id },
            data: { isActive: !schedule.isActive }
        });
        return updatedSchedule;
    }
    calculateNextDue(scheduleData) {
        const now = new Date();
        const startDate = new Date(scheduleData.startDate);
        let nextDue = new Date(Math.max(now.getTime(), startDate.getTime()));
        switch (scheduleData.frequency) {
            case 'daily':
                nextDue.setDate(nextDue.getDate() + (scheduleData.interval || 1));
                break;
            case 'weekly':
                nextDue.setDate(nextDue.getDate() + (7 * (scheduleData.interval || 1)));
                break;
            case 'monthly':
                nextDue.setMonth(nextDue.getMonth() + (scheduleData.interval || 1));
                if (scheduleData.dayOfMonth) {
                    nextDue.setDate(scheduleData.dayOfMonth);
                }
                break;
            case 'quarterly':
                nextDue.setMonth(nextDue.getMonth() + (3 * (scheduleData.interval || 1)));
                break;
            case 'yearly':
                nextDue.setFullYear(nextDue.getFullYear() + (scheduleData.interval || 1));
                break;
        }
        if (scheduleData.time) {
            const [hours, minutes] = scheduleData.time.split(':');
            nextDue.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }
        return nextDue;
    }
    calculateTimeUntilNext(nextDue) {
        if (!nextDue)
            return 'Not scheduled';
        const now = new Date();
        const diff = nextDue.getTime() - now.getTime();
        if (diff < 0)
            return 'Overdue';
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        if (days > 0)
            return `${days} days`;
        if (hours > 0)
            return `${hours} hours`;
        return 'Less than 1 hour';
    }
};
exports.RecurringSchedulesController = RecurringSchedulesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecurringSchedulesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('due-today'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RecurringSchedulesController.prototype, "getDueToday", null);
__decorate([
    (0, common_1.Get)('overdue'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RecurringSchedulesController.prototype, "getOverdue", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecurringSchedulesController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecurringSchedulesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RecurringSchedulesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecurringSchedulesController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/generate-work-order'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RecurringSchedulesController.prototype, "generateWorkOrder", null);
__decorate([
    (0, common_1.Post)(':id/toggle-active'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecurringSchedulesController.prototype, "toggleActive", null);
exports.RecurringSchedulesController = RecurringSchedulesController = __decorate([
    (0, common_1.Controller)('recurring-schedules'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecurringSchedulesController);
//# sourceMappingURL=recurring-schedules.controller.js.map