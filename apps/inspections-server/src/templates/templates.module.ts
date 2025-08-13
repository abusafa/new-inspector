import { Module } from '@nestjs/common';
import { TemplatesController } from './templates.controller';
import { TemplateBuilderController } from './template-builder.controller';
import { TemplateBuilderService } from './template-builder.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [TemplatesController, TemplateBuilderController],
  providers: [PrismaService, TemplateBuilderService],
  exports: [TemplateBuilderService],
})
export class TemplatesModule {}


