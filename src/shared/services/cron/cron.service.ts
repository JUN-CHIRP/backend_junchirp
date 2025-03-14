import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CronService {
  public constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  public async deleteEveryMinute(): Promise<void> {
    await this.deleteUnverifiedUsers();
    await this.deleteEntryAttempts();
    await this.deleteBlockedEmails();
    await this.deleteUsersAfterVerificationError();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  public async deleteUnusedCodes(): Promise<void> {
    await this.prisma.verificationCode.deleteMany({
      where: {
        expiresAt: { lte: new Date() },
      },
    });
  }

  private async deleteUnverifiedUsers(): Promise<void> {
    const thresholdDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

    await this.prisma.user.deleteMany({
      where: {
        isVerified: false,
        createdAt: { lt: thresholdDate },
      },
    });
  }

  private async deleteEntryAttempts(): Promise<void> {
    const thresholdDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

    await this.prisma.codeEntryAttempt.deleteMany({
      where: {
        updatedAt: { lt: thresholdDate },
      },
    });
  }

  private async deleteBlockedEmails(): Promise<void> {
    const thresholdDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

    await this.prisma.blockedEmail.deleteMany({
      where: {
        createdAt: { lt: thresholdDate },
      },
    });
  }

  public async deleteUsersAfterVerificationError(): Promise<void> {
    const usersToDelete = await this.prisma.user.findMany({
      where: {
        VerificationCode: {
          expiresAt: { lt: new Date() },
        },
        CodeEntryAttempt: {
          some: {
            attemptsNumber: 5,
          },
        },
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (usersToDelete.length) {
      await this.prisma.$transaction([
        this.prisma.blockedEmail.createMany({
          data: usersToDelete.map((user) => ({ email: user.email })),
          skipDuplicates: true,
        }),
        this.prisma.user.deleteMany({
          where: { id: { in: usersToDelete.map((user) => user.id) } },
        }),
      ]);
    }
  }
}
