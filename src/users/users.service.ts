import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException, UnauthorizedException,
} from '@nestjs/common';
import { User, VerificationToken } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserWithPasswordResponseDto } from './dto/user-with-password.response-dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MessageResponseDto } from './dto/message.response-dto';
import { MailService } from '../mail/mail.service';
import { UserResponseDto } from './dto/user.response-dto';
import { ConfirmEmailDto } from './dto/confirm-email.dto';

@Injectable()
export class UsersService {
  public constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  public async createUser(createUserDto: CreateUserDto): Promise<void> {
    await this.prisma.user.create({
      data: {
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
        password: createUserDto.password,
        role: {
          connect: { roleName: 'user' },
        },
      },
    });
  }

  public async getUserByEmail(
    email: string,
  ): Promise<UserWithPasswordResponseDto | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }

  public async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
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
      const oldestToken = await this.prisma.verificationAttempt.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      });
      const newAvailableTime = oldestToken
        ? new Date(oldestToken.createdAt)
        : new Date();
      newAvailableTime.setHours(newAvailableTime.getHours() + 1);

      throw new ForbiddenException(
        `You have used up all your attempts. The next available attempt will be at ${newAvailableTime}`,
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
    const url = `${this.configService.get('BASE_FRONTEND_URL')}?token=${record.token}`;

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
      where: { userId: user.id },
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
}
