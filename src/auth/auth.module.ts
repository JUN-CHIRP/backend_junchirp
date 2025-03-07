import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { LogEventsModule } from '../log-events/log-events.module';

@Module({
  imports: [UsersModule, MailModule, LogEventsModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
