import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  UsePipes,
  Req,
  Put,
  HttpStatus,
} from '@nestjs/common';
import { SocialsService } from './socials.service';
import { CreateSocialDto } from './dto/create-social.dto';
import { UpdateSocialDto } from './dto/update-social.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { SocialResponseDto } from './dto/social.response-dto';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ValidationPipe } from '../shared/pipes/validation/validation.pipe';
import { Request } from 'express';
import { UserWithPasswordResponseDto } from '../users/dto/user-with-password.response-dto';
import { ParseUUIDv4Pipe } from '../shared/pipes/parse-UUIDv4/parse-UUIDv4.pipe';

@Auth()
@Controller('socials')
export class SocialsController {
  public constructor(private socialsService: SocialsService) {}

  @ApiOperation({ summary: 'Add social network profile' })
  @ApiCreatedResponse({ type: SocialResponseDto })
  @ApiBadRequestResponse({
    description: 'You can only add up to 5 social networks',
  })
  @ApiConflictResponse({
    description: 'You have already added a profile in this social network',
  })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @UsePipes(ValidationPipe)
  @Post('')
  public async addSocialNetwork(
    @Req() req: Request,
    @Body() createSocialDto: CreateSocialDto,
  ): Promise<SocialResponseDto> {
    const user: UserWithPasswordResponseDto =
      req.user as UserWithPasswordResponseDto;
    return this.socialsService.addSocialNetwork(user.id, createSocialDto);
  }

  @ApiOperation({ summary: 'Update social network profile' })
  @ApiOkResponse({ type: SocialResponseDto })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  @ApiConflictResponse({
    description: 'Profile with this network already exists',
  })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @Put(':id')
  public async updateSocialNetwork(
    @Param('id', ParseUUIDv4Pipe) id: string,
    @Body(ValidationPipe) updateSocialDto: UpdateSocialDto,
  ): Promise<SocialResponseDto> {
    return this.socialsService.updateSocialNetwork(id, updateSocialDto);
  }

  @ApiOperation({ summary: 'Delete social network profile' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Profile not found' })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  public async deleteSocialNetwork(
    @Param('id', ParseUUIDv4Pipe) id: string,
  ): Promise<void> {
    return this.socialsService.deleteSocialNetwork(id);
  }
}
