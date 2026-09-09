import { Module } from '@nestjs/common';
import { AuthenticationOrchestratorService } from './authentication-orchestrator.service';
import { AuthenticationAttemptModule } from './authentication-attempt.module';
import { SessionModule } from '../session/session.module';
import { TokenModule } from '../token/token.module';
import { UsersModule } from '../users/users.module';
import { FingerprintModule } from '../fingerprint/fingerprint.module';
import { SecurityEventModule } from '../security-events/security-event.module';

@Module({
  imports: [
    AuthenticationAttemptModule,
    SessionModule,
    TokenModule,
    UsersModule,
    FingerprintModule,
    SecurityEventModule,
  ],
  providers: [
    AuthenticationOrchestratorService,
  ],
  exports: [
    AuthenticationOrchestratorService,
  ],
})
export class AuthenticationOrchestratorModule {}