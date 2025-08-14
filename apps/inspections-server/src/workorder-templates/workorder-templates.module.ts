import { Module } from '@nestjs/common';
import { WorkOrderTemplatesController } from './workorder-templates.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [WorkOrderTemplatesController],
  providers: [PrismaService],
})
export class WorkOrderTemplatesModule {}
