import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventType } from '@prisma/client';

@Injectable()
export class LogEventsService {
  public constructor(private prisma: PrismaService) {}

  public async addLogEvent(
    eventType: EventType,
    userId: string,
    details: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.prisma.logEvent.create({
      data: {
        eventType,
        details,
        userId,
        ipAddress,
      },
    });
  }
}
