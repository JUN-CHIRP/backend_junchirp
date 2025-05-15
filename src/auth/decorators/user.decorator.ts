import { applyDecorators, UseGuards } from '@nestjs/common';
import { Auth } from './auth.decorator';
import { UserGuard } from '../guards/user/user.guard';

export const User = (): MethodDecorator & ClassDecorator =>
  applyDecorators(Auth(), UseGuards(UserGuard));
