import { Module } from '@nestjs/common';
import { TemplatesController } from './templates.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [TemplatesController],
  providers: [PrismaService],
})
export class TemplatesModule {}


