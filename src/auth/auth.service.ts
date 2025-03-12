import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User, VerificationCode } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Response } from 'express';

import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

import { AuthDto } from './dto/auth.dto';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { LoginResponseDto } from './dto/login.response-dto';
import { MessageResponseDto } from './dto/message.response-dto';

@Injectable()
export class AuthService {
  private EXPIRE_DAY_REFRESH_TOKEN = 1;

  private REFRESH_TOKEN_NAME = 'refreshToken';

  public constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private mailService: MailService,
    private configService: ConfigService,
    private jwt: JwtService,
  ) {}

  private async validateUser(email: string): Promise<User> {
    const user = await this.usersService.getUserByEmail(email);

    if (!user) {
      throw new NotFoundException('User is not found');
    }

    return user;
  }

  async registration(
    createUserDto: CreateUserDto,
  ): Promise<LoginResponseDto & { refreshToken: string }> {
    const candidate = await this.usersService.getUserByEmail(
      createUserDto.email,
    );

    if (candidate) {
      throw new ConflictException('A user with this email already exists');
    }

    const hashPassword = await bcrypt.hash(createUserDto.password, 10);
    const message =
      'Registration successful. Please check your email for confirmation.';
    await this.usersService.createUser({
      ...createUserDto,
      password: hashPassword,
    });

    const user = await this.validateUser(createUserDto.email);
    const tokens = this.issueTokens(user.id);
    const { password, ...userWithoutPassword } = user;

    this.sendVerificationCode(createUserDto.email, message).catch((err) => {
      console.error('Error sending verification code:', err);
    });

    return {
      user: userWithoutPassword,
      ...tokens,
      success: true,
      message,
    };
  }

  async createVerificationCode(email: string): Promise<VerificationCode> {
    const user = await this.validateUser(email);
    const code = crypto.randomInt(100000, 999999).toString();

    return this.prisma.verificationCode.upsert({
      where: { userId: user.id },
      update: { code, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
      create: {
        userId: user.id,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });
  }

  async sendVerificationCode(
    email: string,
    message: string,
  ): Promise<MessageResponseDto> {
    const record = await this.createVerificationCode(email);
    await this.mailService.sendMail(email, record.code);

    return {
      success: true,
      message,
    };
  }

  async confirmEmail(
    confirmEmailDto: ConfirmEmailDto,
  ): Promise<MessageResponseDto> {
    const user = await this.validateUser(confirmEmailDto.email);

    const verificationCode = await this.prisma.verificationCode.findUnique({
      where: { userId: user.id },
    });

    if (!verificationCode || verificationCode.code !== confirmEmailDto.code) {
      throw new BadRequestException('Invalid verification code');
    }

    if (verificationCode.expiresAt < new Date()) {
      await this.prisma.verificationCode.delete({ where: { userId: user.id } });
      throw new BadRequestException('Verification code has expired');
    }

    await this.prisma.$transaction([
      this.prisma.verificationCode.delete({ where: { userId: user.id } }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      }),
    ]);

    return {
      success: true,
      message: 'Email confirmed successfully.',
    };
  }

  async login(
    dto: AuthDto,
  ): Promise<LoginResponseDto & { refreshToken: string }> {
    const user = await this.validateUser(dto.email);
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const tokens = this.issueTokens(user.id);
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
      success: true,
      message: 'Login successful',
    };
  }

  private issueTokens(userId: string): {
    accessToken: string;
    refreshToken: string;
  } {
    const data = { id: userId };

    const accessToken = this.jwt.sign(data, {
      expiresIn: this.configService.get('EXPIRE_TIME_ACCESS_TOKEN'),
    });

    const refreshToken = this.jwt.sign(data, {
      expiresIn: this.configService.get('EXPIRE_TIME_REFRESH_TOKEN'),
    });

    return { accessToken, refreshToken };
  }

  addRefreshTokenToResponse(res: Response, refreshToken: string): void {
    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN);

    res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      domain: this.configService.get<string>('SERVER_DOMAIN'),
      expires: expiresIn,
      secure: true,
      sameSite: 'none',
    });
  }

  removeRefreshTokenFromResponse(res: Response): void {
    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN);

    res.cookie(this.REFRESH_TOKEN_NAME, '', {
      httpOnly: true,
      domain: this.configService.get('SERVER_DOMAIN'),
      expires: new Date(0),
      secure: true,
      sameSite: 'none',
    });
  }
}
