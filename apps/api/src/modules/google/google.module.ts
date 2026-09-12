import { Module } from '@nestjs/common';

import { GoogleService } from './google.service';
import { GoogleController } from './google.controller';
import {
  GoogleAuthenticationService,
} from './google-authentication.service';

import { UsersModule } from '../users/users.module';
import { SecurityEventModule } from '../security-events/security-event.module';
import { AuthenticationAttemptModule } from '../auth/authentication-attempt.module';
import { AuthenticationOrchestratorModule } from '../auth/authentication-orchestrator.module';

@Module({
  imports: [
    UsersModule,
    SecurityEventModule,
    AuthenticationAttemptModule,
    AuthenticationOrchestratorModule,
  ],
  controllers: [
    GoogleController,
  ],
  providers: [
    GoogleService,
    GoogleAuthenticationService,
  ],
  exports: [
    GoogleService,
    GoogleAuthenticationService,
  ],
})
export class GoogleModule {}