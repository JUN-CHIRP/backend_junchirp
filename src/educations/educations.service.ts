import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { PrismaService } from '../prisma/prisma.service';
import { EducationResponseDto } from './dto/education.response-dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { EducationMapper } from '../shared/mappers/education.mapper';

@Injectable()
export class EducationsService {
  public constructor(private prisma: PrismaService) {}

  public async getInstitutionsAutocomplete(query: string): Promise<string[]> {
    const results = await this.prisma.institution.findMany({
      where: {
        institutionName: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: {
        institutionName: true,
      },
      take: 10,
    });

    return results.map((institution) => institution.institutionName);
  }

  public async addEducation(
    userId: string,
    createEducationDto: CreateEducationDto,
  ): Promise<EducationResponseDto> {
    const userEducationsCount = await this.prisma.education.count({
      where: { userId },
    });

    if (userEducationsCount >= 5) {
      throw new BadRequestException('You can only add up to 5 educations.');
    }

    try {
      return this.prisma.$transaction(async (prisma) => {
        const education = await prisma.education.create({
          data: {
            ...createEducationDto,
            userId,
          },
        });

        const record = await prisma.institution.findFirst({
          where: {
            institutionName: createEducationDto.institution,
          },
        });

        if (!record) {
          await prisma.institution.create({
            data: {
              institutionName: createEducationDto.institution,
            },
          });
        }

        return EducationMapper.toResponse(education);
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Education is already in list');
      }
      throw error;
    }
  }

  public async updateEducation(
    id: string,
    updateEducationDto: UpdateEducationDto,
  ): Promise<EducationResponseDto> {
    try {
      return this.prisma.$transaction(async (prisma) => {
        const record = await prisma.institution.findFirst({
          where: {
            institutionName: updateEducationDto.institution,
          },
        });

        if (!record) {
          await prisma.institution.create({
            data: {
              institutionName: updateEducationDto.institution,
            },
          });
        }

        const education = await prisma.education.update({
          where: { id },
          data: {
            ...updateEducationDto,
          },
        });

        return EducationMapper.toResponse(education);
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2001':
            throw new NotFoundException('Education not found');
          case 'P2002':
            throw new ConflictException('Education is already in list');
          default:
            throw new InternalServerErrorException('Database error');
        }
      } else {
        throw error;
      }
    }
  }

  public async deleteEducation(id: string): Promise<void> {
    try {
      await this.prisma.education.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Education not found');
      }
      throw error;
    }
  }
}
