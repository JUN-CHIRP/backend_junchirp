import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SoftSkillsService } from './soft-skills.service';
import { CreateSoftSkillDto } from './dto/create-soft-skill.dto';
import { UpdateSoftSkillDto } from './dto/update-soft-skill.dto';

@Controller('soft-skills')
export class SoftSkillsController {
  // constructor(private readonly softSkillsService: SoftSkillsService) {}
  //
  // @Post()
  // create(@Body() createSoftSkillDto: CreateSoftSkillDto) {
  //   return this.softSkillsService.create(createSoftSkillDto);
  // }
  //
  // @Get()
  // findAll() {
  //   return this.softSkillsService.findAll();
  // }
  //
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.softSkillsService.findOne(+id);
  // }
  //
  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateSoftSkillDto: UpdateSoftSkillDto,
  // ) {
  //   return this.softSkillsService.update(+id, updateSoftSkillDto);
  // }
  //
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.softSkillsService.remove(+id);
  // }
}
