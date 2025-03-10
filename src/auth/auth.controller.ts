import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UsePipes,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { ValidationPipe } from '../shared/pipes/validation/validation.pipe';
import { CreateUserDto } from '../users/dto/create-user.dto';

import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { EmailDto } from './dto/email.dto';
import { LoginResponseDto } from './dto/login.response-dto';
import { MessageResponseDto } from './dto/message.response-dto';

@ApiTags('Authorization')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Login' })
  @ApiResponse({ status: HttpStatus.OK, type: LoginResponseDto })
  @UsePipes(ValidationPipe)
  @HttpCode(200)
  @Post('login')
  async login(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const { refreshToken, ...response } = await this.authService.login(dto);

    this.authService.addRefreshTokenToResponse(res, refreshToken);

    return response;
  }

  @ApiOperation({ summary: 'Registration' })
  @ApiResponse({ status: HttpStatus.CREATED, type: MessageResponseDto })
  @UsePipes(ValidationPipe)
  @Post('register')
  async registration(
    @Body() createUserDto: CreateUserDto,
  ): Promise<MessageResponseDto> {
    return this.authService.registration(createUserDto);
  }

  @ApiOperation({ summary: 'Send confirmation email' })
  @ApiResponse({ status: HttpStatus.OK, type: MessageResponseDto })
  @HttpCode(200)
  @Post('send-confirmation-email')
  async sendConfirmationEmail(
    @Body() body: EmailDto,
  ): Promise<MessageResponseDto> {
    return this.authService.sendVerificationCode(
      body.email,
      'Confirmation email sent. Please check your inbox.',
    );
  }

  @ApiOperation({ summary: 'Confirm email' })
  @ApiResponse({ status: HttpStatus.OK, type: MessageResponseDto })
  @HttpCode(200)
  @Post('confirm-email')
  async confirmEmail(
    @Body() confirmEmailDto: ConfirmEmailDto,
  ): Promise<MessageResponseDto> {
    return this.authService.confirmEmail(confirmEmailDto);
  }
}
