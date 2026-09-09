import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

export interface RateLimitResult {
  allowed: boolean;
  count: number;
  retryAfterSeconds: number;
}

@Injectable()
export class RateLimitService {
  constructor(private readonly redis: RedisService) {}

  async consume(
    scope: string,
    identifier: string,
    limit: number,
    windowSeconds: number,
  ): Promise<RateLimitResult> {
    const key = `auth:rate:${scope}:${identifier}`;

    const count = await this.redis.increment(key, windowSeconds);

    const ttl = await this.redis.client.ttl(key);

    return {
      allowed: count <= limit,
      count,
      retryAfterSeconds: Math.max(ttl, 0),
    };
  }
}