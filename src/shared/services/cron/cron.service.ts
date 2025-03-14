import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CronService {
  public constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  public async deleteEveryMinute(): Promise<void> {
    this.deleteUnverifiedUsers()
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

  @Cron(CronExpression.EVERY_MINUTE)
  public async deleteEntryAttempts(): Promise<void> {
    const thresholdDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

    await this.prisma.codeEntryAttempt.deleteMany({
      where: {
        updatedAt: { lt: thresholdDate },
      },
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  public async deleteUnusedCodes(): Promise<void> {
    await this.prisma.verificationCode.deleteMany({
      where: {
        expiresAt: { lte: new Date() },
      },
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  public async deleteBlockedEmails(): Promise<void> {
    const thresholdDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

    await this.prisma.blockedEmail.deleteMany({
      where: {
        createdAt: { lt: thresholdDate },
      },
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
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
