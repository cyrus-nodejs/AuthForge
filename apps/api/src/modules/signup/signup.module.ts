import { Module } from '@nestjs/common';
import { SignupController } from './signup.controller';
import { SignupService } from './signup.service';
import { UsersModule } from '../users/users.module';
import { AuthenticationAttemptModule } from '../auth/authentication-attempt.module';
import { MagicLinkModule } from '../auth/magic-link.module';
import { SecurityEventModule } from '../security-events/security-event.module';
import { SecurityPrimitivesModule } from '../../security/security-primitives.module';

@Module({
  imports: [
    UsersModule,
    AuthenticationAttemptModule,
    MagicLinkModule,
    SecurityEventModule,
    SecurityPrimitivesModule,
  ],
  controllers: [SignupController],
  providers: [SignupService],
})
export class SignupModule {}