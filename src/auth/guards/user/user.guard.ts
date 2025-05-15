import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../../../users/users.service';

@Injectable()
export class UserGuard implements CanActivate {
  public constructor(private readonly userService: UsersService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user && !user.isVerified) {
      throw new UnauthorizedException('Email not confirmed');
    }

    return true;
  }
}
