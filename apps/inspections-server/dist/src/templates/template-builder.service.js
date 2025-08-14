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
exports.TemplateBuilderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let TemplateBuilderService = class TemplateBuilderService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getComponents() {
        return [
            {
                id: 'section',
                type: 'section',
                name: 'Section',
                description: 'Group related questions together',
                icon: 'folder',
                category: 'Structure',
                defaultConfig: {
                    type: 'section',
                    label: 'New Section',
                    items: []
                }
            },
            {
                id: 'multiple_choice',
                type: 'question',
                name: 'Multiple Choice',
                description: 'Yes/No or multiple option questions',
                icon: 'check-circle',
                category: 'Questions',
                defaultConfig: {
                    type: 'question',
                    label: 'New Question',
                    options: { required: true },
                    response_set: {
                        type: 'multiple-choice',
                        responses: [
                            { id: 'resp_yes', label: 'Yes', score: 1, color: 'green' },
                            { id: 'resp_no', label: 'No', score: 0, color: 'red' }
                        ]
                    }
                }
            },
            {
                id: 'rating',
                type: 'question',
                name: 'Rating Scale',
                description: '1-5 or 1-10 rating questions',
                icon: 'star',
                category: 'Questions',
                defaultConfig: {
                    type: 'question',
                    label: 'Rate this item',
                    options: { required: true, min_rating: 1, max_rating: 5 },
                    response_set: {
                        type: 'rating',
                        responses: [
                            { id: 'rating_1', label: '1', score: 1, color: 'red' },
                            { id: 'rating_2', label: '2', score: 2, color: 'red' },
                            { id: 'rating_3', label: '3', score: 3, color: 'yellow' },
                            { id: 'rating_4', label: '4', score: 4, color: 'green' },
                            { id: 'rating_5', label: '5', score: 5, color: 'green' }
                        ]
                    }
                }
            },
            {
                id: 'text_input',
                type: 'text',
                name: 'Text Input',
                description: 'Free text input with optional photo',
                icon: 'type',
                category: 'Input',
                defaultConfig: {
                    type: 'text',
                    label: 'Enter details',
                    options: {
                        required: false,
                        allow_photos: true,
                        placeholder: 'Enter your response...'
                    }
                }
            },
            {
                id: 'signature',
                type: 'signature',
                name: 'Signature',
                description: 'Digital signature capture',
                icon: 'edit-3',
                category: 'Input',
                defaultConfig: {
                    type: 'signature',
                    label: 'Signature',
                    options: { required: true }
                }
            },
            {
                id: 'photo',
                type: 'photo',
                name: 'Photo Capture',
                description: 'Required photo documentation',
                icon: 'camera',
                category: 'Input',
                defaultConfig: {
                    type: 'photo',
                    label: 'Take Photo',
                    options: {
                        required: true,
                        max_photos: 5,
                        allow_gallery: true
                    }
                }
            },
            {
                id: 'dropdown',
                type: 'question',
                name: 'Dropdown',
                description: 'Single selection from dropdown list',
                icon: 'chevron-down',
                category: 'Questions',
                defaultConfig: {
                    type: 'question',
                    label: 'Select an option',
                    options: { required: true },
                    response_set: {
                        type: 'dropdown',
                        responses: [
                            { id: 'option_1', label: 'Option 1', score: 1, color: 'grey' },
                            { id: 'option_2', label: 'Option 2', score: 1, color: 'grey' },
                            { id: 'option_3', label: 'Option 3', score: 1, color: 'grey' }
                        ]
                    }
                }
            },
            {
                id: 'checkbox',
                type: 'checkbox',
                name: 'Checkbox List',
                description: 'Multiple selection checklist',
                icon: 'check-square',
                category: 'Questions',
                defaultConfig: {
                    type: 'checkbox',
                    label: 'Select all that apply',
                    options: {
                        required: false,
                        multiple_selection: true
                    },
                    response_set: {
                        type: 'multiple-choice',
                        responses: [
                            { id: 'check_1', label: 'Option 1', score: 1, color: 'grey' },
                            { id: 'check_2', label: 'Option 2', score: 1, color: 'grey' },
                            { id: 'check_3', label: 'Option 3', score: 1, color: 'grey' }
                        ]
                    }
                }
            }
        ];
    }
    async applyOperations(templateId, operations) {
        if (!templateId) {
            throw new common_1.BadRequestException('Template ID is required');
        }
        if (!operations || !Array.isArray(operations) || operations.length === 0) {
            throw new common_1.BadRequestException('At least one operation is required');
        }
        const template = await this.prisma.inspectionTemplate.findFirst({
            where: { OR: [{ id: templateId }, { templateId }] }
        });
        if (!template) {
            throw new common_1.BadRequestException(`Template with ID '${templateId}' not found`);
        }
        let schema = template.schemaJson && typeof template.schemaJson === 'object'
            ? { ...template.schemaJson }
            : this.getDefaultSchema(template.templateId, template.name);
        if (!schema.items)
            schema.items = [];
        if (!schema.header_items)
            schema.header_items = [];
        try {
            for (const operation of operations) {
                this.validateOperation(operation);
                schema = this.applyOperation(schema, operation);
            }
        }
        catch (error) {
            throw new common_1.BadRequestException(`Operation failed: ${error.message}`);
        }
        const updated = await this.prisma.inspectionTemplate.update({
            where: { id: template.id },
            data: {
                schemaJson: schema,
                updatedAt: new Date()
            }
        });
        return updated.schemaJson;
    }
    applyOperation(schema, operation) {
        switch (operation.type) {
            case 'add':
                return this.addItem(schema, operation);
            case 'update':
                return this.updateItem(schema, operation);
            case 'delete':
                return this.deleteItem(schema, operation);
            case 'move':
                return this.moveItem(schema, operation);
            case 'duplicate':
                return this.duplicateItem(schema, operation);
            default:
                throw new common_1.BadRequestException(`Unknown operation type: ${operation.type}`);
        }
    }
    addItem(schema, operation) {
        const newItem = {
            item_id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...operation.data
        };
        if (operation.parentId) {
            this.addItemToParent(schema.items, operation.parentId, newItem, operation.position);
        }
        else {
            if (operation.position !== undefined) {
                schema.items.splice(operation.position, 0, newItem);
            }
            else {
                schema.items.push(newItem);
            }
        }
        return schema;
    }
    updateItem(schema, operation) {
        if (operation.targetId) {
            this.updateItemById(schema.header_items || [], operation.targetId, operation.data);
            this.updateItemById(schema.items || [], operation.targetId, operation.data);
        }
        return schema;
    }
    deleteItem(schema, operation) {
        if (operation.targetId) {
            if (schema.header_items) {
                schema.header_items = this.removeItemById(schema.header_items, operation.targetId);
            }
            schema.items = this.removeItemById(schema.items || [], operation.targetId);
        }
        return schema;
    }
    moveItem(schema, operation) {
        if (operation.targetId) {
            let item = this.findAndRemoveItemById(schema.items || [], operation.targetId);
            if (!item && schema.header_items) {
                item = this.findAndRemoveItemById(schema.header_items, operation.targetId);
            }
            if (item) {
                if (operation.parentId) {
                    this.addItemToParent(schema.items || [], operation.parentId, item, operation.position);
                }
                else {
                    if (operation.position !== undefined) {
                        (schema.items = schema.items || []).splice(operation.position, 0, item);
                    }
                    else {
                        (schema.items = schema.items || []).push(item);
                    }
                }
            }
        }
        return schema;
    }
    duplicateItem(schema, operation) {
        if (operation.targetId) {
            let item = this.findItemById(schema.items || [], operation.targetId);
            if (!item && schema.header_items) {
                item = this.findItemById(schema.header_items, operation.targetId);
            }
            if (item) {
                const duplicatedItem = {
                    ...JSON.parse(JSON.stringify(item)),
                    item_id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    label: `${item.label} (Copy)`
                };
                this.updateNestedItemIds(duplicatedItem);
                if (operation.parentId) {
                    this.addItemToParent(schema.items || [], operation.parentId, duplicatedItem, operation.position);
                }
                else {
                    if (operation.position !== undefined) {
                        (schema.items = schema.items || []).splice(operation.position, 0, duplicatedItem);
                    }
                    else {
                        (schema.items = schema.items || []).push(duplicatedItem);
                    }
                }
            }
        }
        return schema;
    }
    addItemToParent(items, parentId, newItem, position) {
        for (const item of items) {
            if (item.item_id === parentId) {
                if (!item.items)
                    item.items = [];
                if (position !== undefined) {
                    item.items.splice(position, 0, newItem);
                }
                else {
                    item.items.push(newItem);
                }
                return;
            }
            if (item.items) {
                this.addItemToParent(item.items, parentId, newItem, position);
            }
        }
    }
    updateItemById(items, targetId, updateData) {
        for (const item of items) {
            if (item.item_id === targetId) {
                Object.assign(item, updateData);
                return;
            }
            if (item.items) {
                this.updateItemById(item.items, targetId, updateData);
            }
        }
    }
    removeItemById(items, targetId) {
        if (!Array.isArray(items))
            return [];
        return items.filter(item => {
            if (item.item_id === targetId) {
                return false;
            }
            if (item.items) {
                item.items = this.removeItemById(item.items, targetId);
            }
            return true;
        });
    }
    findItemById(items, targetId) {
        for (const item of items) {
            if (item.item_id === targetId) {
                return item;
            }
            if (item.items) {
                const found = this.findItemById(item.items, targetId);
                if (found)
                    return found;
            }
        }
        return null;
    }
    findAndRemoveItemById(items, targetId) {
        if (!Array.isArray(items))
            return null;
        for (let i = 0; i < items.length; i++) {
            if (items[i].item_id === targetId) {
                return items.splice(i, 1)[0];
            }
            if (items[i].items) {
                const found = this.findAndRemoveItemById(items[i].items, targetId);
                if (found)
                    return found;
            }
        }
        return null;
    }
    updateNestedItemIds(item) {
        if (item.items) {
            for (const nestedItem of item.items) {
                nestedItem.item_id = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                this.updateNestedItemIds(nestedItem);
            }
        }
    }
    async generateFromPattern(patternType, options) {
        const patterns = {
            'safety_inspection': this.getSafetyInspectionPattern(),
            'equipment_check': this.getEquipmentCheckPattern(),
            'quality_audit': this.getQualityAuditPattern(),
            'maintenance_log': this.getMaintenanceLogPattern()
        };
        const pattern = patterns[patternType];
        if (!pattern) {
            throw new common_1.BadRequestException(`Unknown pattern type: ${patternType}`);
        }
        return this.customizePattern(pattern, options);
    }
    getSafetyInspectionPattern() {
        return {
            template_id: '',
            name: 'Safety Inspection Template',
            description: 'Comprehensive safety inspection checklist',
            header_items: [
                {
                    item_id: 'header_datetime',
                    type: 'datetime',
                    label: 'Inspection Date & Time',
                    options: { required: true, default_to_current_time: true }
                },
                {
                    item_id: 'header_inspector',
                    type: 'text',
                    label: 'Inspector Name',
                    options: { required: true }
                },
                {
                    item_id: 'header_location',
                    type: 'text',
                    label: 'Location/Area',
                    options: { required: true }
                }
            ],
            items: [
                {
                    item_id: 'section_ppe',
                    type: 'section',
                    label: 'Personal Protective Equipment (PPE)',
                    items: [
                        {
                            item_id: 'ppe_available',
                            type: 'question',
                            label: 'Is required PPE available and in good condition?',
                            options: { required: true },
                            response_set: {
                                type: 'multiple-choice',
                                responses: [
                                    { id: 'yes', label: 'Yes', score: 1, color: 'green' },
                                    { id: 'no', label: 'No', score: 0, color: 'red' }
                                ]
                            }
                        }
                    ]
                },
                {
                    item_id: 'section_hazards',
                    type: 'section',
                    label: 'Hazard Identification',
                    items: [
                        {
                            item_id: 'hazards_present',
                            type: 'question',
                            label: 'Are there any visible hazards?',
                            options: { required: true },
                            response_set: {
                                type: 'multiple-choice',
                                responses: [
                                    { id: 'no_hazards', label: 'No', score: 1, color: 'green' },
                                    { id: 'hazards_found', label: 'Yes', score: 0, color: 'red' }
                                ]
                            }
                        },
                        {
                            item_id: 'hazard_details',
                            type: 'text',
                            label: 'Describe hazards and actions taken',
                            parent_id: 'hazards_present',
                            options: { allow_photos: true, required: true },
                            conditions: [{ field: 'response', operator: 'is', value: 'hazards_found' }]
                        }
                    ]
                }
            ]
        };
    }
    getEquipmentCheckPattern() {
        return {
            template_id: '',
            name: 'Equipment Inspection Template',
            description: 'Pre-use equipment safety check',
            header_items: [
                {
                    item_id: 'header_datetime',
                    type: 'datetime',
                    label: 'Inspection Date & Time',
                    options: { required: true, default_to_current_time: true }
                },
                {
                    item_id: 'header_inspector',
                    type: 'text',
                    label: 'Inspector Name',
                    options: { required: true }
                },
                {
                    item_id: 'header_equipment',
                    type: 'text',
                    label: 'Equipment ID/Serial Number',
                    options: { required: true }
                }
            ],
            items: [
                {
                    item_id: 'section_visual',
                    type: 'section',
                    label: 'Visual Inspection',
                    items: [
                        {
                            item_id: 'overall_condition',
                            type: 'question',
                            label: 'Overall equipment condition',
                            options: { required: true },
                            response_set: {
                                type: 'rating',
                                responses: [
                                    { id: 'rating_1', label: 'Poor', score: 1, color: 'red' },
                                    { id: 'rating_2', label: 'Fair', score: 2, color: 'yellow' },
                                    { id: 'rating_3', label: 'Good', score: 3, color: 'green' },
                                    { id: 'rating_4', label: 'Very Good', score: 4, color: 'green' },
                                    { id: 'rating_5', label: 'Excellent', score: 5, color: 'green' }
                                ]
                            }
                        }
                    ]
                }
            ]
        };
    }
    getQualityAuditPattern() {
        return {
            template_id: '',
            name: 'Quality Audit Template',
            description: 'Quality control audit checklist',
            header_items: [
                {
                    item_id: 'header_datetime',
                    type: 'datetime',
                    label: 'Audit Date & Time',
                    options: { required: true, default_to_current_time: true }
                },
                {
                    item_id: 'header_auditor',
                    type: 'text',
                    label: 'Auditor Name',
                    options: { required: true }
                }
            ],
            items: [
                {
                    item_id: 'section_standards',
                    type: 'section',
                    label: 'Standards Compliance',
                    items: [
                        {
                            item_id: 'meets_standards',
                            type: 'question',
                            label: 'Does the process meet quality standards?',
                            options: { required: true },
                            response_set: {
                                type: 'multiple-choice',
                                responses: [
                                    { id: 'fully_compliant', label: 'Fully Compliant', score: 2, color: 'green' },
                                    { id: 'mostly_compliant', label: 'Mostly Compliant', score: 1, color: 'yellow' },
                                    { id: 'non_compliant', label: 'Non-Compliant', score: 0, color: 'red' }
                                ]
                            }
                        }
                    ]
                }
            ]
        };
    }
    getMaintenanceLogPattern() {
        return {
            template_id: '',
            name: 'Maintenance Log Template',
            description: 'Equipment maintenance record',
            header_items: [
                {
                    item_id: 'header_datetime',
                    type: 'datetime',
                    label: 'Maintenance Date & Time',
                    options: { required: true, default_to_current_time: true }
                },
                {
                    item_id: 'header_technician',
                    type: 'text',
                    label: 'Technician Name',
                    options: { required: true }
                }
            ],
            items: [
                {
                    item_id: 'section_maintenance',
                    type: 'section',
                    label: 'Maintenance Performed',
                    items: [
                        {
                            item_id: 'maintenance_type',
                            type: 'question',
                            label: 'Type of maintenance',
                            options: { required: true },
                            response_set: {
                                type: 'dropdown',
                                responses: [
                                    { id: 'preventive', label: 'Preventive', score: 1, color: 'green' },
                                    { id: 'corrective', label: 'Corrective', score: 1, color: 'yellow' },
                                    { id: 'emergency', label: 'Emergency', score: 1, color: 'red' }
                                ]
                            }
                        }
                    ]
                }
            ]
        };
    }
    customizePattern(pattern, options) {
        const customized = JSON.parse(JSON.stringify(pattern));
        if (options.name)
            customized.name = options.name;
        if (options.description)
            customized.description = options.description;
        if (options.templateId)
            customized.template_id = options.templateId;
        return customized;
    }
    validateOperation(operation) {
        if (!operation.type) {
            throw new Error('Operation type is required');
        }
        const validOperations = ['add', 'update', 'delete', 'move', 'duplicate'];
        if (!validOperations.includes(operation.type)) {
            throw new Error(`Invalid operation type: ${operation.type}`);
        }
        switch (operation.type) {
            case 'update':
            case 'delete':
            case 'move':
            case 'duplicate':
                if (!operation.targetId) {
                    throw new Error(`${operation.type} operation requires targetId`);
                }
                break;
            case 'add':
                if (!operation.data) {
                    throw new Error('Add operation requires data');
                }
                break;
        }
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
exports.TemplateBuilderService = TemplateBuilderService;
exports.TemplateBuilderService = TemplateBuilderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TemplateBuilderService);
//# sourceMappingURL=template-builder.service.js.map