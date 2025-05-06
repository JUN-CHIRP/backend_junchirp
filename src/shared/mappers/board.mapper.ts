import {
  Board,
  Education,
  ProjectRoleType,
  Task,
  TaskStatus,
  User,
} from '@prisma/client';
import { BoardResponseDto } from '../../boards/dto/board.response-dto';
import { TaskStatusMapper } from './task-status.mapper';

export class BoardMapper {
  public static toResponse(
    board: Board & {
      columns: (TaskStatus & {
        tasks: (Task & {
          user:
            | (User & {
                educations: (Education & { specialization: ProjectRoleType })[];
              })
            | null;
        })[];
      })[];
    },
  ): BoardResponseDto {
    return {
      id: board.id,
      boardName: board.boardName,
      columns: board.columns.map((column) =>
        TaskStatusMapper.toExpandResponse(column),
      ),
    };
  }
}
