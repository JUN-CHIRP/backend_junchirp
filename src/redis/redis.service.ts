import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  public constructor(@InjectRedis() private readonly redis: Redis) {}

  public async addToBlacklist(token: string, ttl: number): Promise<void> {
    await this.redis.set(token, 'blacklisted', 'EX', ttl);
  }

  public async isBlacklisted(token: string): Promise<boolean> {
    return (await this.redis.get(token)) !== null;
  }
}
