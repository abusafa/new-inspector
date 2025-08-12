import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  @Post('login')
  async login(@Body() body: { phoneNumber: string }) {
    const phone = body.phoneNumber.replace(/\D/g, '');
    const name = getNameFromPhone(phone);
    const user = await this.prisma.user.upsert({
      where: { phoneNumber: phone },
      update: { name },
      create: { phoneNumber: phone, name, role: 'Inspector' },
    });
    return user;
  }
}

function getNameFromPhone(phone: string): string {
  const suffix = phone.slice(-4);
  return `User ${suffix}`;
}


