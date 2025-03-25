import { ApiProperty } from '@nestjs/swagger';

export class EducationResponseDto {
  @ApiProperty({
    example: 'a4d4eb0c-1a10-455e-b9e9-1af147a77762',
    description: 'Unique identifier',
  })
  public readonly id: string;

  @ApiProperty({
    example: 'Ivan Franko National University of Lviv',
    description: 'Name of the educational institution',
  })
  public readonly institution: string;

  @ApiProperty({ example: 'Mathematics', description: 'Speciality' })
  public readonly speciality: string;
}
