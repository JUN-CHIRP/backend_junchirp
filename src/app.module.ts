import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { LogEventsModule } from './log-events/log-events.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    MailModule,
    LogEventsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
