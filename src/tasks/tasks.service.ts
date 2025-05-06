import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from '../prisma/prisma.service';
import { TaskMapper } from '../shared/mappers/task.mapper';
import { TaskWithStatusResponseDto } from './dto/task-with-status.response-dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';

@Injectable()
export class TasksService {
  public constructor(private prisma: PrismaService) {}

  public async createTask(
    createTaskDto: CreateTaskDto,
  ): Promise<TaskWithStatusResponseDto> {
    try {
      const task = await this.prisma.task.create({
        data: createTaskDto,
        include: {
          taskStatus: true,
          user: {
            include: {
              educations: {
                include: {
                  specialization: true,
                },
              },
            },
          },
        },
      });

      return TaskMapper.toExpandResponse(task);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2003':
            throw new NotFoundException('Task status not found');
          case 'P2025':
            throw new NotFoundException('Task not found');
          default:
            throw new InternalServerErrorException(
              `Database error: ${error.code} - ${error.message}`,
            );
        }
      } else {
        throw error;
      }
    }
  }

  public async getTaskById(id: string): Promise<TaskWithStatusResponseDto> {
    try {
      const task = await this.prisma.task.findUniqueOrThrow({
        where: { id },
        include: {
          taskStatus: true,
          user: {
            include: {
              educations: {
                include: {
                  specialization: true,
                },
              },
            },
          },
        },
      });

      return TaskMapper.toExpandResponse(task);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Task not found');
      }
      throw error;
    }
  }

  public async updateTask(
    id: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<TaskWithStatusResponseDto> {
    try {
      const task = await this.prisma.task.update({
        where: { id },
        data: updateTaskDto,
        include: {
          taskStatus: true,
          user: {
            include: {
              educations: {
                include: {
                  specialization: true,
                },
              },
            },
          },
        },
      });

      return TaskMapper.toExpandResponse(task);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Task not found');
      }
      throw error;
    }
  }

  public async deleteTask(id: string): Promise<void> {
    try {
      await this.prisma.task.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Task not found');
      }
      throw error;
    }
  }

  public async updateTaskStatus(
    id: string,
    updateTaskStatusDto: UpdateTaskStatusDto,
  ): Promise<TaskWithStatusResponseDto> {
    try {
      await this.prisma.taskStatus.findUniqueOrThrow({
        where: { id: updateTaskStatusDto.taskStatusId },
      });

      const task = await this.prisma.task.update({
        where: { id },
        data: updateTaskStatusDto,
        include: {
          taskStatus: true,
          user: {
            include: {
              educations: {
                include: {
                  specialization: true,
                },
              },
            },
          },
        },
      });

      return TaskMapper.toExpandResponse(task);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Task or status not found');
      }
      throw error;
    }
  }
}
