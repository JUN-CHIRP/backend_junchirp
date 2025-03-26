import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class RolesService {
  public constructor(private readonly prisma: PrismaService) {}

  public async findOrCreateRole(roleName: string): Promise<Role> {
    return this.prisma.role.upsert({
      where: { roleName },
      update: {},
      create: { roleName },
    });
  }
}
