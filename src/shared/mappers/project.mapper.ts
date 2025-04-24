import { Project, ProjectCategory, ProjectRole } from '@prisma/client';
import { ProjectResponseDto } from '../../projects/dto/project.response-dto';
import { ProjectRoleMapper } from './project-role.mapper';

export class ProjectMapper {
  public static toResponse(
    project: Project & {
      category: ProjectCategory;
      roles: ProjectRole[];
    },
  ): ProjectResponseDto {
    return {
      id: project.id,
      projectName: project.projectName,
      description: project.description,
      ownerId: project.ownerId,
      participantsCount: project.participantsCount,
      status: project.status,
      slackUrl: project.slackUrl,
      logoUrl: project.logoUrl ?? '',
      createdAt: project.createdAt,
      category: project.category,
      roles: project.roles.map((role) => ProjectRoleMapper.toResponse(role)),
    };
  }
}
