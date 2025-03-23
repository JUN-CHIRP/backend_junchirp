import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

export const Auth = (): MethodDecorator & ClassDecorator =>
  applyDecorators(ApiBearerAuth(), UseGuards(JwtAuthGuard));
