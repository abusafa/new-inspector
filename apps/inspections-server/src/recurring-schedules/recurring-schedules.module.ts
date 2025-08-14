import { Module } from '@nestjs/common';
import { RecurringSchedulesController } from './recurring-schedules.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [RecurringSchedulesController],
  providers: [PrismaService],
})
export class RecurringSchedulesModule {}
