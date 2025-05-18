import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { ProjectStatus } from '@prisma/client';

export class UpdateProjectStatusDto {
  @ApiProperty({
    example: 'active',
    description: 'Project status',
  })
  @IsIn(['active', 'done'], { message: 'Value must be "active" or "done"' })
  public readonly status?: ProjectStatus;
}
