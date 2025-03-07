import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@prisma/client';

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
    return this.prisma.user.findUnique({ where: { email } });
  }
}
