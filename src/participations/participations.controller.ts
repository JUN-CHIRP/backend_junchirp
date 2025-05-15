import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UsePipes,
  Req,
  Put,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ParticipationsService } from './participations.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { Owner } from '../auth/decorators/owner.decorator';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ValidationPipe } from '../shared/pipes/validation/validation.pipe';
import { UserParticipationResponseDto } from './dto/user-participation.response-dto';
import { ProjectParticipationResponseDto } from './dto/project-participation.response-dto';
import { Request } from 'express';
import { UserWithPasswordResponseDto } from '../users/dto/user-with-password.response-dto';
import { ParseUUIDv4Pipe } from '../shared/pipes/parse-UUIDv4/parse-UUIDv4.pipe';
import { User } from '../auth/decorators/user.decorator';

@User()
@Controller('participations')
export class ParticipationsController {
  public constructor(private participationsService: ParticipationsService) {}

  @Owner('body', 'projectId', 'project')
  @ApiOperation({ summary: 'Create invite (owner)' })
  @ApiCreatedResponse({ type: UserParticipationResponseDto })
  @ApiNotFoundResponse({ description: 'User or project role not found' })
  @ApiConflictResponse({
    description:
      'User is already in the project team / User has already been invited to this project / User has already requested participation in this project',
  })
  @ApiForbiddenResponse({
    description: 'Access denied: you are not the project owner',
  })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @UsePipes(ValidationPipe)
  @Post('invite')
  public async createInvite(
    @Body() createInviteDto: CreateInviteDto,
  ): Promise<UserParticipationResponseDto> {
    return this.participationsService.createInvite(createInviteDto);
  }

  @ApiOperation({ summary: 'Create request (user)' })
  @ApiCreatedResponse({ type: ProjectParticipationResponseDto })
  @ApiNotFoundResponse({ description: 'Role not found' })
  @ApiConflictResponse({
    description:
      'You are already in the project team / You have already been invited to this project / You have already sent a request to this project',
  })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @UsePipes(ValidationPipe)
  @Post('request')
  public async createRequest(
    @Body() createRequestDto: CreateInviteDto,
    @Req() req: Request,
  ): Promise<ProjectParticipationResponseDto> {
    const user: UserWithPasswordResponseDto =
      req.user as UserWithPasswordResponseDto;
    return this.participationsService.createRequest(createRequestDto, user.id);
  }

  @ApiOperation({ summary: 'Accept invite (user)' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Invite not found' })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put('invite/:id/accept')
  public async acceptInvite(
    @Req() req: Request,
    @Param('id', ParseUUIDv4Pipe) id: string,
  ): Promise<void> {
    const user: UserWithPasswordResponseDto =
      req.user as UserWithPasswordResponseDto;
    return this.participationsService.acceptInvite(id, user.id);
  }

  @ApiOperation({ summary: 'Reject invite (user)' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Invite not found' })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('invite/:id/reject')
  public async rejectInvite(
    @Req() req: Request,
    @Param('id', ParseUUIDv4Pipe) id: string,
  ): Promise<void> {
    const user: UserWithPasswordResponseDto =
      req.user as UserWithPasswordResponseDto;
    return this.participationsService.rejectInvite(id, user.id);
  }

  @Owner('params', 'id', 'participationRequest')
  @ApiOperation({ summary: 'Accept request (owner)' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Request not found' })
  @ApiForbiddenResponse({
    description: 'Access denied: you are not the project owner',
  })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put('request/:id/accept')
  public async acceptRequest(
    @Param('id', ParseUUIDv4Pipe) id: string,
  ): Promise<void> {
    return this.participationsService.acceptRequest(id);
  }

  @Owner('params', 'id', 'participationRequest')
  @ApiOperation({ summary: 'Reject request (owner)' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Request not found' })
  @ApiForbiddenResponse({
    description: 'Access denied: you are not the project owner',
  })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('request/:id/reject')
  public async rejectRequest(
    @Param('id', ParseUUIDv4Pipe) id: string,
  ): Promise<void> {
    return this.participationsService.rejectRequest(id);
  }

  @ApiOperation({ summary: 'Cancel request (user)' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Request not found' })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('request/:id/cancel')
  public async cancelRequest(
    @Req() req: Request,
    @Param('id', ParseUUIDv4Pipe) id: string,
  ): Promise<void> {
    const user: UserWithPasswordResponseDto =
      req.user as UserWithPasswordResponseDto;
    return this.participationsService.cancelRequest(id, user.id);
  }

  @Owner('params', 'id', 'participationInvite')
  @ApiOperation({ summary: 'Cancel invite (owner)' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Invite not found' })
  @ApiForbiddenResponse({
    description: 'Access denied: you are not the project owner',
  })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('invite/:id/cancel')
  public async cancelInvite(
    @Param('id', ParseUUIDv4Pipe) id: string,
  ): Promise<void> {
    return this.participationsService.cancelInvite(id);
  }
}
