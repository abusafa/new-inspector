import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { TemplatesModule } from './templates/templates.module';
import { WorkOrdersModule } from './workorders/workorders.module';
import { InspectionsModule } from './inspections/inspections.module';
import { UsersModule } from './users/users.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [TemplatesModule, WorkOrdersModule, InspectionsModule, UsersModule, DashboardModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
