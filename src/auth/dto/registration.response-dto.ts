import { ApiProperty } from '@nestjs/swagger';

import { LoginResponseDto } from './login.response-dto';

export class RegistrationResponseDto extends LoginResponseDto {
  @ApiProperty({
    example: '2025-03-10T12:43:26.437Z',
    description: 'Code expiration time',
  })
  codeExpiresAt: Date;
}
