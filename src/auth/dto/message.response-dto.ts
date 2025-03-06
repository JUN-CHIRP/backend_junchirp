import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({ example: true, description: 'Response status' })
  public readonly success: boolean;

  @ApiProperty({ example: 'message', description: 'Response message' })
  public readonly message: string;
}
