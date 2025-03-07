import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { MessageResponseDto } from './dto/message.response-dto';
import { VerificationCode } from '@prisma/client';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  public constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private mailService: MailService,
  ) {}

  public async registration(
    createUserDto: CreateUserDto,
  ): Promise<MessageResponseDto> {
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

    this.sendVerificationCode(createUserDto.email, message).catch((err) => {
      console.error('Error sending verification code:', err);
    });

    return {
      success: true,
      message,
    };
  }

  public async createVerificationCode(
    email: string,
  ): Promise<VerificationCode> {
    const user = await this.usersService.getUserByEmail(email);

    const code = crypto.randomInt(100000, 999999).toString();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.verificationCode.upsert({
      where: { userId: user.id },
      update: { code, expiresAt: new Date(Date.now() + 30 * 60 * 1000) },
      create: {
        userId: user.id,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });
  }

  public async sendVerificationCode(
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
}
