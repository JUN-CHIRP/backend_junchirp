import { TaskResponseDto } from './task.response-dto';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatusResponseDto } from '../../task-statuses/dto/task-status.response-dto';

export class TaskWithStatusResponseDto extends TaskResponseDto {
  @ApiProperty({
    type: () => TaskStatusResponseDto,
  })
  public readonly taskStatus: TaskStatusResponseDto;
}
