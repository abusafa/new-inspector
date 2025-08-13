import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { TemplateBuilderService, BuilderOperation } from './template-builder.service';

@Controller('template-builder')
export class TemplateBuilderController {
  constructor(private readonly builderService: TemplateBuilderService) {}

  @Get('components')
  getComponents() {
    return this.builderService.getComponents();
  }

  @Get('patterns')
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

  @Post('generate/:patternType')
  async generateFromPattern(
    @Param('patternType') patternType: string,
    @Body() options: any
  ) {
    return await this.builderService.generateFromPattern(patternType, options);
  }

  @Post(':templateId/operations')
  async applyOperations(
    @Param('templateId') templateId: string,
    @Body() body: { operations: BuilderOperation[] }
  ) {
    return await this.builderService.applyOperations(templateId, body.operations);
  }

  @Post(':templateId/add-component')
  async addComponent(
    @Param('templateId') templateId: string,
    @Body() body: {
      componentType: string;
      parentId?: string;
      position?: number;
      customConfig?: any;
    }
  ) {
    const components = this.builderService.getComponents();
    const component = components.find(c => c.id === body.componentType);
    
    if (!component) {
      throw new Error(`Component type '${body.componentType}' not found`);
    }

    const operation: BuilderOperation = {
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

  @Put(':templateId/update-item/:itemId')
  async updateItem(
    @Param('templateId') templateId: string,
    @Param('itemId') itemId: string,
    @Body() updateData: any
  ) {
    const operation: BuilderOperation = {
      type: 'update',
      targetId: itemId,
      data: updateData
    };

    return await this.builderService.applyOperations(templateId, [operation]);
  }

  @Post(':templateId/duplicate-item/:itemId')
  async duplicateItem(
    @Param('templateId') templateId: string,
    @Param('itemId') itemId: string,
    @Body() body: { parentId?: string; position?: number }
  ) {
    const operation: BuilderOperation = {
      type: 'duplicate',
      targetId: itemId,
      parentId: body.parentId,
      position: body.position
    };

    return await this.builderService.applyOperations(templateId, [operation]);
  }

  @Post(':templateId/move-item/:itemId')
  async moveItem(
    @Param('templateId') templateId: string,
    @Param('itemId') itemId: string,
    @Body() body: { parentId?: string; position?: number }
  ) {
    const operation: BuilderOperation = {
      type: 'move',
      targetId: itemId,
      parentId: body.parentId,
      position: body.position
    };

    return await this.builderService.applyOperations(templateId, [operation]);
  }

  @Post(':templateId/delete-item/:itemId')
  async deleteItem(
    @Param('templateId') templateId: string,
    @Param('itemId') itemId: string
  ) {
    const operation: BuilderOperation = {
      type: 'delete',
      targetId: itemId
    };

    return await this.builderService.applyOperations(templateId, [operation]);
  }
}


