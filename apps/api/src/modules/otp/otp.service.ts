import {
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  import { CryptoService } from '../../security/crypto.service';
  import { ReplayProtectionService } from '../../security/replay-protection.service';
  import { RateLimitService } from '../../security/rate-limit.service';
  import { EmailService } from '../email/email.service';
  import {
    OtpChallenge,
    OtpChallengeDocument,
  } from './schemas/otp-challenge.schema';
  import { AuthenticationAttemptService } from '../auth/authentication-attempt.service';
  
  @Injectable()
  export class OtpService {
    constructor(
      @InjectModel(OtpChallenge.name)
      private readonly model: Model<OtpChallengeDocument>,
      private readonly config: ConfigService,
      private readonly crypto: CryptoService,
      private readonly replay: ReplayProtectionService,
      private readonly rateLimit: RateLimitService,
      private readonly email: EmailService,
      private readonly attempts: AuthenticationAttemptService,
    ) {}
  
    async issue(input: {
      attemptId: string;
      userId?: string;
      email: string;
      purpose: string;
    }) {
      const rate = await this.rateLimit.consume(
        `otp-send:${input.purpose}`,
        input.email.toLowerCase(),
        5,
        300,
      );
  
      if (!rate.allowed) {
        throw new UnauthorizedException(
          'Too many verification requests',
        );
      }
  
      const ttl = this.config.getOrThrow<number>(
        'OTP_TTL_SECONDS',
      );
  
      const code = this.generateCode();
      const challengeId = `otp_${this.crypto.randomToken(18)}`;
  
      await this.model.create({
        challengeId,
        attemptId: input.attemptId,
        userId: input.userId,
        codeHash: this.crypto.hash(code),
        purpose: input.purpose,
        status: 'active',
        attemptCount: 0,
        maxAttempts: 5,
        expiresAt: new Date(Date.now() + ttl * 1000),
      });
  
      await this.email.sendOtp({
        to: input.email,
        code,
        purpose: input.purpose,
        expiresMinutes: Math.ceil(ttl / 60),
      });
  
      return {
        challengeId,
        expiresAt: new Date(
          Date.now() + ttl * 1000,
        ),
      };
    }
  
    async verify(input: {
  challengeId: string;
  code: string;
}) {
  const challenge = await this.model
    .findOne({
      challengeId: input.challengeId,
      status: 'active',
      expiresAt: { $gt: new Date() },
    })
    .exec();

  if (!challenge) {
    throw new UnauthorizedException(
      'Invalid verification code',
    );
  }

  const valid = this.crypto.hashesMatch(
    input.code,
    challenge.codeHash,
  );

  if (!valid) {
    await this.model.findOneAndUpdate(
      {
        _id: challenge._id,
        status: 'active',
        expiresAt: { $gt: new Date() },
        attemptCount: {
          $lt: challenge.maxAttempts,
        },
      },
      [
        {
          $set: {
            attemptCount: {
              $add: ['$attemptCount', 1],
            },
          },
        },
        {
          $set: {
            status: {
              $cond: [
                {
                  $gte: [
                    '$attemptCount',
                    '$maxAttempts',
                  ],
                },
                'locked',
                'active',
              ],
            },
          },
        },
      ],
    ).exec();

    throw new UnauthorizedException(
      'Invalid verification code',
    );
  }

  /*
   * Atomically consume the challenge.
   *
   * If another request already consumed it, this
   * query returns null.
   */
  const consumed = await this.model.findOneAndUpdate(
    {
      _id: challenge._id,
      status: 'active',
      expiresAt: { $gt: new Date() },
    },
    {
      $set: {
        status: 'consumed',
        consumedAt: new Date(),
      },
    },
    {
      new: true,
    },
  ).exec();

  if (!consumed) {
    throw new UnauthorizedException(
      'Invalid verification code',
    );
  }

  if (consumed.attemptId) {
    await this.attempts.complete(
      consumed.attemptId,
      'otp',
    );
  }

  return {
    authenticated: true,
    userId: consumed.userId,
  };
}

    private generateCode(): string {
      return Math.floor(
        100000 + Math.random() * 900000,
      ).toString();
    }
  }