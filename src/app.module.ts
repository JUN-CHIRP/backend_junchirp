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
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CsrfModule } from './csrf/csrf.module';
import { SocialsModule } from './socials/socials.module';
import { EducationsModule } from './educations/educations.module';
import { SoftSkillsModule } from './soft-skills/soft-skills.module';
import { HardSkillsModule } from './hard-skills/hard-skills.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}.local`,
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 100,
        },
      ],
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    MailModule,
    ScheduleModule.forRoot(),
    RolesModule,
    RedisModule,
    CsrfModule,
    SocialsModule,
    EducationsModule,
    SoftSkillsModule,
    HardSkillsModule,
    CloudinaryModule,
  ],
  providers: [
    CronTasksService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
