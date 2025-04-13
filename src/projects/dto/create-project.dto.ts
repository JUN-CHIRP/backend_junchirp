import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';
import { CreateProjectRoleDto } from './create-project-role.dto';
import { Transform, Type } from 'class-transformer';

export class CreateProjectDto {
  @ApiProperty({ example: 'Project name', description: 'Project name' })
  @IsString({ message: 'Must be a string' })
  @Length(2, 50, { message: 'Must be between 2 and 50 characters' })
  @IsNotEmpty({ message: 'Project name is required' })
  public readonly projectName: string;

  @ApiProperty({
    example: 'Project description',
    description: 'Project description',
  })
  @IsString({ message: 'Must be a string' })
  @Length(2, 500, { message: 'Must be between 2 and 500 characters' })
  @IsNotEmpty({ message: 'Project name is required' })
  public readonly description: string;

  @ApiProperty({
    example: 'e960a0fb-891a-4f02-9f39-39ac3bb08621',
    description: 'Category id',
  })
  @IsUUID(4, { message: 'Must be a string in UUIDv4 format' })
  @IsNotEmpty({ message: 'ID is required' })
  public readonly categoryId: string;

  @ApiProperty({
    type: [CreateProjectRoleDto],
    description: 'Array of project roles',
  })
  @Transform(({ value }) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      throw new Error('Invalid JSON for roles');
    }
  })
  @IsArray({ message: 'Roles must be an array' })
  @ArrayNotEmpty({ message: 'Roles must contain at least one item' })
  @ValidateNested({ each: true })
  @Type(() => CreateProjectRoleDto)
  public readonly roles: CreateProjectRoleDto[];
}
