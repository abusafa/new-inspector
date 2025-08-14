import { Body, Controller, Get, Param, Post, Put, Delete, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTemplateDto, UpdateTemplateDto, DuplicateTemplateDto, TemplateQueryDto, TemplateSchemaDto } from './dto/template.dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query() query: TemplateQueryDto) {
    const {
      category,
      status,
      search,
      tags,
      industry,
      equipmentType,
      createdBy,
      isPublic,
      // not part of DTO originally but used by FE
      difficulty,
      page = 1,
      limit = 20,
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    }: any = query as any;

    const where: any = {};

    // Apply filters
    if (category) where.category = category;
    if (status) where.status = status;
    if (industry) where.industry = industry;
    if (equipmentType) where.equipmentType = equipmentType;
    if (createdBy) where.createdBy = createdBy;
    if (isPublic !== undefined) where.isPublic = isPublic;
    if (difficulty) where.difficulty = difficulty;
    
    // Search functionality
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Tags filter
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

  @Get('categories')
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

  @Get('tags')
  async getTags() {
    const templates = await this.prisma.inspectionTemplate.findMany({
      where: { status: 'published' },
      select: { tags: true }
    });

    const tagCounts = new Map<string, number>();
    templates.forEach(template => {
      template.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ name: tag, count }))
      .sort((a, b) => b.count - a.count);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
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
      throw new NotFoundException('Template not found');
    }

    return {
      ...item,
      usageCount: item._count.inspections
    };
  }

  @Get(':id/preview')
  async preview(@Param('id') id: string) {
    const template = await this.prisma.inspectionTemplate.findUnique({
      where: { id }
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Validate schema structure
    try {
      const schemaValidation = plainToClass(TemplateSchemaDto, template.schemaJson);
      const errors = await validate(schemaValidation);
      
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
    } catch (error) {
      return {
        valid: false,
        errors: [{ message: 'Invalid JSON structure' }],
        template: template.schemaJson
      };
    }
  }

  @Get(':id/versions')
  async getVersions(@Param('id') id: string) {
    const template = await this.prisma.inspectionTemplate.findUnique({
      where: { id }
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Get all versions (including this one and its siblings)
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

  @Post()
  async create(@Body() createTemplateDto: CreateTemplateDto) {
    // Validate schema if provided
    if (createTemplateDto.schemaJson) {
      try {
        const schemaValidation = plainToClass(TemplateSchemaDto, createTemplateDto.schemaJson);
        const errors = await validate(schemaValidation);
        if (errors.length > 0) {
          throw new BadRequestException('Invalid template schema', errors.map(e => e.constraints).join(', '));
        }
      } catch (error) {
        throw new BadRequestException('Invalid template schema structure');
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

  @Post(':id/duplicate')
  async duplicate(@Param('id') id: string, @Body() duplicateDto: DuplicateTemplateDto) {
    const original = await this.prisma.inspectionTemplate.findUnique({
      where: { id }
    });

    if (!original) {
      throw new NotFoundException('Template not found');
    }

    // Create new template ID and update schema
    const newTemplateId = `TPL-${Date.now()}`;
    const newSchema = original.schemaJson && typeof original.schemaJson === 'object' 
      ? { ...original.schemaJson as Record<string, any> } 
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
        version: '1.0.0', // Reset version for duplicated template
        status: 'draft', // Always start as draft
        isPublic: false, // Always start as private
        createdBy: duplicateDto.createdBy,
        estimatedDuration: original.estimatedDuration,
        difficulty: original.difficulty,
        industry: original.industry,
        equipmentType: original.equipmentType,
      }
    });

    return duplicated;
  }

  @Post(':id/new-version')
  async createNewVersion(@Param('id') id: string, @Body() body: { version: string; createdBy?: string }) {
    const original = await this.prisma.inspectionTemplate.findUnique({
      where: { id }
    });

    if (!original) {
      throw new NotFoundException('Template not found');
    }

    // Mark all previous versions as not latest
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

    // Create new version
    const newVersion = await this.prisma.inspectionTemplate.create({
      data: {
        templateId: `${original.templateId}-v${body.version}`,
        name: original.name,
        description: original.description,
        schemaJson: original.schemaJson as any,
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

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateTemplateDto: UpdateTemplateDto) {
    const existing = await this.prisma.inspectionTemplate.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new NotFoundException('Template not found');
    }

    // Validate schema if provided
    if (updateTemplateDto.schemaJson) {
      try {
        const schemaValidation = plainToClass(TemplateSchemaDto, updateTemplateDto.schemaJson);
        const errors = await validate(schemaValidation);
        if (errors.length > 0) {
          throw new BadRequestException('Invalid template schema', errors.map(e => e.constraints).join(', '));
        }
      } catch (error) {
        throw new BadRequestException('Invalid template schema structure');
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

  @Put(':id/publish')
  async publish(@Param('id') id: string, @Body() body: { publishedBy?: string }) {
    const template = await this.prisma.inspectionTemplate.findUnique({
      where: { id }
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Validate schema before publishing
    try {
      const schemaValidation = plainToClass(TemplateSchemaDto, template.schemaJson);
      const errors = await validate(schemaValidation);
      if (errors.length > 0) {
        throw new BadRequestException('Cannot publish template with invalid schema');
      }
    } catch (error) {
      throw new BadRequestException('Cannot publish template with invalid schema structure');
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

  @Put(':id/archive')
  async archive(@Param('id') id: string, @Body() body: { archivedBy?: string }) {
    const template = await this.prisma.inspectionTemplate.update({
      where: { id },
      data: {
        status: 'archived',
        lastModifiedBy: body.archivedBy
      }
    });

    return template;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
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
      throw new NotFoundException('Template not found');
    }

    // Prevent deletion if template has been used in inspections
    if (template._count.inspections > 0) {
      throw new BadRequestException('Cannot delete template that has been used in inspections. Archive it instead.');
    }

    // Delete all versions if this is a parent template
    if (!template.parentId) {
      await this.prisma.inspectionTemplate.deleteMany({
        where: { parentId: id }
      });
    }

    // Delete the template
    await this.prisma.inspectionTemplate.delete({
      where: { id },
    });

    return { success: true };
  }

  // Helper methods
  private countQuestions(schema: any): number {
    let count = 0;
    
    if (schema.header_items) {
      count += schema.header_items.length;
    }

    if (schema.items) {
      count += this.countQuestionsInItems(schema.items);
    }

    return count;
  }

  private countQuestionsInItems(items: any[]): number {
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

  private countSections(schema: any): number {
    let count = 0;
    
    if (schema.items) {
      count += this.countSectionsInItems(schema.items);
    }

    return count;
  }

  private countSectionsInItems(items: any[]): number {
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

  private getDefaultSchema(templateId: string, name: string): any {
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
}


