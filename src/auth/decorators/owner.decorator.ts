import { applyDecorators, UseGuards } from '@nestjs/common';
import { Auth } from './auth.decorator';
import { OwnerGuard } from '../guards/owner/owner.guard';

export const Owner = (): MethodDecorator & ClassDecorator =>
  applyDecorators(Auth(), UseGuards(OwnerGuard));
