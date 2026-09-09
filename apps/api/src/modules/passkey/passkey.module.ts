import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  PasskeyCredential,
  PasskeyCredentialSchema,
} from './schemas/passkey-credential.schema';

import { PasskeyService } from './passkey.service';
import { PasskeyController } from './passkey.controller';
import {
  PasskeyAuthenticationService,
} from './passkey-authentication.service';

import { UsersModule } from '../users/users.module';
import { SecurityEventModule } from '../security-events/security-event.module';
import { AuthenticationAttemptModule } from '../auth/authentication-attempt.module';
import { AuthenticationOrchestratorModule } from '../auth/authentication-orchestrator.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: PasskeyCredential.name,
        schema: PasskeyCredentialSchema,
      },
    ]),
    UsersModule,
    SecurityEventModule,
    AuthenticationAttemptModule,
    AuthenticationOrchestratorModule,
  ],
  controllers: [
    PasskeyController,
  ],
  providers: [
    PasskeyService,
    PasskeyAuthenticationService,
  ],
  exports: [
    PasskeyService,
    PasskeyAuthenticationService,
  ],
})
export class PasskeyModule {}