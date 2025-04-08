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
import { HardSkillsService } from './hard-skills.service';
import { CreateHardSkillDto } from './dto/create-hard-skill.dto';
import { UpdateHardSkillDto } from './dto/update-hard-skill.dto';
import { Auth } from '../auth/decorators/auth.decorator';
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
import { HardSkillResponseDto } from './dto/hard-skill.response-dto';
import { ParseUUIDv4Pipe } from '../shared/pipes/parse-UUIDv4/parse-UUIDv4.pipe';

@Auth()
@Controller('hard-skills')
export class HardSkillsController {
  public constructor(private hardSkillsService: HardSkillsService) {}

  @ApiOperation({ summary: 'Add hard skill' })
  @ApiCreatedResponse({ type: HardSkillResponseDto })
  @ApiBadRequestResponse({
    description: 'You can only add up to 20 hard skills.',
  })
  @ApiConflictResponse({ description: 'Hard skill is already in list' })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @UsePipes(ValidationPipe)
  @Post('')
  public async addHardSkill(
    @Req() req: Request,
    @Body() createHardSkillDto: CreateHardSkillDto,
  ): Promise<HardSkillResponseDto> {
    const user: UserWithPasswordResponseDto =
      req.user as UserWithPasswordResponseDto;
    return this.hardSkillsService.addHardSkill(user.id, createHardSkillDto);
  }

  @ApiOperation({ summary: 'Update hard skill' })
  @ApiOkResponse({ type: HardSkillResponseDto })
  @ApiNotFoundResponse({ description: 'Hard skill not found' })
  @ApiConflictResponse({ description: 'Hard skill is already in list' })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @Put(':id')
  public async updateHardSkill(
    @Param('id', ParseUUIDv4Pipe) id: string,
    @Body(ValidationPipe) updateHardSkillDto: UpdateHardSkillDto,
  ): Promise<HardSkillResponseDto> {
    return this.hardSkillsService.updateHardSkill(id, updateHardSkillDto);
  }

  @ApiOperation({ summary: 'Delete hard skill' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'Hard skill not found' })
  @ApiHeader({
    name: 'x-csrf-token',
    description: 'CSRF token for the request',
    required: true,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  public async deleteHardSkill(
    @Param('id', ParseUUIDv4Pipe) id: string,
  ): Promise<void> {
    return this.hardSkillsService.deleteHardSkill(id);
  }
}
