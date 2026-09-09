import {
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  
  import { GoogleService } from './google.service';
  import { AuthenticationAttemptService } from '../auth/authentication-attempt.service';
  import {
    AuthenticationOrchestratorService,
  } from '../auth/authentication-orchestrator.service';
  
  @Injectable()
  export class GoogleAuthenticationService {
    constructor(
      private readonly google:
        GoogleService,
      private readonly attempts:
        AuthenticationAttemptService,
      private readonly orchestrator:
        AuthenticationOrchestratorService,
    ) {}
  
    async authenticate(
      code: string,
      state: string,
    ) {
      const user =
        await this.google.authenticate(
          code,
          state,
        );
  
      const attempt =
        await this.attempts.create({
          userId: user._id.toString(),
          emailNormalized:
            user.emailNormalized,
          purpose: 'login',
          riskLevel: 'low',
          requiredMethods: ['google'],
        });
  
      await this.attempts.complete(
        attempt.attemptId,
        'google-login'
      );
  
      return this.orchestrator.finalize(
        attempt.attemptId,
        'google',
      );
    }
  }