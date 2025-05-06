import {
  Education,
  ProjectRoleType,
  Task,
  TaskStatus,
  User,
} from '@prisma/client';
import { TaskResponseDto } from '../../tasks/dto/task.response-dto';
import { UserMapper } from './user.mapper';
import { UserCardResponseDto } from '../../users/dto/user-card.response-dto';
import { TaskWithStatusResponseDto } from '../../tasks/dto/task-with-status.response-dto';
import { TaskStatusMapper } from './task-status.mapper';

export class TaskMapper {
  public static toBaseResponse(
    task: Task & {
      user:
        | (User & {
            educations: (Education & { specialization: ProjectRoleType })[];
          })
        | null;
    },
  ): TaskResponseDto {
    let user: UserCardResponseDto | null = null;
    if (task.user) {
      user = UserMapper.toCardResponse(task.user);
    }
    return {
      id: task.id,
      taskName: task.taskName,
      description: task.description,
      deadline: task.deadline,
      priority: task.priority,
      user,
    };
  }

  public static toExpandResponse(
    task: Task & {
      user:
        | (User & {
            educations: (Education & { specialization: ProjectRoleType })[];
          })
        | null;
      taskStatus: TaskStatus;
    },
  ): TaskWithStatusResponseDto {
    let user: UserCardResponseDto | null = null;
    if (task.user) {
      user = UserMapper.toCardResponse(task.user);
    }
    return {
      id: task.id,
      taskName: task.taskName,
      description: task.description,
      deadline: task.deadline,
      priority: task.priority,
      user,
      taskStatus: TaskStatusMapper.toBaseResponse(task.taskStatus),
    };
  }
}
