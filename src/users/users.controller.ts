import { Body, Controller, HttpCode, Post, UsePipes } from '@nestjs/common';
import { UsersService } from './users.service';
import { Auth } from '../auth/decorators/auth.decorator';
import {
  ApiBadRequestResponse,
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

@Controller('users')
export class UsersController {
  public constructor(private usersService: UsersService) {}

  @Auth()
  @ApiOperation({ summary: 'Send confirmation email' })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiTooManyRequestsResponse({
    description:
      'You have used up all your attempts. The next available attempt will be at HH:MM',
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
  @HttpCode(200)
  @UsePipes(ValidationPipe)
  @Post('confirm-email')
  public async confirmEmail(
    @Body() confirmEmailDto: ConfirmEmailDto,
  ): Promise<UserResponseDto> {
    return this.usersService.confirmEmail(confirmEmailDto);
  }
}
