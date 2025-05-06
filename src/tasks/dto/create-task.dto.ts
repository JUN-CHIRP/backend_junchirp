import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsString,
  IsUUID,
  Length,
  Validate,
} from 'class-validator';
import { TaskPriority } from '@prisma/client';

export class CreateTaskDto {
  @ApiProperty({ example: 'Task name', description: 'Task name' })
  @IsString({ message: 'Must be a string' })
  @Length(2, 100, { message: 'Must be between 2 and 100 characters' })
  @IsNotEmpty({ message: 'Task name is required' })
  public readonly taskName: string;

  @ApiProperty({
    example: 'Task description',
    description: 'Task description',
  })
  @IsString({ message: 'Must be a string' })
  @Length(2, 1000, { message: 'Must be between 2 and 1000 characters' })
  @IsNotEmpty({ message: 'Task description is required' })
  public readonly description: string;

  @ApiProperty({
    example: 'high',
    description: 'Task priority',
  })
  @IsIn(['high', 'normal', 'low'], {
    message: 'Value must be "high", "normal" or "low"',
  })
  @IsNotEmpty({ message: 'Task priority is required' })
  public readonly priority: TaskPriority;

  @ApiProperty({
    example: '2025-04-11 11:51:05.224',
    description: 'Task deadline',
  })
  @IsDateString({}, { message: 'Must be a valid date string' })
  @Validate((value: string) => new Date(value) > new Date(), {
    message: 'Date must be in the future',
  })
  @IsNotEmpty({ message: 'Task deadline is required' })
  public readonly deadline: string;

  @ApiProperty({
    example: 'e960a0fb-891a-4f02-9f39-39ac3bb08621',
    description: 'Task status id',
  })
  @IsUUID(4, { message: 'Must be a string in UUIDv4 format' })
  @IsNotEmpty({ message: 'Column id ID is required' })
  public readonly taskStatusId: string;
}
