import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Reflector } from '@nestjs/core';
import {
  PROJECT_ID_KEY_KEY,
  PROJECT_ID_SOURCE_KEY,
} from '../../decorators/owner.decorator';

@Injectable()
export class OwnerGuard implements CanActivate {
  public constructor(
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const source: 'params' | 'body' | 'query' =
      this.reflector.get(PROJECT_ID_SOURCE_KEY, context.getHandler()) ??
      'params';
    const key: string =
      this.reflector.get(PROJECT_ID_KEY_KEY, context.getHandler()) ?? 'id';

    const container = request[source];
    const projectId = container?.[key];

    if (!projectId) {
      throw new BadRequestException(`Missing project ID in ${source}.${key}`);
    }

    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
        ownerId: user.id,
      },
    });

    if (!project) {
      throw new ForbiddenException(
        'Access denied: you are not the project owner',
      );
    }

    return true;
  }
}
