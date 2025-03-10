import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  public constructor(private prisma: PrismaService) {}

  public async createUser(createUserDto: CreateUserDto): Promise<void> {
    await this.prisma.user.create({
      data: {
        name: `${createUserDto.firstName} ${createUserDto.lastName}`,
        email: createUserDto.email,
        password: createUserDto.password,
      },
    });
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  public async getById(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: { id } });
  }
}
