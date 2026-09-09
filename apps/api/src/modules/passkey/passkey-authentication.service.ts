import {
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  
  import { PasskeyService } from './passkey.service';
  import { AuthenticationAttemptService } from '../auth/authentication-attempt.service';
  import {
    AuthenticationOrchestratorService,
  } from '../auth/authentication-orchestrator.service';
  import {
    AuthenticationResponseJSON
  } from '@simplewebauthn/server';
  
  @Injectable()
  export class PasskeyAuthenticationService {
    constructor(
      private readonly passkeys:
        PasskeyService,
      private readonly attempts:
        AuthenticationAttemptService,
      private readonly orchestrator:
        AuthenticationOrchestratorService,
    ) {}
  
    async authenticate(
      challengeId: string,
      credential:  
      AuthenticationResponseJSON,
    ) {
      const result =
        await this.passkeys.verifyAuthentication(
          challengeId,
          credential,
        );
  
      if (
        !result.authenticated ||
        !result.userId
      ) {
        throw new UnauthorizedException(
          'Passkey authentication failed',
        );
      }
  
      const attempt =
        await this.attempts.create({
          userId: result.userId,
          purpose: 'login',
          riskLevel: 'low',
          requiredMethods: ['passkey'],
        });
  
      await this.attempts.complete(
        attempt.attemptId,
        "Passkey"
      );
  
      return this.orchestrator.finalize(
        attempt.attemptId,
        'passkey',
      );
    }
  }