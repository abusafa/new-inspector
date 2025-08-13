import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { PrismaService } from './prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable validation pipes for DTO validation
  app.useGlobalPipes(new ValidationPipe({
    transform: true, // Automatically transform payloads to DTO instances
    whitelist: true, // Strip properties that don't have decorators
    forbidNonWhitelisted: false, // Don't throw error for extra properties
  }));
  
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  app.enableCors({ origin: true, credentials: true });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
