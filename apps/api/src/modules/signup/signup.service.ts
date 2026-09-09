import {
    Injectable,
    BadRequestException,
  } from '@nestjs/common';
  import { UserRepository } from '../users/repositories/user.repository';
  import { AuthenticationAttemptService } from '../auth/authentication-attempt.service';
  import { MagicLinkService } from '../auth/magic-link.service';
  import { RateLimitService } from '../../security/rate-limit.service';
  import { SecurityEventService } from '../security-events/security-event.service';
  import { SecurityEventType } from '../security-events/schemas/security-event.schema';
  
  @Injectable()
  export class SignupService {
    constructor(
      private readonly users: UserRepository,
      private readonly attempts: AuthenticationAttemptService,
      private readonly magicLinks: MagicLinkService,
      private readonly rateLimit: RateLimitService,
      private readonly events: SecurityEventService,
    ) {}
  
    async start(input: {
      email: string;
      displayName?: string;
    }) {
      const emailNormalized =
        input.email.trim().toLowerCase();
  
      const rate = await this.rateLimit.consume(
        'signup',
        emailNormalized,
        5,
        900,
      );
  
      if (!rate.allowed) {
        throw new BadRequestException(
          'Too many signup attempts',
        );
      }
  
      let user =
        await this.users.findByEmail(emailNormalized);
  
      if (!user) {
        user = await this.users.create({
          email: input.email.trim(),
          emailNormalized,
          displayName: input.displayName,
        });
      }
  
      const attempt =
        await this.attempts.create({
          emailNormalized,
          userId: user._id.toString(),
          purpose: 'signup',
          riskLevel: 'low',
          requiredMethods: ['magic_link'],
        });
  
      await this.magicLinks.issue({
        attemptId: attempt.attemptId,
        email: user.email,
        userId: user._id.toString(),
      });
  
      await this.events.record({
        userId: user._id,
        attemptId: attempt.attemptId,
        eventType: SecurityEventType.SIGNUP_STARTED,
      });
  
      return {
        challengeId: attempt.attemptId,
        method: 'magic_link',
        expiresAt: attempt.expiresAt,
      };
    }
  }