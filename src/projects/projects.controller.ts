import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  Req,
  UploadedFile,
  UseInterceptors,
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
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ProjectRoleTypeResponseDto } from './dto/project-role-type.response-dto';
import { ProjectsListResponseDto } from './dto/projects-list.response-dto';
import { ValidationPipe } from '../shared/pipes/validation/validation.pipe';
import { ProjectsFilterDto } from './dto/projects-filter.dto';
import { ProjectResponseDto } from './dto/project.response-dto';
import { Request } from 'express';
import { UserWithPasswordResponseDto } from '../users/dto/user-with-password.response-dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParseImageFilePipe } from '../shared/pipes/parse-image-file/parse-image-file.pipe';

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
    summary: 'Get array of all project roles available on the platform',
  })
  @ApiOkResponse({ type: [ProjectRoleTypeResponseDto] })
  @Get('roles')
  public async getProjectRoleTypes(): Promise<ProjectRoleTypeResponseDto[]> {
    return this.projectsService.getProjectRoleTypes();
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
    description: 'Create a new project with a logo file',
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
        roles: {
          type: 'string',
          example: JSON.stringify([
            {
              roleTypeId: 'e960a0fb-891a-4f02-9f39-39ac3bb08621',
              slots: 3,
            },
          ]),
        },
      },
    },
  })
  @Post('')
  public async createProject(
    @Req() req: Request,
    @Body(new ValidationPipe()) createProjectDto: CreateProjectDto,
    @UploadedFile(ParseImageFilePipe) file: Express.Multer.File,
  ): Promise<ProjectResponseDto> {
    console.log(createProjectDto);
    const user: UserWithPasswordResponseDto =
      req.user as UserWithPasswordResponseDto;
    return this.projectsService.createProject(user.id, createProjectDto, file);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.projectsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
  //   return this.projectsService.update(+id, updateProjectDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.projectsService.remove(+id);
  // }
}
