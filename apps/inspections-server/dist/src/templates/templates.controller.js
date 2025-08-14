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
const template_dto_1 = require("./dto/template.dto");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
let TemplatesController = class TemplatesController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(query) {
        const { category, status, search, tags, industry, equipmentType, createdBy, isPublic, difficulty, page = 1, limit = 20, sortBy = 'updatedAt', sortOrder = 'desc' } = query;
        const where = {};
        if (category)
            where.category = category;
        if (status)
            where.status = status;
        if (industry)
            where.industry = industry;
        if (equipmentType)
            where.equipmentType = equipmentType;
        if (createdBy)
            where.createdBy = createdBy;
        if (isPublic !== undefined)
            where.isPublic = isPublic;
        if (difficulty)
            where.difficulty = difficulty;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (tags && tags.length > 0) {
            where.tags = { hasSome: tags };
        }
        const skip = (page - 1) * limit;
        const orderBy = { [sortBy]: sortOrder };
        const [items, total] = await Promise.all([
            this.prisma.inspectionTemplate.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                select: {
                    id: true,
                    templateId: true,
                    name: true,
                    description: true,
                    category: true,
                    tags: true,
                    version: true,
                    status: true,
                    isPublic: true,
                    createdBy: true,
                    lastModifiedBy: true,
                    estimatedDuration: true,
                    difficulty: true,
                    industry: true,
                    equipmentType: true,
                    createdAt: true,
                    updatedAt: true,
                    isLatestVersion: true,
                    _count: {
                        select: {
                            inspections: true
                        }
                    }
                }
            }),
            this.prisma.inspectionTemplate.count({ where })
        ]);
        return {
            data: items.map(t => ({
                ...t,
                usageCount: t._count.inspections
            })),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
    async getCategories() {
        const categories = await this.prisma.inspectionTemplate.groupBy({
            by: ['category'],
            _count: {
                category: true
            },
            where: {
                status: 'published'
            }
        });
        return categories.map(cat => ({
            name: cat.category,
            count: cat._count.category
        }));
    }
    async getTags() {
        const templates = await this.prisma.inspectionTemplate.findMany({
            where: { status: 'published' },
            select: { tags: true }
        });
        const tagCounts = new Map();
        templates.forEach(template => {
            template.tags.forEach(tag => {
                tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
            });
        });
        return Array.from(tagCounts.entries())
            .map(([tag, count]) => ({ name: tag, count }))
            .sort((a, b) => b.count - a.count);
    }
    async get(id) {
        const item = await this.prisma.inspectionTemplate.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        inspections: true
                    }
                }
            }
        });
        if (!item) {
            throw new common_1.NotFoundException('Template not found');
        }
        return {
            ...item,
            usageCount: item._count.inspections
        };
    }
    async preview(id) {
        const template = await this.prisma.inspectionTemplate.findUnique({
            where: { id }
        });
        if (!template) {
            throw new common_1.NotFoundException('Template not found');
        }
        try {
            const schemaValidation = (0, class_transformer_1.plainToClass)(template_dto_1.TemplateSchemaDto, template.schemaJson);
            const errors = await (0, class_validator_1.validate)(schemaValidation);
            if (errors.length > 0) {
                return {
                    valid: false,
                    errors: errors.map(error => ({
                        property: error.property,
                        constraints: error.constraints
                    })),
                    template: template.schemaJson
                };
            }
            return {
                valid: true,
                errors: [],
                template: template.schemaJson,
                metadata: {
                    totalQuestions: this.countQuestions(template.schemaJson),
                    totalSections: this.countSections(template.schemaJson),
                    estimatedDuration: template.estimatedDuration,
                    difficulty: template.difficulty
                }
            };
        }
        catch (error) {
            return {
                valid: false,
                errors: [{ message: 'Invalid JSON structure' }],
                template: template.schemaJson
            };
        }
    }
    async getVersions(id) {
        const template = await this.prisma.inspectionTemplate.findUnique({
            where: { id }
        });
        if (!template) {
            throw new common_1.NotFoundException('Template not found');
        }
        const parentId = template.parentId || id;
        const versions = await this.prisma.inspectionTemplate.findMany({
            where: {
                OR: [
                    { id: parentId },
                    { parentId: parentId }
                ]
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                templateId: true,
                name: true,
                version: true,
                status: true,
                isLatestVersion: true,
                createdAt: true,
                createdBy: true
            }
        });
        return versions;
    }
    async create(createTemplateDto) {
        if (createTemplateDto.schemaJson) {
            try {
                const schemaValidation = (0, class_transformer_1.plainToClass)(template_dto_1.TemplateSchemaDto, createTemplateDto.schemaJson);
                const errors = await (0, class_validator_1.validate)(schemaValidation);
                if (errors.length > 0) {
                    throw new common_1.BadRequestException('Invalid template schema', errors.map(e => e.constraints).join(', '));
                }
            }
            catch (error) {
                throw new common_1.BadRequestException('Invalid template schema structure');
            }
        }
        const templateId = createTemplateDto.templateId || `TPL-${Date.now()}`;
        const template = await this.prisma.inspectionTemplate.create({
            data: {
                templateId,
                name: createTemplateDto.name,
                description: createTemplateDto.description,
                schemaJson: createTemplateDto.schemaJson || this.getDefaultSchema(templateId, createTemplateDto.name),
                category: createTemplateDto.category || 'General',
                tags: createTemplateDto.tags || [],
                version: createTemplateDto.version || '1.0.0',
                status: createTemplateDto.status || 'draft',
                isPublic: createTemplateDto.isPublic || false,
                createdBy: createTemplateDto.createdBy,
                estimatedDuration: createTemplateDto.estimatedDuration,
                difficulty: createTemplateDto.difficulty,
                industry: createTemplateDto.industry,
                equipmentType: createTemplateDto.equipmentType,
            },
        });
        return template;
    }
    async duplicate(id, duplicateDto) {
        const original = await this.prisma.inspectionTemplate.findUnique({
            where: { id }
        });
        if (!original) {
            throw new common_1.NotFoundException('Template not found');
        }
        const newTemplateId = `TPL-${Date.now()}`;
        const newSchema = original.schemaJson && typeof original.schemaJson === 'object'
            ? { ...original.schemaJson }
            : {};
        if (newSchema.template_id) {
            newSchema.template_id = newTemplateId;
        }
        const duplicated = await this.prisma.inspectionTemplate.create({
            data: {
                templateId: newTemplateId,
                name: duplicateDto.name,
                description: duplicateDto.description || `Copy of ${original.description}`,
                schemaJson: newSchema,
                category: duplicateDto.category || original.category,
                tags: duplicateDto.tags || [...original.tags, 'copy'],
                version: '1.0.0',
                status: 'draft',
                isPublic: false,
                createdBy: duplicateDto.createdBy,
                estimatedDuration: original.estimatedDuration,
                difficulty: original.difficulty,
                industry: original.industry,
                equipmentType: original.equipmentType,
            }
        });
        return duplicated;
    }
    async createNewVersion(id, body) {
        const original = await this.prisma.inspectionTemplate.findUnique({
            where: { id }
        });
        if (!original) {
            throw new common_1.NotFoundException('Template not found');
        }
        const parentId = original.parentId || id;
        await this.prisma.inspectionTemplate.updateMany({
            where: {
                OR: [
                    { id: parentId },
                    { parentId: parentId }
                ]
            },
            data: { isLatestVersion: false }
        });
        const newVersion = await this.prisma.inspectionTemplate.create({
            data: {
                templateId: `${original.templateId}-v${body.version}`,
                name: original.name,
                description: original.description,
                schemaJson: original.schemaJson,
                category: original.category,
                tags: original.tags,
                version: body.version,
                status: 'draft',
                isPublic: original.isPublic,
                createdBy: body.createdBy,
                lastModifiedBy: body.createdBy,
                estimatedDuration: original.estimatedDuration,
                difficulty: original.difficulty,
                industry: original.industry,
                equipmentType: original.equipmentType,
                parentId: parentId,
                isLatestVersion: true
            }
        });
        return newVersion;
    }
    async update(id, updateTemplateDto) {
        const existing = await this.prisma.inspectionTemplate.findUnique({
            where: { id }
        });
        if (!existing) {
            throw new common_1.NotFoundException('Template not found');
        }
        if (updateTemplateDto.schemaJson) {
            try {
                const schemaValidation = (0, class_transformer_1.plainToClass)(template_dto_1.TemplateSchemaDto, updateTemplateDto.schemaJson);
                const errors = await (0, class_validator_1.validate)(schemaValidation);
                if (errors.length > 0) {
                    throw new common_1.BadRequestException('Invalid template schema', errors.map(e => e.constraints).join(', '));
                }
            }
            catch (error) {
                throw new common_1.BadRequestException('Invalid template schema structure');
            }
        }
        const template = await this.prisma.inspectionTemplate.update({
            where: { id },
            data: {
                ...updateTemplateDto,
                lastModifiedBy: updateTemplateDto.lastModifiedBy,
            },
        });
        return template;
    }
    async publish(id, body) {
        const template = await this.prisma.inspectionTemplate.findUnique({
            where: { id }
        });
        if (!template) {
            throw new common_1.NotFoundException('Template not found');
        }
        try {
            const schemaValidation = (0, class_transformer_1.plainToClass)(template_dto_1.TemplateSchemaDto, template.schemaJson);
            const errors = await (0, class_validator_1.validate)(schemaValidation);
            if (errors.length > 0) {
                throw new common_1.BadRequestException('Cannot publish template with invalid schema');
            }
        }
        catch (error) {
            throw new common_1.BadRequestException('Cannot publish template with invalid schema structure');
        }
        const published = await this.prisma.inspectionTemplate.update({
            where: { id },
            data: {
                status: 'published',
                lastModifiedBy: body.publishedBy
            }
        });
        return published;
    }
    async archive(id, body) {
        const template = await this.prisma.inspectionTemplate.update({
            where: { id },
            data: {
                status: 'archived',
                lastModifiedBy: body.archivedBy
            }
        });
        return template;
    }
    async delete(id) {
        const template = await this.prisma.inspectionTemplate.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        inspections: true
                    }
                }
            }
        });
        if (!template) {
            throw new common_1.NotFoundException('Template not found');
        }
        if (template._count.inspections > 0) {
            throw new common_1.BadRequestException('Cannot delete template that has been used in inspections. Archive it instead.');
        }
        if (!template.parentId) {
            await this.prisma.inspectionTemplate.deleteMany({
                where: { parentId: id }
            });
        }
        await this.prisma.inspectionTemplate.delete({
            where: { id },
        });
        return { success: true };
    }
    countQuestions(schema) {
        let count = 0;
        if (schema.header_items) {
            count += schema.header_items.length;
        }
        if (schema.items) {
            count += this.countQuestionsInItems(schema.items);
        }
        return count;
    }
    countQuestionsInItems(items) {
        let count = 0;
        for (const item of items) {
            if (item.type === 'question' || item.type === 'text' || item.type === 'signature') {
                count++;
            }
            if (item.items) {
                count += this.countQuestionsInItems(item.items);
            }
        }
        return count;
    }
    countSections(schema) {
        let count = 0;
        if (schema.items) {
            count += this.countSectionsInItems(schema.items);
        }
        return count;
    }
    countSectionsInItems(items) {
        let count = 0;
        for (const item of items) {
            if (item.type === 'section') {
                count++;
                if (item.items) {
                    count += this.countSectionsInItems(item.items);
                }
            }
        }
        return count;
    }
    getDefaultSchema(templateId, name) {
        return {
            template_id: templateId,
            name: name,
            description: "New inspection template",
            header_items: [
                {
                    item_id: "item_header_001",
                    type: "datetime",
                    label: "Date and Time of Inspection",
                    options: {
                        required: true,
                        default_to_current_time: true
                    }
                },
                {
                    item_id: "item_header_002",
                    type: "text",
                    label: "Inspector Name",
                    options: {
                        required: true
                    }
                }
            ],
            items: [
                {
                    item_id: "section_001",
                    type: "section",
                    label: "General Inspection",
                    items: [
                        {
                            item_id: "question_001",
                            type: "question",
                            label: "Is the item in good condition?",
                            options: {
                                required: true
                            },
                            response_set: {
                                type: "multiple-choice",
                                responses: [
                                    { id: "resp_yes", label: "Yes", score: 1, color: "green" },
                                    { id: "resp_no", label: "No", score: 0, color: "red" },
                                    { id: "resp_na", label: "N/A", score: null, color: "grey" }
                                ]
                            }
                        }
                    ]
                }
            ]
        };
    }
};
exports.TemplatesController = TemplatesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [template_dto_1.TemplateQueryDto]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('tags'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "getTags", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "get", null);
__decorate([
    (0, common_1.Get)(':id/preview'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "preview", null);
__decorate([
    (0, common_1.Get)(':id/versions'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "getVersions", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [template_dto_1.CreateTemplateDto]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/duplicate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, template_dto_1.DuplicateTemplateDto]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "duplicate", null);
__decorate([
    (0, common_1.Post)(':id/new-version'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "createNewVersion", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, template_dto_1.UpdateTemplateDto]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/publish'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "publish", null);
__decorate([
    (0, common_1.Put)(':id/archive'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "archive", null);
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