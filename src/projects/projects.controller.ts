import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UsePipes,
  Req,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { ProjectCategoryResponseDto } from './dto/project-category.response-dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ProjectsListResponseDto } from './dto/projects-list.response-dto';
import { ValidationPipe } from '../shared/pipes/validation/validation.pipe';
import { ProjectsFilterDto } from './dto/projects-filter.dto';
import { ProjectResponseDto } from './dto/project.response-dto';
import { Request } from 'express';
import { UserWithPasswordResponseDto } from '../users/dto/user-with-password.response-dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParseImageFilePipe } from '../shared/pipes/parse-image-file/parse-image-file.pipe';
import { Owner } from '../auth/decorators/owner.decorator';
import { ParseUUIDv4Pipe } from '../shared/pipes/parse-UUIDv4/parse-UUIDv4.pipe';
import { Member } from '../auth/decorators/member.decorator';
import { UserCardResponseDto } from '../users/dto/user-card.response-dto';
import { UserParticipationResponseDto } from '../participations/dto/user-participation.response-dto';

@Auth()
@Controller('projects')
export class ProjectsController {
  public constructor(private projectsService: ProjectsService) {}

  @ApiOperation({ summary: 'Get array of project categories' })
  @ApiOkResponse({ type: [ProjectCategoryResponseDto] })
  @Get('categories')
  public async getCategories(): Promise<ProjectCategoryResponseDto[]> {
    return this.projectsService.getCategories();
  }

  @ApiOperation({
    summary: 'Get list of projects with filters and pagination',
  })
  @ApiOkResponse({ type: ProjectsListResponseDto })
  @UsePipes(ValidationPipe)
  @Get('')
  public async getProjects(
    @Query() query: ProjectsFilterDto,
  ): Promise<ProjectsListResponseDto> {
    return this.projectsService.getProjects(query);
  }

  @ApiOperation({ summary: 'Create project' })
  @ApiCreatedResponse({ type: ProjectResponseDto })
  @ApiBadRequestResponse({
    description: 'You have reached the limit of active projects',
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        projectName: {
          type: 'string',
          description: 'Project name',
          example: 'Project name',
        },
        description: {
          type: 'string',
          description: 'Project description',
          example: 'Project description',
        },
        categoryId: {
          type: 'string',
          description: 'Category ID',
          example: 'e960a0fb-891a-4f02-9f39-39ac3bb08621',
        },
      },
    },
  })
  @Post('')
  public async createProject(
    @Req() req: Request,
    @Body(ValidationPipe) createProjectDto: CreateProjectDto,
    @UploadedFile(ParseImageFilePipe) file: Express.Multer.File,
  ): Promise<ProjectResponseDto> {
    const user: UserWithPasswordResponseDto =
      req.user as UserWithPasswordResponseDto;
    return this.projectsService.createProject(user.id, createProjectDto, file);
  }

  @Owner()
  @ApiOperation({ summary: 'Update project' })
  @ApiCreatedResponse({ type: ProjectResponseDto })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiForbiddenResponse({
    description: 'Access denied: you are not the project owner',
  })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @Put(':id')
  public async updateProject(
    @Param('id', ParseUUIDv4Pipe) id: string,
    @Body(ValidationPipe) updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.updateProject(id, updateProjectDto);
  }

  @Member()
  @ApiOperation({ summary: 'Get project by id' })
  @ApiOkResponse({ type: ProjectResponseDto })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiForbiddenResponse({
    description: 'Access denied: you are not a participant of this project',
  })
  @Get(':id')
  public async getProjectById(
    @Param('id', ParseUUIDv4Pipe) id: string,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.getProjectById(id);
  }

  @Owner()
  @ApiOperation({ summary: 'Delete project' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiForbiddenResponse({
    description: 'Access denied: you are not the project owner',
  })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  public async deleteProject(
    @Param('id', ParseUUIDv4Pipe) id: string,
  ): Promise<void> {
    return this.projectsService.deleteProject(id);
  }

  @Owner()
  @ApiOperation({ summary: 'Update project logo' })
  @ApiCreatedResponse({ type: ProjectResponseDto })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiForbiddenResponse({
    description: 'Access denied: you are not the project owner',
  })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Put(':id/logo')
  public async updateProjectLogo(
    @Param('id', ParseUUIDv4Pipe) id: string,
    @UploadedFile(ParseImageFilePipe) file: Express.Multer.File,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.updateProjectLogo(id, file);
  }

  @Member()
  @ApiOperation({
    summary: 'Get project team',
  })
  @ApiOkResponse({ type: [UserCardResponseDto] })
  @ApiForbiddenResponse({
    description: 'Access denied: you are not a participant of this project',
  })
  @UsePipes(ValidationPipe)
  @Get(':id/users')
  public async getProjectUsers(
    @Param('id', ParseUUIDv4Pipe) id: string,
  ): Promise<UserCardResponseDto[]> {
    return this.projectsService.getProjectUsers(id);
  }

  @Owner('params', 'projectId')
  @ApiOperation({ summary: 'Remove user from project team' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'User not found in project team' })
  @ApiForbiddenResponse({
    description: 'Access denied: you are not the project owner',
  })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':projectId/users/:userId')
  public async removeUserFromProject(
    @Param('projectId', ParseUUIDv4Pipe) projectId: string,
    @Param('userId', ParseUUIDv4Pipe) userId: string,
  ): Promise<void> {
    return this.projectsService.removeUserFromProject(projectId, userId);
  }

  @Member()
  @ApiOperation({
    summary: 'Get current project invites',
  })
  @ApiOkResponse({ type: [UserParticipationResponseDto] })
  @ApiForbiddenResponse({
    description: 'Access denied: you are not a participant of this project',
  })
  @Get(':id/invites')
  public async getInvites(
    @Param('id', ParseUUIDv4Pipe) id: string,
  ): Promise<UserParticipationResponseDto[]> {
    return this.projectsService.getInvites(id);
  }

  @Member()
  @ApiOperation({
    summary: 'Get current project requests',
  })
  @ApiOkResponse({ type: [UserParticipationResponseDto] })
  @ApiForbiddenResponse({
    description: 'Access denied: you are not a participant of this project',
  })
  @Get(':id/requests')
  public async getRequests(
    @Param('id', ParseUUIDv4Pipe) id: string,
  ): Promise<UserParticipationResponseDto[]> {
    return this.projectsService.getRequests(id);
  }
}
