import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProjectRolesService } from './project-roles.service';
import { CreateProjectRoleDto } from './dto/create-project-role.dto';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ProjectRoleTypeResponseDto } from './dto/project-role-type.response-dto';
import { ValidationPipe } from '../shared/pipes/validation/validation.pipe';
import { Owner } from '../auth/decorators/owner.decorator';
import { ProjectRoleResponseDto } from './dto/project-role.response-dto';
import { ParseUUIDv4Pipe } from '../shared/pipes/parse-UUIDv4/parse-UUIDv4.pipe';
import { User } from '../auth/decorators/user.decorator';
import { ProjectRoleWithUserResponseDto } from './dto/project-role-with-user.response-dto';

@User()
@Controller('project-roles')
export class ProjectRolesController {
  public constructor(private projectRolesService: ProjectRolesService) {}

  @ApiOperation({
    summary: 'Get array of all project roles available on the platform',
  })
  @ApiOkResponse({ type: [ProjectRoleTypeResponseDto] })
  @Get('list')
  public async getProjectRoleTypes(): Promise<ProjectRoleTypeResponseDto[]> {
    return this.projectRolesService.getProjectRoleTypes();
  }

  @Owner('body', 'projectId', 'project')
  @ApiOperation({ summary: 'Create project role' })
  @ApiCreatedResponse({ type: ProjectRoleResponseDto })
  @ApiNotFoundResponse({
    description: 'Project or role type not found',
  })
  @ApiForbiddenResponse({
    description: 'Access denied: you are not the project owner',
  })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @Post('')
  public async createProjectRole(
    @Body(ValidationPipe) createProjectRoleDto: CreateProjectRoleDto,
  ): Promise<ProjectRoleResponseDto> {
    return this.projectRolesService.createProjectRole(createProjectRoleDto);
  }

  @Owner('params', 'id', 'projectRole')
  @ApiOperation({ summary: 'Delete project role' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Project role not found' })
  @ApiForbiddenResponse({
    description:
      'Access denied: you are not the project owner / You cannot delete the project owner role',
  })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  public async deleteProjectRole(
    @Param('id', ParseUUIDv4Pipe) id: string,
  ): Promise<void> {
    return this.projectRolesService.deleteProjectRole(id);
  }

  @Owner('params', 'roleId', 'projectRole')
  @ApiOperation({ summary: 'Remove user from project team' })
  @ApiOkResponse({ type: ProjectRoleWithUserResponseDto })
  @ApiNotFoundResponse({
    description: 'User is not assigned to this role / Role not found',
  })
  @ApiForbiddenResponse({
    description:
      'Access denied: you are not the project owner / You cannot delete the project owner',
  })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @Delete(':roleId/users/:userId')
  public async removeUserFromProject(
    @Param('roleId', ParseUUIDv4Pipe) projectId: string,
    @Param('userId', ParseUUIDv4Pipe) userId: string,
  ): Promise<ProjectRoleWithUserResponseDto> {
    return this.projectRolesService.removeUserFromProject(projectId, userId);
  }
}
