import { Module } from '@nestjs/common';
import { WorkOrdersController } from './workorders.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [WorkOrdersController],
  providers: [PrismaService],
})
export class WorkOrdersModule {}


