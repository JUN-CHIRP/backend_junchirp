import { ApiProperty } from '@nestjs/swagger';
import { Role, User } from '@prisma/client';

import { MessageResponseDto } from './message.response-dto';

export class LoginResponseDto extends MessageResponseDto {
  @ApiProperty({
    example: {
      id: 'ef7caac0-0cd2-4856-987d-5a74b43f2834',
      email: 'email@mail.com',
      name: 'John Doe',
      avatarUrl: null,
      createdAt: '2025-03-10T12:43:26.437Z',
      isVerified: false,
      role: Role.USER,
    },
    description: 'Response data user',
  })
  user: Omit<User, 'password'>;

  @ApiProperty({ example: 'token', description: 'Response status' })
  accessToken: string;
}
