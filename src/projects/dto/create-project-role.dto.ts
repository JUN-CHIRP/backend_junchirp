import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class CreateProjectRoleDto {
  @ApiProperty({
    example: 'e960a0fb-891a-4f02-9f39-39ac3bb08621',
    description: 'Role type id',
  })
  @IsUUID(4, { message: 'Must be a string in UUIDv4 format' })
  @IsNotEmpty({ message: 'ID is required' })
  public readonly roleTypeId: string;

  @ApiProperty({ example: 3, description: 'Slots number for this role' })
  @IsInt({ message: 'Must be an integer number' })
  @Min(1, { message: 'Minimum allowable value is 1' })
  @IsNotEmpty({ message: 'Slots number is required' })
  public readonly slots: number;
}
