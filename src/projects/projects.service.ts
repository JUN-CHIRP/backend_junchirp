import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectCategoryResponseDto } from './dto/project-category.response-dto';
import { ProjectResponseDto } from './dto/project.response-dto';
import { ProjectsListResponseDto } from './dto/projects-list.response-dto';
import { ProjectMapper } from '../shared/mappers/project.mapper';
import { Prisma, ProjectStatus } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ProjectRolesService } from '../project-roles/project-roles.service';

interface GetProjectsOptionsInterface {
  userId: string;
  status: ProjectStatus;
  categoryId: string;
  minParticipants: number;
  maxParticipants: number;
  page: number;
  limit: number;
}

@Injectable()
export class ProjectsService {
  public constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
    private projectRolesService: ProjectRolesService,
  ) {}

  public async getCategories(): Promise<ProjectCategoryResponseDto[]> {
    return this.prisma.projectCategory.findMany();
  }

  public async getProjects(
    options: Partial<GetProjectsOptionsInterface>,
  ): Promise<ProjectsListResponseDto> {
    const {
      userId,
      status,
      categoryId,
      minParticipants,
      maxParticipants,
      page = 1,
      limit = 10,
    } = options;

    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {
      ...(status && { status }),
      ...(categoryId && { categoryId }),
      ...(minParticipants || maxParticipants
        ? {
            participantsCount: {
              ...(minParticipants && { gte: minParticipants }),
              ...(maxParticipants && { lte: maxParticipants }),
            },
          }
        : {}),
      ...(userId && {
        roles: {
          some: {
            users: {
              some: {
                id: userId,
              },
            },
          },
        },
      }),
    };

    const [projects, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        include: { category: true, roles: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      total,
      projects: projects.map((project) => ProjectMapper.toResponse(project)),
    };
  }

  public async createProject(
    userId: string,
    createProjectDto: CreateProjectDto,
    file: Express.Multer.File,
  ): Promise<ProjectResponseDto> {
    const activeProjects = await this.getProjects({
      userId,
      status: ProjectStatus.active,
    });

    if (activeProjects.total >= 2) {
      throw new BadRequestException(
        'You have reached the limit of active projects',
      );
    }

    try {
      return this.prisma.$transaction(async (prisma) => {
        const project = await prisma.project.create({
          data: {
            ownerId: userId,
            projectName: createProjectDto.projectName,
            description: createProjectDto.description,
            categoryId: createProjectDto.categoryId,
          },
        });

        const ownerRoleType =
          await this.projectRolesService.findOrCreateRole('Project owner');
        const ownerRole = await prisma.projectRole.create({
          data: {
            roleTypeId: ownerRoleType.id,
            projectId: project.id,
          },
        });

        await prisma.user.update({
          where: { id: userId },
          data: {
            projectRoles: {
              connect: { id: ownerRole.id },
            },
          },
        });

        const logoUrl = await this.cloudinaryService.uploadProjectLogo(
          file,
          project.id,
        );

        const updatedProject = await prisma.project.update({
          where: { id: project.id },
          data: {
            logoUrl,
          },
          include: { category: true, roles: true },
        });

        return ProjectMapper.toResponse(updatedProject);
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(
          `Database error: ${error.message}`,
        );
      }
      throw error;
    }
  }

  public async getProjectById(id: string): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        category: true,
        roles: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return ProjectMapper.toResponse(project);
  }

  public async updateProject(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    try {
      const updatedProject = await this.prisma.project.update({
        where: { id },
        data: updateProjectDto,
        include: {
          category: true,
          roles: true,
        },
      });

      return ProjectMapper.toResponse(updatedProject);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2001'
      ) {
        throw new NotFoundException('Project not found');
      }
      throw error;
    }
  }

  public async deleteProject(id: string): Promise<void> {
    try {
      await this.prisma.project.delete({
        where: { id },
      });
      await this.cloudinaryService.deleteProjectFolder(id);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Project not found');
      }
      throw error;
    }
  }

  public async updateProjectLogo(
    id: string,
    file: Express.Multer.File,
  ): Promise<ProjectResponseDto> {
    try {
      const logoUrl = await this.cloudinaryService.uploadProjectLogo(file, id);
      const updatedProject = await this.prisma.project.update({
        where: { id },
        data: { logoUrl },
        include: {
          category: true,
          roles: true,
        },
      });

      return ProjectMapper.toResponse(updatedProject);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2001'
      ) {
        throw new NotFoundException('Project not found');
      }
      throw error;
    }
  }
}
