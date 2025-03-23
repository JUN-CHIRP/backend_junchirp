import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  public constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true, // Щоб кожен раз не перелогінюватись токен не втрачає актуальності
      secretOrKey: configService.get<string>('JWT_SECRET') as string,
    });
  }

  public async validate({ id }: { id: string }): Promise<User> {
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new UnauthorizedException('Invalid token: user not found');
    }
    return user;
  }
}
