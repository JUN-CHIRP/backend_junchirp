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
} from '../../../shared/constants/owner-member-metadata';

@Injectable()
export class MemberGuard implements CanActivate {
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

    let isParticipant = false;

    switch (model) {
      case 'project':
        isParticipant = !!(await this.prisma.project.findFirst({
          where: {
            id: resourceId,
            roles: {
              some: {
                users: {
                  some: {
                    id: user.id,
                  },
                },
              },
            },
          },
        }));
        break;

      case 'board':
        isParticipant = !!(await this.prisma.board.findFirst({
          where: {
            id: resourceId,
            project: {
              roles: {
                some: {
                  users: {
                    some: {
                      id: user.id,
                    },
                  },
                },
              },
            },
          },
        }));
        break;

      case 'task':
        isParticipant = !!(await this.prisma.task.findFirst({
          where: {
            id: resourceId,
            taskStatus: {
              board: {
                project: {
                  roles: {
                    some: {
                      users: {
                        some: {
                          id: user.id,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }));
        break;

      default:
        throw new BadRequestException(`Unsupported model: ${model}`);
    }

    if (!isParticipant) {
      throw new ForbiddenException(
        'Access denied: you are not a participant of this project',
      );
    }

    return true;
  }
}
