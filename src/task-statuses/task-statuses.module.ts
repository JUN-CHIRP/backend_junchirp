import { Module } from '@nestjs/common';
import { TaskStatusesService } from './task-statuses.service';
import { TaskStatusesController } from './task-statuses.controller';

@Module({
  controllers: [TaskStatusesController],
  providers: [TaskStatusesService],
})
export class TaskStatusesModule {}
