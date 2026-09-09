import { Global, Module } from '@nestjs/common';
import { RateLimitService } from './rate-limit.service';
import { CryptoService } from './crypto.service';

@Global()
@Module({
  providers: [CryptoService, RateLimitService],
  exports: [CryptoService, RateLimitService],
})
export class SecurityPrimitivesModule {}