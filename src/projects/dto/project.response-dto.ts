import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus } from '@prisma/client';
import { ProjectCategoryResponseDto } from './project-category.response-dto';

export class ProjectResponseDto {
  @ApiProperty({
    example: 'a4d4eb0c-1a10-455e-b9e9-1af147a77762',
    description: 'Unique identifier',
  })
  public readonly id: string;

  @ApiProperty({ example: 'Project name', description: 'Project name' })
  public readonly projectName: string;

  @ApiProperty({
    example: 'Project description',
    description: 'Project description',
  })
  public readonly description: string;

  @ApiProperty({
    example: 'active',
    description: 'Project status',
  })
  public readonly status: ProjectStatus;

  @ApiProperty({
    example: '2025-04-11 11:51:05.224',
    description: 'Creation date and time',
  })
  public readonly createdAt: Date;

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

  @ApiProperty({
    example: 7,
    description: 'Participants count',
  })
  public readonly participantsCount: number;

  @ApiProperty({
    example: '9d7a0575-3779-44ba-a6e3-7d229f6096ec',
    description: 'Owner identifier',
  })
  public readonly ownerId: string;

  @ApiProperty({ type: () => ProjectCategoryResponseDto })
  public readonly category: ProjectCategoryResponseDto;
}
