import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UsePipes,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EducationsService } from './educations.service';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import {
  ApiBadRequestResponse,
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
import { EducationResponseDto } from './dto/education.response-dto';
import { ParseUUIDv4Pipe } from '../shared/pipes/parse-UUIDv4/parse-UUIDv4.pipe';

@Auth()
@Controller('educations')
export class EducationsController {
  // public constructor(private educationsService: EducationsService) {}
  //
  // @ApiOperation({ summary: 'Get list of institution names' })
  // @ApiOkResponse({ type: [String] })
  // @Get('autocomplete')
  // public async getInstitutionsAutocomplete(
  //   @Query('institution') query: string,
  // ): Promise<string[]> {
  //   return this.educationsService.getInstitutionsAutocomplete(query);
  // }
  //
  // @ApiOperation({ summary: 'Add education' })
  // @ApiCreatedResponse({ type: EducationResponseDto })
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
  //
  // @ApiOperation({ summary: 'Update education' })
  // @ApiOkResponse({ type: EducationResponseDto })
  // @ApiNotFoundResponse({ description: 'Education not found' })
  // @ApiHeader({
  //   name: 'x-csrf-token',
  //   description: 'CSRF token for the request',
  //   required: true,
  // })
  // @Put(':id')
  // public async updateEducation(
  //   @Param('id', ParseUUIDv4Pipe) id: string,
  //   @Req() req: Request,
  //   @Body(ValidationPipe) updateEducationDto: UpdateEducationDto,
  // ): Promise<EducationResponseDto> {
  //   const user: UserWithPasswordResponseDto =
  //     req.user as UserWithPasswordResponseDto;
  //   return this.educationsService.updateEducation(
  //     id,
  //     user.id,
  //     updateEducationDto,
  //   );
  // }
  //
  // @ApiOperation({ summary: 'Delete education' })
  // @ApiNoContentResponse()
  // @ApiNotFoundResponse({ description: 'Education not found' })
  // @ApiHeader({
  //   name: 'x-csrf-token',
  //   description: 'CSRF token for the request',
  //   required: true,
  // })
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @Delete(':id')
  // public async deleteEducation(
  //   @Param('id', ParseUUIDv4Pipe) id: string,
  // ): Promise<void> {
  //   return this.educationsService.deleteEducation(id);
  // }
}
