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
  OWNER_MODEL_KEY,
  PROJECT_ID_KEY_KEY,
  PROJECT_ID_SOURCE_KEY,
} from '../../../shared/constants/owner-metadata';

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
    const model: string =
      this.reflector.get(OWNER_MODEL_KEY, context.getHandler()) ?? 'project';

    const container = request[source];
    const resourceId = container?.[key];

    if (!resourceId) {
      throw new BadRequestException(`Missing resource ID in ${source}.${key}`);
    }

    let isOwner = false;

    switch (model) {
      case 'project':
        isOwner = !!(await this.prisma.project.findFirst({
          where: {
            id: resourceId,
            ownerId: user.id,
          },
        }));
        break;

      case 'document':
        isOwner = !!(await this.prisma.document.findFirst({
          where: {
            id: resourceId,
            project: {
              ownerId: user.id,
            },
          },
        }));
        break;

      case 'projectRole':
        isOwner = !!(await this.prisma.projectRole.findFirst({
          where: {
            id: resourceId,
            project: {
              ownerId: user.id,
            },
          },
        }));
        break;

      case 'participationRequest':
        isOwner = !!(await this.prisma.participationRequest.findFirst({
          where: {
            id: resourceId,
            projectRole: {
              project: {
                ownerId: user.id,
              },
            },
          },
        }));
        break;

      case 'participationInvite':
        isOwner = !!(await this.prisma.participationInvite.findFirst({
          where: {
            id: resourceId,
            projectRole: {
              project: {
                ownerId: user.id,
              },
            },
          },
        }));
        break;

      default:
        throw new BadRequestException(`Unsupported model: ${model}`);
    }

    if (!isOwner) {
      throw new ForbiddenException(
        'Access denied: you are not the project owner',
      );
    }

    return true;
  }
}
