import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectCategoryResponseDto } from './dto/project-category.response-dto';
import { ProjectRoleTypeResponseDto } from './dto/project-role-type.response-dto';
import { ProjectResponseDto } from './dto/project.response-dto';
import { ProjectsListResponseDto } from './dto/projects-list.response-dto';
import { ProjectMapper } from '../shared/mappers/project.mapper';
import { Prisma, ProjectRoleType, ProjectStatus } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateProjectRoleDto } from './dto/create-project-role.dto';

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
  ) {}

  public async getCategories(): Promise<ProjectCategoryResponseDto[]> {
    return this.prisma.projectCategory.findMany();
  }

  public async getProjectRoleTypes(): Promise<ProjectRoleTypeResponseDto[]> {
    return this.prisma.projectRoleType.findMany();
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
        include: { category: true },
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
        const projectRoles: CreateProjectRoleDto[] = JSON.parse(
          createProjectDto.roles as unknown as string,
        );

        const project = await prisma.project.create({
          data: {
            ownerId: userId,
            projectName: createProjectDto.projectName,
            description: createProjectDto.description,
            categoryId: createProjectDto.categoryId,
            participantsCount: projectRoles.reduce(
              (sum, role) => sum + role.slots,
              1,
            ),
          },
        });

        const ownerRoleType = await this.findOrCreateRole('Project owner');
        const ownerRole = await prisma.projectRole.create({
          data: {
            roleTypeId: ownerRoleType.id,
            slots: 1,
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

        await prisma.projectRole.createMany({
          data: [
            ...projectRoles.map((role) => ({
              ...role,
              projectId: project.id,
            })),
          ],
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
          include: { category: true },
        });

        return ProjectMapper.toResponse(updatedProject);
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException('Database error');
      }
      throw error;
    }
  }

  public async findOrCreateRole(roleName: string): Promise<ProjectRoleType> {
    return this.prisma.projectRoleType.upsert({
      where: { roleName },
      update: {},
      create: { roleName },
    });
  }
}
