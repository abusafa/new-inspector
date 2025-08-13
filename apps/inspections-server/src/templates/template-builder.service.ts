import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface TemplateComponent {
  id: string;
  type: 'section' | 'question' | 'text' | 'signature' | 'photo' | 'rating' | 'dropdown' | 'checkbox';
  name: string;
  description: string;
  icon: string;
  category: string;
  defaultConfig: any;
}

export interface BuilderOperation {
  type: 'add' | 'update' | 'delete' | 'move' | 'duplicate';
  targetId?: string;
  parentId?: string;
  position?: number;
  data?: any;
}

@Injectable()
export class TemplateBuilderService {
  constructor(private readonly prisma: PrismaService) {}

  // Get available components for the template builder
  getComponents(): TemplateComponent[] {
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

  // Apply builder operations to template schema
  async applyOperations(templateId: string, operations: BuilderOperation[]): Promise<any> {
    const template = await this.prisma.inspectionTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      throw new BadRequestException('Template not found');
    }

    let schema = template.schemaJson && typeof template.schemaJson === 'object' 
      ? { ...template.schemaJson as Record<string, any> } 
      : {};

    for (const operation of operations) {
      schema = this.applyOperation(schema, operation);
    }

    // Update template with new schema
    const updated = await this.prisma.inspectionTemplate.update({
      where: { id: templateId },
      data: { 
        schemaJson: schema,
        updatedAt: new Date()
      }
    });

    return updated.schemaJson;
  }

  private applyOperation(schema: any, operation: BuilderOperation): any {
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
        throw new BadRequestException(`Unknown operation type: ${operation.type}`);
    }
  }

  private addItem(schema: any, operation: BuilderOperation): any {
    const newItem = {
      item_id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...operation.data
    };

    if (operation.parentId) {
      // Add to specific section
      this.addItemToParent(schema.items, operation.parentId, newItem, operation.position);
    } else {
      // Add to root level
      if (operation.position !== undefined) {
        schema.items.splice(operation.position, 0, newItem);
      } else {
        schema.items.push(newItem);
      }
    }

    return schema;
  }

  private updateItem(schema: any, operation: BuilderOperation): any {
    if (operation.targetId) {
      this.updateItemById(schema.items, operation.targetId, operation.data);
    }
    return schema;
  }

  private deleteItem(schema: any, operation: BuilderOperation): any {
    if (operation.targetId) {
      schema.items = this.removeItemById(schema.items, operation.targetId);
    }
    return schema;
  }

  private moveItem(schema: any, operation: BuilderOperation): any {
    if (operation.targetId) {
      const item = this.findAndRemoveItemById(schema.items, operation.targetId);
      if (item) {
        if (operation.parentId) {
          this.addItemToParent(schema.items, operation.parentId, item, operation.position);
        } else {
          if (operation.position !== undefined) {
            schema.items.splice(operation.position, 0, item);
          } else {
            schema.items.push(item);
          }
        }
      }
    }
    return schema;
  }

  private duplicateItem(schema: any, operation: BuilderOperation): any {
    if (operation.targetId) {
      const item = this.findItemById(schema.items, operation.targetId);
      if (item) {
        const duplicatedItem = {
          ...JSON.parse(JSON.stringify(item)),
          item_id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          label: `${item.label} (Copy)`
        };

        // Update IDs of nested items
        this.updateNestedItemIds(duplicatedItem);

        if (operation.parentId) {
          this.addItemToParent(schema.items, operation.parentId, duplicatedItem, operation.position);
        } else {
          if (operation.position !== undefined) {
            schema.items.splice(operation.position, 0, duplicatedItem);
          } else {
            schema.items.push(duplicatedItem);
          }
        }
      }
    }
    return schema;
  }

  // Helper methods
  private addItemToParent(items: any[], parentId: string, newItem: any, position?: number): void {
    for (const item of items) {
      if (item.item_id === parentId) {
        if (!item.items) item.items = [];
        if (position !== undefined) {
          item.items.splice(position, 0, newItem);
        } else {
          item.items.push(newItem);
        }
        return;
      }
      if (item.items) {
        this.addItemToParent(item.items, parentId, newItem, position);
      }
    }
  }

  private updateItemById(items: any[], targetId: string, updateData: any): void {
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

  private removeItemById(items: any[], targetId: string): any[] {
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

  private findItemById(items: any[], targetId: string): any | null {
    for (const item of items) {
      if (item.item_id === targetId) {
        return item;
      }
      if (item.items) {
        const found = this.findItemById(item.items, targetId);
        if (found) return found;
      }
    }
    return null;
  }

  private findAndRemoveItemById(items: any[], targetId: string): any | null {
    for (let i = 0; i < items.length; i++) {
      if (items[i].item_id === targetId) {
        return items.splice(i, 1)[0];
      }
      if (items[i].items) {
        const found = this.findAndRemoveItemById(items[i].items, targetId);
        if (found) return found;
      }
    }
    return null;
  }

  private updateNestedItemIds(item: any): void {
    if (item.items) {
      for (const nestedItem of item.items) {
        nestedItem.item_id = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.updateNestedItemIds(nestedItem);
      }
    }
  }

  // Generate template from predefined patterns
  async generateFromPattern(patternType: string, options: any): Promise<any> {
    const patterns: Record<string, any> = {
      'safety_inspection': this.getSafetyInspectionPattern(),
      'equipment_check': this.getEquipmentCheckPattern(),
      'quality_audit': this.getQualityAuditPattern(),
      'maintenance_log': this.getMaintenanceLogPattern()
    };

    const pattern = patterns[patternType];
    if (!pattern) {
      throw new BadRequestException(`Unknown pattern type: ${patternType}`);
    }

    // Customize pattern with options
    return this.customizePattern(pattern, options);
  }

  private getSafetyInspectionPattern(): any {
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

  private getEquipmentCheckPattern(): any {
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

  private getQualityAuditPattern(): any {
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

  private getMaintenanceLogPattern(): any {
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

  private customizePattern(pattern: any, options: any): any {
    const customized = JSON.parse(JSON.stringify(pattern));
    
    if (options.name) customized.name = options.name;
    if (options.description) customized.description = options.description;
    if (options.templateId) customized.template_id = options.templateId;

    return customized;
  }
}

