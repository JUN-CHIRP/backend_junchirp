import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CronTasksService {
  public constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  public async deleteEveryMinute(): Promise<void> {
    await this.deleteUnverifiedUsers();
    await this.deleteEntryAttempts();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  public async deleteUnusedCodes(): Promise<void> {
    const thresholdDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

    await this.prisma.verificationToken.deleteMany({
      where: {
        createdAt: { lte: thresholdDate },
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
    const thresholdDate = new Date(Date.now() - 60 * 60 * 1000);

    await this.prisma.verificationAttempt.deleteMany({
      where: {
        createdAt: { lt: thresholdDate },
      },
    });
  }
}
