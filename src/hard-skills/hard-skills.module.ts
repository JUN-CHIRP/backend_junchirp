import { Module } from '@nestjs/common';
import { HardSkillsService } from './hard-skills.service';
import { HardSkillsController } from './hard-skills.controller';

@Module({
  controllers: [HardSkillsController],
  providers: [HardSkillsService],
})
export class HardSkillsModule {}
