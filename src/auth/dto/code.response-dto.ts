import { ApiProperty } from '@nestjs/swagger';

import { MessageResponseDto } from './message.response-dto';

export class CodeResponseDto extends MessageResponseDto {
  @ApiProperty({
    example: '2025-03-10T12:43:26.437Z',
    description: 'Code expiration time',
  })
  expiresAt: Date;
}
