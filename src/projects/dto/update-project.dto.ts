import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';
import { IsIn, IsOptional } from 'class-validator';
import { ProjectStatus } from '@prisma/client';

export class UpdateProjectDto extends PartialType(
  PickType(CreateProjectDto, ['projectName', 'description', 'categoryId']),
) {
  @ApiProperty({
    example: 'active',
    description: 'Project status',
    required: false,
  })
  @IsOptional()
  @IsIn(['active', 'done'], { message: 'Value must be "active" or "done"' })
  public readonly status?: ProjectStatus;
}
