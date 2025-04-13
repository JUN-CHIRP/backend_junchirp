import { Project, ProjectCategory } from '@prisma/client';
import { ProjectResponseDto } from '../../projects/dto/project.response-dto';

export class ProjectMapper {
  public static toResponse(
    project: Project & {
      category: ProjectCategory;
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
      category: {
        id: project.category.id,
        categoryName: project.category.categoryName,
      },
    };
  }
}
