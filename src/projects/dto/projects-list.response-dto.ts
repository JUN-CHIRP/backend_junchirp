import { ApiProperty } from '@nestjs/swagger';
import { ProjectResponseDto } from './project.response-dto';

export class ProjectsListResponseDto {
  @ApiProperty({
    example: 43,
    description: 'Total number of projects',
  })
  public readonly total: number;

  @ApiProperty({ type: () => [ProjectResponseDto] })
  public readonly projects: ProjectResponseDto[];
}
