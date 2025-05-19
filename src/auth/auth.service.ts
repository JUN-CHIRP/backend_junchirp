import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { UserResponseDto } from '../users/dto/user.response-dto';
import { AuthResponseDto } from './dto/auth.response-dto';
import { UserWithPasswordResponseDto } from '../users/dto/user-with-password.response-dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { TooManyRequestsException } from '../shared/exceptions/too-many-requests.exception';
import { RedisService } from '../redis/redis.service';
import { MessageResponseDto } from '../users/dto/message.response-dto';
import { LoggerService } from '../logger/logger.service';
import { v4 as uuidV4 } from 'uuid';

@Injectable()
export class AuthService {
  private EXPIRE_DAY_REFRESH_TOKEN = 7;

  private REFRESH_TOKEN_NAME = 'refreshToken';

  public constructor(
    private usersService: UsersService,
    private mailService: MailService,
    private configService: ConfigService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private redisService: RedisService,
    private loggerService: LoggerService,
  ) {}

  public async validateUser(
    req: Request,
    loginDto: LoginDto,
  ): Promise<UserResponseDto> {
    const user = (await this.usersService.getUserByEmail(
      loginDto.email,
      true,
    )) as UserWithPasswordResponseDto | null;
    const ip =
      req.ip ??
      req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ??
      req.socket.remoteAddress;

    if (!user) {
      await this.loggerService.log(
        ip ?? 'unknown',
        loginDto.email,
        'login',
        'Email or password is incorrect',
      );
      throw new UnauthorizedException('Email or password is incorrect');
    }

    const loginAttempt = await this.prisma.loginAttempt.findUnique({
      where: { userId: user.id },
    });

    if (loginAttempt) {
      const now = new Date();
      if (loginAttempt.blockedUntil && now < loginAttempt.blockedUntil) {
        await this.loggerService.log(
          ip ?? 'unknown',
          loginDto.email,
          'login',
          'Too many failed attempts. Please try again later',
        );
        throw new TooManyRequestsException(
          'Too many failed attempts. Please try again later',
          loginAttempt.attemptsCount,
        );
      }
    }

    const passwordEquals = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (passwordEquals) {
      if (loginAttempt) {
        await this.prisma.loginAttempt.delete({
          where: { userId: user.id },
        });
      }
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } else {
      if (loginAttempt) {
        const updateData: {
          attemptsCount: number;
          blockedUntil?: Date;
        } = {
          attemptsCount: loginAttempt.attemptsCount + 1,
        };

        if (loginAttempt.attemptsCount + 1 >= 5 && !loginAttempt.blockedUntil) {
          updateData.blockedUntil = new Date(
            new Date().getTime() + 15 * 60 * 1000,
          );
        }

        if (
          loginAttempt.attemptsCount + 1 >= 10 &&
          !loginAttempt.blockedUntil
        ) {
          updateData.blockedUntil = new Date(
            new Date().getTime() + 60 * 60 * 1000,
          );
        }

        if (
          loginAttempt.attemptsCount + 1 >= 15 &&
          !loginAttempt.blockedUntil
        ) {
          updateData.blockedUntil = new Date(
            new Date().getTime() + 365 * 24 * 60 * 60 * 1000,
          );
        }

        await this.prisma.loginAttempt.update({
          where: { userId: user.id },
          data: updateData,
        });

        if ([5, 10, 15].includes(updateData.attemptsCount)) {
          await this.loggerService.log(
            ip ?? 'unknown',
            loginDto.email,
            'login',
            'Too many failed attempts. Please try again later',
          );
          throw new TooManyRequestsException(
            'Too many failed attempts. Please try again later',
            updateData.attemptsCount,
          );
        }
      } else {
        await this.prisma.loginAttempt.create({
          data: {
            userId: user.id,
            attemptsCount: 1,
          },
        });
      }

      await this.loggerService.log(
        ip ?? 'unknown',
        loginDto.email,
        'login',
        'Email or password is incorrect',
      );
      throw new UnauthorizedException('Email or password is incorrect');
    }
  }

  public async login(
    ip: string,
    req: Request,
    res: Response,
  ): Promise<AuthResponseDto> {
    const user: UserWithPasswordResponseDto =
      req.user as UserWithPasswordResponseDto;
    const { accessToken, refreshToken } = this.createTokens(user.id);
    this.addRefreshTokenToResponse(res, refreshToken);
    const { password, ...userWithoutPassword } = user;

    await this.loggerService.log(
      ip,
      user.email,
      'login',
      'User login successfully',
    );

    return {
      user: userWithoutPassword,
      accessToken,
    };
  }

