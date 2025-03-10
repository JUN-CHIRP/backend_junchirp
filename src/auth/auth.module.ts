import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { getJwtConfig } from 'src/config/jwt.config';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';

import { MailModule } from '../mail/mail.module';
import { UsersModule } from '../users/users.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [
    MailModule,
    UsersModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtConfig,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, UsersService, JwtStrategy],
})
export class AuthModule {}
