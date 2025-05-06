import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectRoleType } from '@prisma/client';
import { ProjectRoleTypeResponseDto } from './dto/project-role-type.response-dto';
import { ProjectRoleResponseDto } from './dto/project-role.response-dto';
import { ProjectRoleMapper } from '../shared/mappers/project-role.mapper';
import { CreateProjectRoleDto } from './dto/create-project-role.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class ProjectRolesService {
  public constructor(private prisma: PrismaService) {}

  public async getProjectRoleTypes(): Promise<ProjectRoleTypeResponseDto[]> {
    return this.prisma.projectRoleType.findMany({
      where: {
        roleName: {
          not: 'Project owner',
        },
      },
    });
  }

  public async findOrCreateRole(roleName: string): Promise<ProjectRoleType> {
    return this.prisma.projectRoleType.upsert({
      where: { roleName },
      update: {},
      create: { roleName },
    });
  }

  public async createProjectRole(
    createProjectRoleDto: CreateProjectRoleDto,
  ): Promise<ProjectRoleResponseDto> {
    try {
      await this.prisma.project.findUniqueOrThrow({
        where: { id: createProjectRoleDto.projectId },
      });

      await this.prisma.projectRoleType.findUniqueOrThrow({
        where: { id: createProjectRoleDto.roleTypeId },
      });

      const role = await this.prisma.projectRole.create({
        data: createProjectRoleDto,
        include: { roleType: true },
      });

      return ProjectRoleMapper.toBaseResponse(role);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            throw new NotFoundException('Project or role type not found');
          case 'P2002':
            throw new ConflictException('Role already exists for this project');
          default:
            throw new InternalServerErrorException('Database error');
        }
      } else {
        throw error;
      }
    }
  }

  public async deleteProjectRole(id: string): Promise<void> {
    try {
      await this.prisma.projectRole.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Project role not found');
      }
      throw error;
    }
  }
}
