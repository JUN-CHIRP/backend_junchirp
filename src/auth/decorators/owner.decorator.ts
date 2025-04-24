import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { Auth } from './auth.decorator';
import { OwnerGuard } from '../guards/owner/owner.guard';

export const PROJECT_ID_SOURCE_KEY = 'projectIdSource';
export const PROJECT_ID_KEY_KEY = 'projectIdKey';

export const Owner = (
  source: 'params' | 'body' | 'query' = 'params',
  key = 'id',
): MethodDecorator & ClassDecorator =>
  applyDecorators(
    SetMetadata(PROJECT_ID_SOURCE_KEY, source),
    SetMetadata(PROJECT_ID_KEY_KEY, key),
    Auth(),
    UseGuards(OwnerGuard),
  );
