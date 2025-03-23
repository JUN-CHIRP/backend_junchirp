import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({ example: 'token', description: 'Access token' })
  public readonly accessToken: string;
}
