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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ProjectRoleTypeResponseDto } from './dto/project-role-type.response-dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidationPipe } from '../shared/pipes/validation/validation.pipe';
import { Owner } from '../auth/decorators/owner.decorator';
import { ProjectRoleResponseDto } from './dto/project-role.response-dto';
import { ParseUUIDv4Pipe } from '../shared/pipes/parse-UUIDv4/parse-UUIDv4.pipe';

@Auth()
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
  @ApiConflictResponse({ description: 'Role already exists for this project' })
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
    description: 'Access denied: you are not the project owner',
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
}
