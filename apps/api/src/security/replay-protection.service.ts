import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class ReplayProtectionService {
  constructor(private readonly redis: RedisService) {}

  async consume(
    namespace: string,
    identifier: string,
    ttlSeconds: number,
  ): Promise<boolean> {
    return this.redis.setIfAbsent(
      `auth:replay:${namespace}:${identifier}`,
      '1',
      ttlSeconds,
    );
  }
}