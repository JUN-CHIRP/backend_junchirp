import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ValidationPipe } from '../shared/pipes/validation/validation.pipe';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth.response-dto';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { TokenResponseDto } from './dto/token.response-dto';
import { Auth } from './decorators/auth.decorator';
import { MessageResponseDto } from '../users/dto/message.response-dto';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';

@ApiTags('Authorization')
@Controller('auth')
export class AuthController {
  public constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Login' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Email or password is incorrect' })
  @ApiTooManyRequestsResponse({
    description: 'Too many failed attempts. Please try again later',
  })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @ApiBody({ type: LoginDto })
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  public async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    return this.authService.login(req, res);
  }

  @ApiOperation({ summary: 'Registration' })
  @ApiCreatedResponse({ type: AuthResponseDto })
  @ApiConflictResponse({ description: 'User with this email already exists' })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @UsePipes(ValidationPipe)
  @Post('register')
  public async registration(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    return this.authService.registration(createUserDto, res);
  }

  @ApiOperation({ summary: 'Refresh token' })
  @ApiOkResponse({ type: TokenResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @Post('refresh-token')
  public async refreshToken(
    @Req() req: Request,
  ): Promise<{ accessToken: string }> {
    return this.authService.regenerateAccessToken(req);
  }

  @Auth()
  @ApiOperation({ summary: 'Logout' })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token is invalid' })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  public async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<MessageResponseDto> {
    return this.authService.logout(req, res);
  }

  @ApiOperation({ summary: 'Initiate Google OAuth2 login' })
  @ApiResponse({ status: HttpStatus.FOUND })
  @HttpCode(HttpStatus.FOUND)
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  // eslint-disable-next-line
  public async googleAuth(): Promise<void> {}

  @ApiOperation({ summary: 'Initiate Google OAuth2 login' })
  @ApiOkResponse({ type: AuthResponseDto })
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Callback endpoint for Google authentication' })
  public async googleRedirect(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    return this.authService.googleLogin(req, res);
  }
}
