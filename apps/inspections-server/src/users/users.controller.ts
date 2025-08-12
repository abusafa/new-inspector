import { Body, Controller, Get, Param, Post, Put, Delete } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return users;
  }

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
      update: { name, loginTime: new Date() },
      create: { phoneNumber: phone, name, role: 'Inspector', loginTime: new Date() },
    });
    return user;
  }

  @Post()
  async create(@Body() body: any) {
    const user = await this.prisma.user.create({
      data: {
        phoneNumber: body.phoneNumber,
        name: body.name,
        role: body.role || 'Inspector',
        email: body.email,
        department: body.department,
        location: body.location,
        employeeId: body.employeeId,
        supervisor: body.supervisor,
        loginTime: new Date(),
        settings: body.settings || {},
      },
    });
    return user;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        phoneNumber: body.phoneNumber,
        name: body.name,
        role: body.role,
        email: body.email,
        department: body.department,
        location: body.location,
        employeeId: body.employeeId,
        supervisor: body.supervisor,
        settings: body.settings,
      },
    });
    return user;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.prisma.user.delete({
      where: { id },
    });
    return { success: true };
  }
}

function getNameFromPhone(phone: string): string {
  const suffix = phone.slice(-4);
  return `User ${suffix}`;
}


