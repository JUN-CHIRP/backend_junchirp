import { ApiProperty, PickType } from '@nestjs/swagger';
import { UserResponseDto } from './user.response-dto';

export class UserCardResponseDto extends PickType(UserResponseDto, [
  'firstName',
  'lastName',
  'avatarUrl',
  'id',
  'educations',
]) {
  @ApiProperty({ example: 2, description: 'Number of active projects' })
  public readonly activeProjectsCount: number;
}
