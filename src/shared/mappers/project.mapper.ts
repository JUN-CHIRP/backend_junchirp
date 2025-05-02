import {
  Project,
  ProjectCategory,
  ProjectRole,
  Document,
  ProjectRoleType,
} from '@prisma/client';
import { ProjectResponseDto } from '../../projects/dto/project.response-dto';
import { ProjectRoleMapper } from './project-role.mapper';
import { ProjectCardResponseDto } from '../../projects/dto/project-card.response-dto';

export class ProjectMapper {
  public static toCardResponse(
    project: Project & {
      category: ProjectCategory;
      roles: (ProjectRole & { roleType: ProjectRoleType })[];
    },
  ): ProjectCardResponseDto {
    return {
      id: project.id,
      projectName: project.projectName,
      description: project.description,
      ownerId: project.ownerId,
      participantsCount: project.participantsCount,
      status: project.status,
      createdAt: project.createdAt,
      category: project.category,
      roles: project.roles.map((role) =>
        ProjectRoleMapper.toBaseResponse(role),
      ),
    };
  }

  public static toFullResponse(
    project: Project & {
      category: ProjectCategory;
      roles: (ProjectRole & { roleType: ProjectRoleType })[];
      documents: Document[];
    },
  ): ProjectResponseDto {
    return {
      ...this.toCardResponse(project),
      slackUrl: project.slackUrl,
      logoUrl: project.logoUrl ?? '',
      documents: project.documents,
    };
  }
}
