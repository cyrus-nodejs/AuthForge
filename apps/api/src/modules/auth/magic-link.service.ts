import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  import { CryptoService } from '../../security/crypto.service';
  import { ReplayProtectionService } from '../../security/replay-protection.service';
  import { EmailService } from '../email/email.service';
  import {
    MagicLinkChallenge,
    MagicLinkChallengeDocument,
  } from './schemas/magic-link-challenge.schema';
  import { AuthenticationAttemptService } from './authentication-attempt.service';
  import { UserRepository } from '../users/repositories/user.repository';
  
  @Injectable()
  export class MagicLinkService {
    constructor(
      @InjectModel(MagicLinkChallenge.name)
      private readonly model: Model<MagicLinkChallengeDocument>,
      private readonly config: ConfigService,
      private readonly crypto: CryptoService,
      private readonly replay: ReplayProtectionService,
      private readonly email: EmailService,
      private readonly attempts: AuthenticationAttemptService,
      private readonly users: UserRepository,
    ) {}
  
    async issue(input: {
      attemptId: string;
      email: string;
      userId?: string;
      fingerprintHash?: string;
    }) {
      const ttl = this.config.getOrThrow<number>(
        'MAGIC_LINK_TTL_SECONDS',
      );
  
      const token = this.crypto.randomToken(32);
      const challengeId = `chl_${this.crypto.randomToken(18)}`;

      await this.model.updateMany(
  {
    attemptId: input.attemptId,
    purpose: 'login',
    status: 'active',
  },
  {
    $set: {
      status: 'superseded',
    },
  },
).exec()
  
      await this.model.create({
        challengeId,
        attemptId: input.attemptId,
        userId: input.userId,
        tokenHash: this.crypto.hash(token),
        purpose: 'login',
        status: 'active',
        fingerprintHash: input.fingerprintHash,
        expiresAt: new Date(Date.now() + ttl * 1000),
      });
  
      const frontendUrl =
        this.config.get<string>('FRONTEND_URL') ??
        'http://localhost:3001';
  
      const link =
        `${frontendUrl}/auth/magic-link` +
        `?attempt=${encodeURIComponent(input.attemptId)}` +
        `&challenge=${encodeURIComponent(challengeId)}` +
        `&token=${encodeURIComponent(token)}`;
  
      await this.email.sendMagicLink({
        to: input.email,
        link,
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
  attemptId: string;
  challengeId: string;
  token: string;
}) {
  const challenge = await this.model
    .findOne({
      challengeId: input.challengeId,
      attemptId: input.attemptId,
      status: 'active',
      expiresAt: { $gt: new Date() },
    })
    .exec();

  if (!challenge) {
    throw new UnauthorizedException(
      'Authentication failed',
    );
  }

  const valid = this.crypto.hashesMatch(
    input.token,
    challenge.tokenHash,
  );

  if (!valid) {
    throw new UnauthorizedException(
      'Authentication failed',
    );
  }

 
  const consumed = await this.model.findOneAndUpdate(
    {
      _id: challenge._id,
      challengeId: input.challengeId,
      attemptId: input.attemptId,
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
      'Authentication challenge already used',
    );
  }

  const attempt =
    await this.attempts.findByAttemptId(
      input.attemptId,
    );

  if (!attempt.userId) {
    throw new UnauthorizedException(
      'Authentication failed',
    );
  }

  const completion =
    await this.attempts.complete(
      input.attemptId,
      'magic_link',
    );

  if (!completion.complete) {
    throw new UnauthorizedException(
      'Authentication requirements not completed',
    );
  }

  await this.users.markEmailVerified(
    attempt.userId,
  );

  return {
    userId: attempt.userId,
    authenticated: true,
  };
}

  }