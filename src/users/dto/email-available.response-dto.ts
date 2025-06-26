import { ApiProperty } from '@nestjs/swagger';

export class EmailAvailableResponseDto {
  @ApiProperty({ example: true, description: 'Email is available' })
  public readonly isAvailable: boolean;

  @ApiProperty({ example: true, description: 'Email is confirmed' })
  public readonly isConfirmed: boolean;
}
