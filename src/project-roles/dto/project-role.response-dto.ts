import { ApiProperty } from '@nestjs/swagger';

export class ProjectRoleResponseDto {
  @ApiProperty({
    example: 'a4d4eb0c-1a10-455e-b9e9-1af147a77762',
    description: 'Unique identifier',
  })
  public readonly id: string;

  @ApiProperty({
    example: '03040bb6-4850-481d-aa52-11d21219a6cb',
    description: 'Role type id',
  })
  public readonly roleTypeId: string;
}
