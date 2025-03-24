import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user.response-dto';

export class AuthResponseDto {
  @ApiProperty({ type: () => UserResponseDto })
  public readonly user: UserResponseDto;

  @ApiProperty({ example: 'token', description: 'Access token' })
  public readonly accessToken: string;
}
