import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { LoggerService } from 'src/shared/services/logger';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async sendVerificationCode(email: string) {
    const code = crypto.randomInt(100000, 999999).toString();

    await this.prisma.verificationCode.upsert({
      where: { email },
      update: { code, expiresAt: new Date(Date.now() + 30 * 60 * 1000) },
      create: { email, code, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
    });

    this.logger.debug(`Verification code for ${email}: ${code}`);

    return { message: 'Verification code sent' };
  }

  async verifyCode(email: string, code: string) {
    const record = await this.prisma.verificationCode.findUnique({
      where: { email },
    });

    if (!record || record.code !== code || record.expiresAt < new Date()) {
      throw new Error('Invalid or expired code');
    }

    await this.prisma.verificationCode.delete({ where: { email } });

    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: { email, isVerified: true },
      });
    }


    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || '',
      {
        expiresIn: '7d',
      },
    );

    return { token, user };
  }
}
