import { PickType } from '@nestjs/swagger';
import { UserResponseDto } from './user.response-dto';

export class UserCardResponseDto extends PickType(UserResponseDto, [
  'firstName',
  'lastName',
  'avatarUrl',
  'id',
  'educations',
  'activeProjectsCount',
]) {}
