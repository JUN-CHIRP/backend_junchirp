import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UsePipes,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Auth } from '../auth/decorators/auth.decorator';
import {
  ApiBadRequestResponse,
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
  @ApiUnauthorizedResponse({ description: 'Invalid token: user not found' })
  @Get('current')
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
}