  public async registration(
    createUserDto: CreateUserDto,
    ip: string,
    res: Response,
  ): Promise<AuthResponseDto> {
    const candidate = await this.usersService.getUserByEmail(
      createUserDto.email,
      false,
    );

    if (candidate) {
      await this.loggerService.log(
        ip,
        createUserDto.email,
        'registration',
        'User with this email already exists',
      );
      throw new ConflictException('User with this email already exists');
    }

    const hashPassword = await bcrypt.hash(createUserDto.password, 10);
    await this.usersService.createUser({
      ...createUserDto,
      password: hashPassword,
    });

    const user = await this.usersService.getUserByEmail(
      createUserDto.email,
      false,
    );

    if (!user) {
      await this.loggerService.log(
        ip,
        createUserDto.email,
        'registration',
        'Something went wrong. Please try again later',
      );
      throw new InternalServerErrorException(
        'Something went wrong. Please try again later',
      );
    }

    await this.loggerService.log(
      ip,
      createUserDto.email,
      'registration',
      'User registered successfully',
    );

    const { accessToken, refreshToken } = this.createTokens(user.id);
    this.addRefreshTokenToResponse(res, refreshToken);
    const record = await this.usersService.createVerificationUrl(
      ip,
      createUserDto.email,
    );
    const url = `${this.configService.get('BASE_FRONTEND_URL')}?token=${record.token}`;

    this.mailService
      .sendVerificationMail(createUserDto.email, url)
      .catch((err) => {
        console.error('Error sending verification url:', err);
      });

    return { user, accessToken };
  }

  public createAccessToken(userId: string): string {
    const data = { id: userId };

    return this.jwtService.sign(data, {
      expiresIn: this.configService.get('EXPIRE_TIME_ACCESS_TOKEN'),
    });
  }

  public createRefreshToken(userId: string): string {
    const data = { id: userId };

    return this.jwtService.sign(data, {
      expiresIn: this.configService.get('EXPIRE_TIME_REFRESH_TOKEN'),
    });
  }

  public createTokens(userId: string): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessToken = this.createAccessToken(userId);
    const refreshToken = this.createRefreshToken(userId);

    return {
      accessToken,
      refreshToken,
    };
  }

  public addRefreshTokenToResponse(res: Response, refreshToken: string): void {
    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN);

    res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      expires: expiresIn,
      secure: true,
      sameSite: 'none',
    });
  }

  public validateRefreshToken(refreshToken: string): string {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      return payload.userId;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  public regenerateAccessToken(req: Request): { accessToken: string } {
    const refreshToken = req.cookies['refreshToken'];
    const userId = this.validateRefreshToken(refreshToken);
    const newAccessToken = this.createAccessToken(userId);
    return { accessToken: newAccessToken };
  }

  public async logout(
    ip: string,
    req: Request,
    res: Response,
  ): Promise<MessageResponseDto> {
    const accessToken = req.headers.authorization?.split(' ')[1];
    const user = req.user as UserResponseDto;

    if (!accessToken) {
      await this.loggerService.log(
        ip,
        user.email,
        'logout',
        'Token is missing',
      );
      throw new UnauthorizedException('Token is missing');
    }

    try {
      const { exp } = this.jwtService.decode(accessToken) as { exp: number };
      const expiresIn = exp - Math.floor(Date.now() / 1000);

      if (expiresIn > 0) {
        await this.redisService.addToBlacklist(accessToken, expiresIn);
      }

      res.clearCookie('refreshToken', { httpOnly: true, secure: true });
      await this.loggerService.log(
        ip,
        user.email,
        'logout',
        'Logged out successfully',
      );
      return { message: 'Logged out successfully' };
    } catch (error) {
      await this.loggerService.log(
        ip,
        user.email,
        'logout',
        'Token is invalid',
      );
      throw new UnauthorizedException(`Token is invalid: ${error}`);
    }
  }

  public async googleLogin(
    ip: string,
    req: Request,
    res: Response,
  ): Promise<AuthResponseDto> {
    if (!req.user) {
      await this.loggerService.log(
        ip,
        'unknown',
        'google login',
        'Google authentication failed',
      );
      throw new UnauthorizedException('Google authentication failed');
    }

    const reqUser = req.user as {
      googleId: string;
      firstName: string;
      lastName: string;
      email: string;
      picture: string;
      accessToken: string;
      refreshToken: string;
    };

    const user = await this.usersService.createOrUpdateGoogleUser(ip, reqUser);
    const { accessToken, refreshToken } = this.createTokens(user.id);
    this.addRefreshTokenToResponse(res, refreshToken);

    await this.loggerService.log(
      ip,
      'unknown',
      'google login',
      'Google authentication successfully',
    );

    return { user, accessToken };
  }

  public async redirectToDiscord(req: Request, res: Response): Promise<void> {
    const currentUserId = (req.user as UserResponseDto).id;
    const state = uuidV4();

    await this.redisService.set(state, currentUserId, 300);

    const redirectUrl = `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      this.configService.get<string>('DISCORD_CALLBACK_URL') as string,
    )}&response_type=code&scope=identify&state=${state}`;

    res.redirect(redirectUrl);
  }

  public async handleDiscordCallback(
    req: Request,
    state: string,
  ): Promise<UserResponseDto> {
    const userId = await this.redisService.get(state);

    if (!userId) {
      throw new UnauthorizedException('Invalid or expired state');
    }

    const { discordId } = req.user as { discordId: string };
    await this.redisService.del(state);
    return this.usersService.linkDiscord(userId, discordId);
  }
}
