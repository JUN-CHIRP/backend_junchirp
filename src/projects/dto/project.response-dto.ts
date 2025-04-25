import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus } from '@prisma/client';
import { ProjectCategoryResponseDto } from './project-category.response-dto';
import { ProjectRoleResponseDto } from '../../project-roles/dto/project-role.response-dto';
import { DocumentResponseDto } from '../../documents/dto/document.response-dto';
import { ProjectCardResponseDto } from './project-card.response-dto';

export class ProjectResponseDto extends ProjectCardResponseDto {
  @ApiProperty({
    example: 'slack-url',
    description: 'Slack url',
    type: String,
  })
  public readonly slackUrl: string | null;

  @ApiProperty({
    example: 'logo-url',
    description: 'Project logo url',
  })
  public readonly logoUrl: string;

  @ApiProperty({ type: () => [ProjectRoleResponseDto] })
  public readonly roles: ProjectRoleResponseDto[];

  @ApiProperty({ type: () => [DocumentResponseDto] })
  public readonly documents: DocumentResponseDto[];
}
