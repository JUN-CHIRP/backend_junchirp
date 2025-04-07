import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSocialDto } from './dto/create-social.dto';
import { UpdateSocialDto } from './dto/update-social.dto';
import { SocialResponseDto } from './dto/social.response-dto';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class SocialsService {
  // public constructor(private prisma: PrismaService) {}
  //
  // public async addSocialNetwork(
  //   userId: string,
  //   createSocialDto: CreateSocialDto,
  // ): Promise<SocialResponseDto> {
  //   const existingNetwork = await this.prisma.social.findUnique({
  //     where: {
  //       userId_network: {
  //         userId,
  //         network: createSocialDto.network.toLowerCase(),
  //       },
  //     },
  //   });
  //
  //   if (existingNetwork) {
  //     throw new ConflictException(
  //       'You have already added a profile in this social network',
  //     );
  //   }
  //
  //   const userProfilesCount = await this.prisma.social.count({
  //     where: { userId },
  //   });
  //
  //   if (userProfilesCount >= 5) {
  //     throw new BadRequestException(
  //       'You can only add up to 5 social networks.',
  //     );
  //   }
  //
  //   return this.prisma.social.create({
  //     data: { ...createSocialDto, userId },
  //   });
  // }
  //
  // public async updateSocialNetwork(
  //   id: string,
  //   userId: string,
  //   updateSocialDto: UpdateSocialDto,
  // ): Promise<SocialResponseDto> {
  //   const existingProfile = await this.prisma.social.findUnique({
  //     where: {
  //       userId_network: {
  //         userId,
  //         network: updateSocialDto.network.toLowerCase(),
  //       },
  //     },
  //   });
  //
  //   if (existingProfile) {
  //     throw new ConflictException('Profile with this network already exists');
  //   }
  //
  //   try {
  //     return this.prisma.social.update({
  //       where: { id },
  //       data: updateSocialDto,
  //     });
  //   } catch (error) {
  //     if (
  //       error instanceof PrismaClientKnownRequestError &&
  //       error.code === 'P2001'
  //     ) {
  //       throw new NotFoundException('Profile not found');
  //     }
  //     throw error;
  //   }
  // }
  //
  // public async deleteSocialNetwork(id: string): Promise<void> {
  //   try {
  //     await this.prisma.social.delete({
  //       where: { id },
  //     });
  //   } catch (error) {
  //     if (
  //       error instanceof PrismaClientKnownRequestError &&
  //       error.code === 'P2025'
  //     ) {
  //       throw new NotFoundException('Profile not found');
  //     }
  //     throw error;
  //   }
  // }
}
