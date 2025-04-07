import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  Req,
} from '@nestjs/common';
import { HardSkillsService } from './hard-skills.service';
import { CreateHardSkillDto } from './dto/create-hard-skill.dto';
import { UpdateHardSkillDto } from './dto/update-hard-skill.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiHeader,
  ApiOperation,
} from '@nestjs/swagger';
import { EducationResponseDto } from '../educations/dto/education.response-dto';
import { ValidationPipe } from '../shared/pipes/validation/validation.pipe';
import { Request } from 'express';
import { CreateEducationDto } from '../educations/dto/create-education.dto';
import { UserWithPasswordResponseDto } from '../users/dto/user-with-password.response-dto';
import { HardSkillResponseDto } from './dto/hard-skill.response-dto';

@Auth()
@Controller('hard-skills')
export class HardSkillsController {
  // public constructor(private hardSkillsService: HardSkillsService) {}

  // @ApiOperation({ summary: 'Add hard skill' })
  // @ApiCreatedResponse({ type: HardSkillResponseDto })
  // @ApiBadRequestResponse({
  //   description: 'You can only add up to 5 educations',
  // })
  // @ApiHeader({
  //   name: 'x-csrf-token',
  //   description: 'CSRF token for the request',
  //   required: true,
  // })
  // @UsePipes(ValidationPipe)
  // @Post('')
  // public async addSocialNetwork(
  //   @Req() req: Request,
  //   @Body() createEducationDto: CreateEducationDto,
  // ): Promise<EducationResponseDto> {
  //   const user: UserWithPasswordResponseDto =
  //     req.user as UserWithPasswordResponseDto;
  //   return this.educationsService.addEducation(user.id, createEducationDto);
  // }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateHardSkillDto: UpdateHardSkillDto,
  // ) {
  //   return this.hardSkillsService.update(+id, updateHardSkillDto);
  // }
  //
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.hardSkillsService.remove(+id);
  // }
}
