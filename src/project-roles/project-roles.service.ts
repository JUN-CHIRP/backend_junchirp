import {
  ConflictException,
  Injectable,
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
    const project = await this.prisma.project.findUnique({
      where: { id: createProjectRoleDto.projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const roleType = await this.prisma.projectRoleType.findUnique({
      where: { id: createProjectRoleDto.roleTypeId },
    });

    if (!roleType) {
      throw new NotFoundException('Role type not found');
    }

    const existingRole = await this.prisma.projectRole.findFirst({
      where: {
        projectId: createProjectRoleDto.projectId,
        roleTypeId: createProjectRoleDto.roleTypeId,
      },
    });

    if (existingRole) {
      throw new ConflictException('Role already exists for this project');
    }

    const role = await this.prisma.projectRole.create({
      data: createProjectRoleDto,
    });

    return ProjectRoleMapper.toResponse(role);
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
