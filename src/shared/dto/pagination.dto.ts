import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    example: 1,
    description: 'Page number',
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Must be an integer number' })
  @Min(1, { message: 'Minimum allowable value is 1' })
  public readonly page?: number = 1;

  @ApiProperty({
    example: 10,
    description: 'Number of elements per page',
    default: 10,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Must be an integer number' })
  @Min(10, { message: 'Minimum allowable value is 10' })
  public readonly limit?: number = 10;
}
