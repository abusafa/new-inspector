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
exports.TemplateSchemaDto = exports.InspectionItemDto = exports.ConditionDto = exports.ResponseSetDto = exports.ResponseDto = exports.HeaderItemDto = exports.TemplateQueryDto = exports.DuplicateTemplateDto = exports.UpdateTemplateDto = exports.CreateTemplateDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateTemplateDto {
    name;
    description;
    schemaJson;
    templateId;
    category = 'General';
    tags = [];
    version = '1.0.0';
    status = 'draft';
    isPublic = false;
    createdBy;
    estimatedDuration;
    difficulty;
    industry;
    equipmentType;
}
exports.CreateTemplateDto = CreateTemplateDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateTemplateDto.prototype, "schemaJson", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "templateId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateTemplateDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "version", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['draft', 'published', 'archived']),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateTemplateDto.prototype, "isPublic", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "createdBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateTemplateDto.prototype, "estimatedDuration", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['easy', 'medium', 'hard']),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "difficulty", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "industry", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "equipmentType", void 0);
class UpdateTemplateDto {
    name;
    description;
    schemaJson;
    category;
    tags;
    version;
    status;
    isPublic;
    lastModifiedBy;
    estimatedDuration;
    difficulty;
    industry;
    equipmentType;
}
exports.UpdateTemplateDto = UpdateTemplateDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTemplateDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTemplateDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateTemplateDto.prototype, "schemaJson", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTemplateDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateTemplateDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTemplateDto.prototype, "version", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['draft', 'published', 'archived']),
    __metadata("design:type", String)
], UpdateTemplateDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateTemplateDto.prototype, "isPublic", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTemplateDto.prototype, "lastModifiedBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateTemplateDto.prototype, "estimatedDuration", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['easy', 'medium', 'hard']),
    __metadata("design:type", String)
], UpdateTemplateDto.prototype, "difficulty", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTemplateDto.prototype, "industry", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTemplateDto.prototype, "equipmentType", void 0);
class DuplicateTemplateDto {
    name;
    description;
    category;
    tags;
    createdBy;
}
exports.DuplicateTemplateDto = DuplicateTemplateDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DuplicateTemplateDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DuplicateTemplateDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DuplicateTemplateDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], DuplicateTemplateDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DuplicateTemplateDto.prototype, "createdBy", void 0);
class TemplateQueryDto {
    category;
    status;
    search;
    tags;
    industry;
    equipmentType;
    createdBy;
    isPublic;
    difficulty;
    page = 1;
    limit = 20;
    sortBy = 'updatedAt';
    sortOrder = 'desc';
}
exports.TemplateQueryDto = TemplateQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TemplateQueryDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['draft', 'published', 'archived']),
    __metadata("design:type", String)
], TemplateQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TemplateQueryDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], TemplateQueryDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TemplateQueryDto.prototype, "industry", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TemplateQueryDto.prototype, "equipmentType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TemplateQueryDto.prototype, "createdBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TemplateQueryDto.prototype, "isPublic", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['easy', 'medium', 'hard']),
    __metadata("design:type", String)
], TemplateQueryDto.prototype, "difficulty", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], TemplateQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], TemplateQueryDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['createdAt', 'updatedAt', 'name', 'category']),
    __metadata("design:type", String)
], TemplateQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['asc', 'desc']),
    __metadata("design:type", String)
], TemplateQueryDto.prototype, "sortOrder", void 0);
class HeaderItemDto {
    item_id;
    type;
    label;
    options;
}
exports.HeaderItemDto = HeaderItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HeaderItemDto.prototype, "item_id", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['datetime', 'text', 'number']),
    __metadata("design:type", String)
], HeaderItemDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HeaderItemDto.prototype, "label", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], HeaderItemDto.prototype, "options", void 0);
class ResponseDto {
    id;
    label;
    score;
    color;
}
exports.ResponseDto = ResponseDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResponseDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResponseDto.prototype, "label", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ResponseDto.prototype, "score", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['green', 'red', 'yellow', 'grey']),
    __metadata("design:type", String)
], ResponseDto.prototype, "color", void 0);
class ResponseSetDto {
    type;
    responses;
}
exports.ResponseSetDto = ResponseSetDto;
__decorate([
    (0, class_validator_1.IsIn)(['multiple-choice', 'rating', 'dropdown']),
    __metadata("design:type", String)
], ResponseSetDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ResponseDto),
    __metadata("design:type", Array)
], ResponseSetDto.prototype, "responses", void 0);
class ConditionDto {
    field;
    operator;
    value;
}
exports.ConditionDto = ConditionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConditionDto.prototype, "field", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['is', 'is_not', 'contains', 'greater_than', 'less_than']),
    __metadata("design:type", String)
], ConditionDto.prototype, "operator", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConditionDto.prototype, "value", void 0);
class InspectionItemDto {
    item_id;
    type;
    label;
    items;
    parent_id;
    options;
    response_set;
    conditions;
}
exports.InspectionItemDto = InspectionItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InspectionItemDto.prototype, "item_id", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['section', 'question', 'text', 'signature', 'photo', 'rating', 'dropdown', 'checkbox']),
    __metadata("design:type", String)
], InspectionItemDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InspectionItemDto.prototype, "label", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => InspectionItemDto),
    __metadata("design:type", Array)
], InspectionItemDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InspectionItemDto.prototype, "parent_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], InspectionItemDto.prototype, "options", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ResponseSetDto),
    __metadata("design:type", ResponseSetDto)
], InspectionItemDto.prototype, "response_set", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ConditionDto),
    __metadata("design:type", Array)
], InspectionItemDto.prototype, "conditions", void 0);
class TemplateSchemaDto {
    template_id;
    name;
    description;
    header_items;
    items;
}
exports.TemplateSchemaDto = TemplateSchemaDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TemplateSchemaDto.prototype, "template_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TemplateSchemaDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TemplateSchemaDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => HeaderItemDto),
    __metadata("design:type", Array)
], TemplateSchemaDto.prototype, "header_items", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => InspectionItemDto),
    __metadata("design:type", Array)
], TemplateSchemaDto.prototype, "items", void 0);
//# sourceMappingURL=template.dto.js.map