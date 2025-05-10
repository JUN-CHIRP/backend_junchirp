import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';

@Injectable()
export class LoggerService {
  public constructor(private prisma: PrismaService) {}

  public async log(
    ip: string,
    email: string,
    eventType: string,
    message: string,
    prisma: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    > = this.prisma,
  ): Promise<void> {
    await prisma.logEvent.create({
      data: { ip, email, eventType, message },
    });
  }
}
