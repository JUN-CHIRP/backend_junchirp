import { Body, Controller, HttpCode, HttpStatus, Post, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { MessageResponseDto } from './dto/message.response-dto';
import { ValidationPipe } from '../shared/pipes/validation/validation.pipe';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { EmailDto } from './dto/email.dto';

@ApiTags('Authorization')
@Controller('auth')
export class AuthController {
  public constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Registration' })
  @ApiResponse({ status: HttpStatus.CREATED, type: MessageResponseDto })
  @UsePipes(ValidationPipe)
  @Post('register')
  public async registration(
    @Body() createUserDto: CreateUserDto,
  ): Promise<MessageResponseDto> {
    return this.authService.registration(createUserDto);
  }

  @ApiOperation({ summary: 'Send confirmation email' })
  @ApiResponse({ status: HttpStatus.OK, type: MessageResponseDto })
  @HttpCode(200)
  @Post('send-confirmation-email')
  public async sendConfirmationEmail(
    @Body() body: EmailDto,
  ): Promise<MessageResponseDto> {
    return this.authService.sendVerificationCode(
      body.email,
      'Confirmation email sent. Please check your inbox.',
    );
  }
}
