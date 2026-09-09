import {
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { Types } from 'mongoose';
  import { AuthenticationAttemptService } from './authentication-attempt.service';
  import { SessionService } from '../session/session.service';
  import { TokenService } from '../token/token.service';
  import { AccessTokenService } from '../token/access-token.service';
  import { UserRepository } from '../users/repositories/user.repository';
  import { SecurityEventService } from '../security-events/security-event.service';
  import { SecurityEventType } from '../security-events/schemas/security-event.schema';
  import { FingerprintService } from '../fingerprint/fingerprint.service';
  
  @Injectable()
  export class AuthenticationOrchestratorService {
    constructor(
      private readonly attempts: AuthenticationAttemptService,
      private readonly sessions: SessionService,
      private readonly tokens: TokenService,
      private readonly accessTokens: AccessTokenService,
      private readonly users: UserRepository,
      private readonly fingerprints: FingerprintService,
      private readonly events: SecurityEventService,
    ) {}
  
    async finalize(
        attemptId: string,
        authenticationLevel: string,
      ) {
        const attempt =
          await this.attempts.findByAttemptId(attemptId);
      
        if (!attempt.userId) {
          throw new UnauthorizedException(
            'Authentication failed',
          );
        }
      
        if (attempt.status !== 'authenticated') {
          throw new UnauthorizedException(
            'Additional authentication required',
          );
        }
      
        const user =
          await this.users.findById(attempt.userId);
      
        if (!user) {
          throw new UnauthorizedException(
            'Authentication failed',
          );
        }
      
        const session =
          await this.sessions.create({
            userId: user._id.toString(),
            riskLevel: attempt.riskLevel,
            authenticationLevel,
            fingerprintHash:
              attempt.fingerprintHash,
            userAgentHash:
              attempt.userAgentHash,
            ipHash: attempt.ipHash,
          });
      
        const refresh =
          await this.tokens.issueRefreshToken({
            userId: user._id.toString(),
            sessionId: session.sessionId,
            tokenFamilyId: session.tokenFamilyId,
          });
      
        const accessToken =
          this.accessTokens.issue({
            userId: user._id.toString(),
            sessionId: session.sessionId,
            securityVersion: user.securityVersion,
            authenticationLevel,
          });
      
        await this.events.record({
          userId: user._id,
          sessionId: session.sessionId,
          attemptId: attempt.attemptId,
          eventType:
            SecurityEventType.SESSION_CREATED,
          riskLevel: attempt.riskLevel,
        });
      
        await this.users.markLogin(user._id);
      
        return {
          accessToken,
          refreshToken: refresh.token,
          expiresAt: refresh.expiresAt,
          sessionId: session.sessionId,
          user: {
            id: user._id.toString(),
            email: user.email,
            displayName: user.displayName,
          },
          passkeyPrompt: {
            shouldPrompt: true,
            reason: 'post_authentication',
          },
        };
      }
  }