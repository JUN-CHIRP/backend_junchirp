import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ResetPasswordToken, VerificationToken } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserWithPasswordResponseDto } from './dto/user-with-password.response-dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MessageResponseDto } from './dto/message.response-dto';
import { MailService } from '../mail/mail.service';
import { UserResponseDto } from './dto/user.response-dto';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { TooManyRequestsException } from '../shared/exceptions/too-many-requests.exception';
import { RolesService } from '../roles/roles.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import { CreateGoogleUserDto } from './dto/create-google-user.dto';

@Injectable()
export class UsersService {
  public constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
    private rolesService: RolesService,
  ) {}

  public async createUser(createUserDto: CreateUserDto): Promise<void> {
    const role = await this.rolesService.findOrCreateRole('user');

    await this.prisma.user.create({
      data: {
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
        password: createUserDto.password,
        role: {
          connect: { id: role.id },
        },
      },
    });
  }

  public async getUserByEmail(
    email: string,
  ): Promise<UserWithPasswordResponseDto | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true, educations: true, socials: true },
    });
  }

  public async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true, educations: true, socials: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid token: user not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  public async createVerificationUrl(
    email: string,
  ): Promise<VerificationToken> {
    const user = await this.getUserByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const count = await this.prisma.verificationAttempt.count({
      where: { userId: user.id },
    });

    if (count >= 5) {
      throw new TooManyRequestsException(
        'You have used up all your attempts. Please try again later.',
      );
    }

    const data = { id: user.id };
    const createdAt = new Date();
    const token = this.jwtService.sign(data, {
      expiresIn: this.configService.get('EXPIRE_TIME_VERIFY_EMAIL_TOKEN'),
    });

    return this.prisma.$transaction(async (prisma) => {
      const verificationToken = await prisma.verificationToken.upsert({
        where: { userId: user.id },
        update: {
          token,
          createdAt,
        },
        create: {
          userId: user.id,
          token,
          createdAt,
        },
      });

      await prisma.verificationAttempt.create({
        data: {
          userId: user.id,
          createdAt,
        },
      });

      return verificationToken;
    });
  }

  public async sendVerificationUrl(email: string): Promise<MessageResponseDto> {
    const record = await this.createVerificationUrl(email);
    const url = `${this.configService.get('BASE_FRONTEND_URL')}/verify-email?token=${record.token}`;

    this.mailService.sendVerificationMail(email, url).catch((err) => {
      console.error('Error sending verification url:', err);
    });

    return { message: 'Confirmation email sent. Please check your inbox.' };
  }

  public async confirmEmail(
    confirmEmailDto: ConfirmEmailDto,
  ): Promise<UserResponseDto> {
    const user = await this.getUserByEmail(confirmEmailDto.email);

    if (!user) {
      throw new NotFoundException('User with this email not found');
    }

    const verificationToken = await this.prisma.verificationToken.findUnique({
      where: { userId: user.id, token: confirmEmailDto.token },
    });

    if (
      !verificationToken ||
      verificationToken.token !== confirmEmailDto.token
    ) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.$transaction(async (prisma) => {
      try {
        const payload = this.jwtService.verify(verificationToken.token);
        const userId = payload.id;

        await prisma.verificationToken.delete({ where: { userId } });
        await prisma.user.update({
          where: { id: userId },
          data: { isVerified: true },
        });
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          throw new BadRequestException(
            'Invalid or expired verification token',
          );
        }
      }
    });

    const updatedUser = await this.getUserByEmail(confirmEmailDto.email);

    if (!updatedUser) {
      throw new NotFoundException('User with this email not found');
    }

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  public async sendPasswordResetUrl(
    email: string,
  ): Promise<MessageResponseDto> {
    const record = await this.createPasswordResetUrl(email);
    const url = `${this.configService.get('BASE_FRONTEND_URL')}/reset-password?token=${record.token}`;

    this.mailService.sendResetPasswordMail(email, url).catch((err) => {
      console.error('Error sending verification url:', err);
    });

    return { message: 'Password reset link has been sent to your email.' };
  }

  public async createPasswordResetUrl(
    email: string,
  ): Promise<ResetPasswordToken> {
    const user = await this.getUserByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const count = await this.prisma.resetPasswordAttempt.count({
      where: { userId: user.id },
    });

    if (count >= 5) {
      throw new TooManyRequestsException(
        'You have used up all your attempts. Please try again later.',
      );
    }

    const data = { id: user.id };
    const createdAt = new Date();
    const token = this.jwtService.sign(data, {
      expiresIn: this.configService.get('EXPIRE_TIME_REFRESH_PASSWORD_TOKEN'),
    });

    return this.prisma.$transaction(async (prisma) => {
      const resetPasswordToken = await prisma.resetPasswordToken.upsert({
        where: { userId: user.id },
        update: {
          token,
          createdAt,
        },
        create: {
          userId: user.id,
          token,
          createdAt,
        },
      });

      await prisma.resetPasswordAttempt.create({
        data: {
          userId: user.id,
          createdAt,
        },
      });

      return resetPasswordToken;
    });
  }

  public async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<MessageResponseDto> {
    const resetPasswordToken = await this.prisma.resetPasswordToken.findUnique({
      where: { token: resetPasswordDto.token },
    });

    if (
      !resetPasswordToken ||
      resetPasswordToken.token !== resetPasswordToken.token
    ) {
      throw new BadRequestException('Invalid or expired token');
    }

    await this.prisma.$transaction(async (prisma) => {
      try {
        const payload = this.jwtService.verify(resetPasswordToken.token);
        const userId = payload.id;
        const hashPassword = await bcrypt.hash(resetPasswordDto.password, 10);

        await prisma.resetPasswordToken.delete({ where: { userId } });
        await prisma.user.update({
          where: { id: resetPasswordToken.userId },
          data: { password: hashPassword },
        });
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          throw new BadRequestException('Invalid or expired token');
        }
      }
    });

    return { message: 'Password has been reset successfully.' };
  }

  public async createOrUpdateGoogleUser(
    createGoogleUserDto: CreateGoogleUserDto,
  ): Promise<UserResponseDto> {
    const role = await this.rolesService.findOrCreateRole('user');

    const user = await this.prisma.user.upsert({
      where: { email: createGoogleUserDto.email },
      update: {
        googleId: createGoogleUserDto.googleId,
      },
      create: {
        firstName: createGoogleUserDto.firstName,
        lastName: createGoogleUserDto.lastName,
        email: createGoogleUserDto.email,
        googleId: createGoogleUserDto.googleId,
        role: {
          connect: { id: role.id },
        },
      },
      include: { role: true, educations: true, socials: true },
    });

    if (!user.isVerified) {
      const record = await this.createVerificationUrl(user.email);
      const url = `${this.configService.get('BASE_FRONTEND_URL')}/verify-email?token=${record.token}`;
      this.mailService.sendVerificationMail(user.email, url).catch((err) => {
        console.error('Error sending verification url:', err);
      });
    }

    return user;
  }
}
