import { PickType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskStatusDto extends PickType(CreateTaskDto, [
  'taskStatusId',
]) {}
