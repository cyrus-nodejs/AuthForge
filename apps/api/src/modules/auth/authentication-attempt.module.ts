import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AuthenticationAttempt,
  AuthenticationAttemptSchema,
} from './schemas/authentication-attempt.schema';
import { AuthenticationAttemptService } from './authentication-attempt.service';
import { SessionModule } from '../session/session.module';
import { TokenModule } from '../token/token.module';
import { UsersModule } from '../users/users.module';
import { FingerprintModule } from '../fingerprint/fingerprint.module';
import { SecurityEventModule } from '../security-events/security-event.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AuthenticationAttempt.name,
        schema: AuthenticationAttemptSchema,
      },
    ]),
    SessionModule,
    TokenModule,
    UsersModule,
    FingerprintModule,
    SecurityEventModule,
  ],
  providers: [
    AuthenticationAttemptService,
  ],
  exports: [
    AuthenticationAttemptService,
  ],
})
export class AuthenticationAttemptModule {}