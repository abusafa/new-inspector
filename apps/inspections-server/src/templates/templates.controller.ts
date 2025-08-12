import { Body, Controller, Get, Param, Post, Put, Delete } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list() {
    const items = await this.prisma.inspectionTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return items.map((t) => ({
      id: t.id,
      templateId: t.templateId,
      name: t.name,
      description: t.description,
      schemaJson: t.schemaJson,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const item = await this.prisma.inspectionTemplate.findUnique({ where: { id } });
    if (!item) return null;
    return {
      id: item.id,
      templateId: item.templateId,
      name: item.name,
      description: item.description,
      schemaJson: item.schemaJson,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  @Post()
  async create(@Body() body: any) {
    const template = await this.prisma.inspectionTemplate.create({
      data: {
        templateId: body.templateId || `TPL-${Date.now()}`,
        name: body.name,
        description: body.description,
        schemaJson: body.schemaJson || {},
      },
    });
    return {
      id: template.id,
      templateId: template.templateId,
      name: template.name,
      description: template.description,
      schemaJson: template.schemaJson,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const template = await this.prisma.inspectionTemplate.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        schemaJson: body.schemaJson,
      },
    });
    return {
      id: template.id,
      templateId: template.templateId,
      name: template.name,
      description: template.description,
      schemaJson: template.schemaJson,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    // First delete related inspections
    await this.prisma.inspection.deleteMany({
      where: { templateId: id },
    });

    // Then delete the template
    await this.prisma.inspectionTemplate.delete({
      where: { id },
    });

    return { success: true };
  }
}


