import {
    Inject,
    Injectable,
    OnModuleDestroy,
    OnModuleInit,
  } from '@nestjs/common';
  import type { Redis } from 'ioredis';
  import { REDIS_CLIENT } from './redis.constants';
  
  @Injectable()
  export class RedisService implements OnModuleInit, OnModuleDestroy {
    constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}
  
    async onModuleInit() {
      if (this.redis.status !== 'ready') {
        await this.redis.connect();
      }
    }
  
    async onModuleDestroy() {
      await this.redis.quit();
    }
  
    get client(): Redis {
      return this.redis;
    }
  
    async get(key: string): Promise<string | null> {
      return this.redis.get(key);
    }
  
    async set(
      key: string,
      value: string,
      ttlSeconds?: number,
    ): Promise<'OK' | null> {
      if (ttlSeconds) {
        return this.redis.set(key, value, 'EX', ttlSeconds);
      }
  
      return this.redis.set(key, value);
    }
  
    async delete(key: string): Promise<number> {
      return this.redis.del(key);
    }
  
    async exists(key: string): Promise<boolean> {
      return (await this.redis.exists(key)) === 1;
    }
  
    async increment(key: string, ttlSeconds?: number): Promise<number> {
      const value = await this.redis.incr(key);
  
      if (value === 1 && ttlSeconds) {
        await this.redis.expire(key, ttlSeconds);
      }
  
      return value;
    }
  
    async setIfAbsent(
      key: string,
      value: string,
      ttlSeconds: number,
    ): Promise<boolean> {
      const result = await this.redis.set(
        key,
        value,
        'EX',
        ttlSeconds,
        'NX',
      );
  
      return result === 'OK';
    }
  }