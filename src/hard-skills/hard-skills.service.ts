import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateHardSkillDto } from './dto/create-hard-skill.dto';
import { UpdateHardSkillDto } from './dto/update-hard-skill.dto';
import { HardSkillResponseDto } from './dto/hard-skill.response-dto';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class HardSkillsService {
  // public constructor(private prisma: PrismaService) {}
  //
  // public async addHardSkill(
  //   userId: string,
  //   createHardSkillDto: CreateHardSkillDto,
  // ): Promise<HardSkillResponseDto> {
  //   try {
  //     return this.prisma.userHardSkill.create({
  //       data: {
  //         ...createHardSkillDto,
  //         userId,
  //       },
  //     });
  //   } catch (error) {
  //     if (
  //       error instanceof PrismaClientKnownRequestError &&
  //       error.code === 'P2002'
  //     ) {
  //       throw new ConflictException('Hard skill is already in use');
  //     }
  //     throw error;
  //   }
  // }
  //
  // update(id: number, updateHardSkillDto: UpdateHardSkillDto) {
  //   return `This action updates a #${id} hardSkill`;
  // }
  //
  // remove(id: number) {
  //   return `This action removes a #${id} hardSkill`;
  // }
}
