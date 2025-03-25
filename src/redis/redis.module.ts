import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule as IoRedisModule } from '@nestjs-modules/ioredis';
import { RedisService } from './redis.service';

@Module({
  imports: [
    IoRedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isRender = configService.get<string>('RENDER_ENV') === 'true';

        return {
          type: 'single',
          url: isRender
            ? `redis://${configService.get<string>('REDIS_HOST')}:${configService.get<string>('REDIS_PORT')}`
            : `rediss://${configService.get<string>('REDIS_HOST')}:${configService.get<string>('REDIS_PORT')}`,
        };
      },
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
