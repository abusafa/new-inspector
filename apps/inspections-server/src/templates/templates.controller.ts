import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list() {
    const items = await this.prisma.inspectionTemplate.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, description: true },
    });
    return items.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
    }));
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const item = await this.prisma.inspectionTemplate.findUnique({ where: { id } });
    if (!item) return null;
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      schema: item.schemaJson,
    };
  }
}


