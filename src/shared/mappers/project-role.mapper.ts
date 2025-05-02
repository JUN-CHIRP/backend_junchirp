import {
  Project,
  ProjectCategory,
  ProjectRole,
  ProjectRoleType,
} from '@prisma/client';
import { ProjectRoleResponseDto } from '../../project-roles/dto/project-role.response-dto';
import { ProjectRoleWithProjectResponseDto } from '../../project-roles/dto/project-role-with-project.response-dto';
import { ProjectMapper } from './project.mapper';

export class ProjectRoleMapper {
  public static toBaseResponse(
    role: ProjectRole & { roleType: ProjectRoleType },
  ): ProjectRoleResponseDto {
    return {
      id: role.id,
      roleType: role.roleType,
    };
  }

  public static toExpandResponse(
    role: ProjectRole & {
      roleType: ProjectRoleType;
      project: Project & {
        category: ProjectCategory;
        roles: (ProjectRole & { roleType: ProjectRoleType })[];
      };
    },
  ): ProjectRoleWithProjectResponseDto {
    return {
      id: role.id,
      roleType: role.roleType,
      project: ProjectMapper.toCardResponse(role.project),
    };
  }
}
