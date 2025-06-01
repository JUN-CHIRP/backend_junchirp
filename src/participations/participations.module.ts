import { Module } from '@nestjs/common';
import { ParticipationsService } from './participations.service';
import { ParticipationsController } from './participations.controller';
import { MailModule } from '../mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { DiscordModule } from '../discord/discord.module';

@Module({
  imports: [MailModule, ConfigModule, DiscordModule],
  controllers: [ParticipationsController],
  providers: [ParticipationsService],
  exports: [ParticipationsService],
})
export class ParticipationsModule {}
