import { ApiProperty } from '@nestjs/swagger';
import { TaskStatusResponseDto } from '../../task-statuses/dto/task-status.response-dto';

export class BoardResponseDto {
  @ApiProperty({
    example: 'a4d4eb0c-1a10-455e-b9e9-1af147a77762',
    description: 'Unique identifier',
  })
  public readonly id: string;

  @ApiProperty({
    example: 'Board',
    description: 'Board name',
  })
  public readonly boardName: string;

  @ApiProperty({ type: () => [TaskStatusResponseDto] })
  public readonly columns: TaskStatusResponseDto[];
}
