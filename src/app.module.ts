import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronTasksService } from './shared/services/cron-tasks/cron-tasks.service';
import { RolesModule } from './roles/roles.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}.local`,
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    MailModule,
    ScheduleModule.forRoot(),
    RolesModule,
    RedisModule,
  ],
  providers: [CronTasksService],
})
export class AppModule {}
