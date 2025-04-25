import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import {
  PROJECT_ID_KEY_KEY,
  PROJECT_ID_SOURCE_KEY,
} from '../../shared/constants/project-metadata';
import { Auth } from './auth.decorator';
import { MemberGuard } from '../guards/member/member.guard';

export const Member = (
  source: 'params' | 'body' | 'query' = 'params',
  key = 'id',
): MethodDecorator & ClassDecorator =>
  applyDecorators(
    SetMetadata(PROJECT_ID_SOURCE_KEY, source),
    SetMetadata(PROJECT_ID_KEY_KEY, key),
    Auth(),
    UseGuards(MemberGuard),
  );
