import {
  BadRequestException,
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
import { EventType, VerificationCode } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { LogEventsService } from '../log-events/log-events.service';

@Injectable()
export class AuthService {
  public constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private mailService: MailService,
    private logEventsService: LogEventsService,
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
    const user = await this.usersService.createUser({
      ...createUserDto,
      password: hashPassword,
    });

    this.sendVerificationCode(createUserDto.email, message).catch((err) => {
      console.error('Error sending verification code:', err);
    });

    await this.logEventsService.addLogEvent(
      EventType.REGISTRATION,
      user.id,
      `User registered with email ${user.email}`,
    );

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
    await this.logEventsService.addLogEvent(
      EventType.SEND_CONFIRMATION_EMAIL,
      record.userId,
      `Verification code sent to email ${email}`,
    );

    return {
      success: true,
      message,
    };
  }

  public async confirmEmail(
    confirmEmailDto: ConfirmEmailDto,
  ): Promise<MessageResponseDto> {
    const user = await this.usersService.getUserByEmail(confirmEmailDto.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

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

    await this.logEventsService.addLogEvent(
      EventType.CONFIRM_EMAIL,
      user.id,
      `Email ${user.email} was confirmed`,
    );

    return {
      success: true,
      message: 'Email confirmed successfully.',
    };
  }
}
