import { Module } from '@nestjs/common';
import { LogEventsService } from './log-events.service';

@Module({
  providers: [LogEventsService],
  exports: [LogEventsService],
})
export class LogEventsModule {}
