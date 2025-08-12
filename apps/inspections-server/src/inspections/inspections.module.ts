import { Module } from '@nestjs/common';
import { InspectionsController } from './inspections.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [InspectionsController],
  providers: [PrismaService],
})
export class InspectionsModule {}


