import { Module } from '@nestjs/common';
import { SoftSkillsService } from './soft-skills.service';
import { SoftSkillsController } from './soft-skills.controller';

@Module({
  controllers: [SoftSkillsController],
  providers: [SoftSkillsService],
})
export class SoftSkillsModule {}
