import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class OwnerGuard implements CanActivate {
  public constructor(private prisma: PrismaService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const projectId = request.projectId;

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
