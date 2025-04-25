import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UsePipes,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Auth } from '../auth/decorators/auth.decorator';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { MessageResponseDto } from './dto/message.response-dto';
import { EmailDto } from './dto/email.dto';
import { UserResponseDto } from './dto/user.response-dto';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { ValidationPipe } from '../shared/pipes/validation/validation.pipe';
import { Request } from 'express';
import { UserWithPasswordResponseDto } from './dto/user-with-password.response-dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ProjectsListResponseDto } from '../projects/dto/projects-list.response-dto';
import { UserProjectsFilterDto } from './dto/user-projects-filter.dto';
import { ParseUUIDv4Pipe } from '../shared/pipes/parse-UUIDv4/parse-UUIDv4.pipe';
import { UsersListResponseDto } from './dto/users-list.response-dto';
import { UsersFilterDto } from './dto/users-filter.dto';

@Controller('users')
export class UsersController {
  public constructor(private usersService: UsersService) {}

  @Auth()
  @ApiOperation({ summary: 'Send confirmation email' })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiTooManyRequestsResponse({
    description: 'You have used up all your attempts. Please try again later.',
  })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @HttpCode(200)
  @UsePipes(ValidationPipe)
  @Post('send-confirmation-email')
  public async sendConfirmationEmail(
    @Body() body: EmailDto,
  ): Promise<MessageResponseDto> {
    return this.usersService.sendVerificationUrl(body.email);
  }

  @Auth()
  @ApiOperation({ summary: 'Confirm email' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'User with this email not found' })
  @ApiBadRequestResponse({
    description: 'Invalid or expired verification token',
  })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @HttpCode(200)
  @UsePipes(ValidationPipe)
  @Post('confirm')
  public async confirmEmail(
    @Body() confirmEmailDto: ConfirmEmailDto,
  ): Promise<UserResponseDto> {
    return this.usersService.confirmEmail(confirmEmailDto);
  }

  @Auth()
  @ApiOperation({ summary: 'Get current user' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Get('me')
  public async getCurrentUser(@Req() req: Request): Promise<UserResponseDto> {
    const user: UserWithPasswordResponseDto =
      req.user as UserWithPasswordResponseDto;
    return this.usersService.getUserById(user.id);
  }

  @ApiOperation({ summary: 'Send email to reset your password' })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiTooManyRequestsResponse({
    description: 'You have used up all your attempts. Please try again later.',
  })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @HttpCode(200)
  @UsePipes(ValidationPipe)
  @Post('request-password-reset')
  public async sendPasswordResetUrl(
    @Body() body: EmailDto,
  ): Promise<MessageResponseDto> {
    return this.usersService.sendPasswordResetUrl(body.email);
  }

  @ApiOperation({ summary: 'Reset password' })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid or expired token',
  })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @HttpCode(200)
  @UsePipes(ValidationPipe)
  @Post('reset-password')
  public async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<MessageResponseDto> {
    return this.usersService.resetPassword(resetPasswordDto);
  }

  @Auth()
  @ApiOperation({
    summary: 'Update current user (first name, last name, email)',
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiConflictResponse({ description: 'Email is already in use' })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @UsePipes(ValidationPipe)
  @Patch('me')
  public async updateUser(
    @Req() req: Request,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user: UserWithPasswordResponseDto =
      req.user as UserWithPasswordResponseDto;
    return this.usersService.updateUser(user.id, updateUserDto);
  }

  @Auth()
  @ApiOperation({
    summary: 'Get projects of current user',
  })
  @ApiOkResponse({ type: ProjectsListResponseDto })
  @UsePipes(ValidationPipe)
  @Get('me/projects')
  public async getMyProjects(
    @Req() req: Request,
    @Query() query: UserProjectsFilterDto,
  ): Promise<ProjectsListResponseDto> {
    const user: UserWithPasswordResponseDto =
      req.user as UserWithPasswordResponseDto;
    return this.usersService.getUserProjects(
      user.id,
      query.page,
      query.limit,
      query.status,
    );
  }

  @Auth()
  @ApiOperation({
    summary: 'Get user projects',
  })
  @ApiOkResponse({ type: ProjectsListResponseDto })
  @Get(':id/projects')
  public async getUserProjects(
    @Param('id', ParseUUIDv4Pipe) id: string,
    @Query(ValidationPipe) query: UserProjectsFilterDto,
  ): Promise<ProjectsListResponseDto> {
    return this.usersService.getUserProjects(id, query.page, query.limit);
  }

  @Auth()
  @ApiOperation({ summary: 'Get user by id' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Get(':id')
  public async getUserById(
    @Param('id', ParseUUIDv4Pipe) id: string,
  ): Promise<UserResponseDto> {
    return this.usersService.getUserById(id);
  }

  @Auth()
  @ApiOperation({
    summary: 'Get list of users with filters and pagination',
  })
  @ApiOkResponse({ type: UsersListResponseDto })
  @UsePipes(ValidationPipe)
  @Get('')
  public async getUsers(
    @Query() query: UsersFilterDto,
  ): Promise<UsersListResponseDto> {
    return this.usersService.getUsers(query);
  }
}
