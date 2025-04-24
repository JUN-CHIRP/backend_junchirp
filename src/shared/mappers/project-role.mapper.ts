import { ProjectRole } from '@prisma/client';
import { ProjectRoleResponseDto } from '../../project-roles/dto/project-role.response-dto';

export class ProjectRoleMapper {
  public static toResponse(role: ProjectRole): ProjectRoleResponseDto {
    return {
      id: role.id,
      roleTypeId: role.roleTypeId,
    };
  }
}
