import { PartialType } from '@nestjs/swagger';
import { CreateSoftSkillDto } from './create-soft-skill.dto';

export class UpdateSoftSkillDto extends PartialType(CreateSoftSkillDto) {}
