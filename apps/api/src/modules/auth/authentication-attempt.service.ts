import {
    Injectable,
    NotFoundException,
    UnauthorizedException
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { ConfigService } from '@nestjs/config';
  import { Model } from 'mongoose';
  import { CryptoService } from '../../security/crypto.service';
  import {
    AuthenticationAttempt,
    AuthenticationAttemptDocument,
    AuthenticationAttemptStatus,
  } from './schemas/authentication-attempt.schema';
  
  export interface CreateAuthenticationAttemptInput {
    emailNormalized?: string;
    userId?: string;
    purpose: string;
    riskLevel: string;
    requiredMethods: string[];
    fingerprintHash?: string;
    ipHash?: string;
    userAgentHash?: string;
  }
  
  @Injectable()
  export class AuthenticationAttemptService {
    constructor(
      @InjectModel(AuthenticationAttempt.name)
      private readonly model: Model<AuthenticationAttemptDocument>,
      private readonly config: ConfigService,
      private readonly crypto: CryptoService,
    ) {}
  
    async create(input: CreateAuthenticationAttemptInput) {
      const attemptId = `lat_${this.crypto.randomToken(18)}`;
      const ttl = this.config.getOrThrow<number>(
        'AUTH_ATTEMPT_TTL_SECONDS',
      );
  
      const expiresAt = new Date(
        Date.now() + ttl * 1000,
      );
  
      return this.model.create({
        attemptId,
        emailNormalized: input.emailNormalized,
        userId: input.userId,
        purpose: input.purpose,
        riskLevel: input.riskLevel,
        requiredMethods: input.requiredMethods,
        completedMethods: [],
        status: AuthenticationAttemptStatus.PENDING,
        fingerprintHash: input.fingerprintHash,
        ipHash: input.ipHash,
        userAgentHash: input.userAgentHash,
        expiresAt,
      });
    }
  
    async findByAttemptId(attemptId: string) {
      const attempt = await this.model
        .findOne({ attemptId })
        .exec();
  
      if (!attempt) {
        throw new NotFoundException(
          'Authentication attempt not found',
        );
      }
  
      if (
        attempt.expiresAt.getTime() <= Date.now() &&
        attempt.status === AuthenticationAttemptStatus.PENDING
      ) {
        attempt.status = AuthenticationAttemptStatus.EXPIRED;
        await attempt.save();
  
        throw new NotFoundException(
          'Authentication attempt expired',
        );
      }
  
      return attempt;
    }
  
    async complete(
      attemptId: string,
      method: string,
    ) {
      const attempt = await this.model.findOneAndUpdate(
        {
          attemptId,
          status: AuthenticationAttemptStatus.PENDING,
          expiresAt: { $gt: new Date() },
          requiredMethods: method,
        },
        {
          $addToSet: {
            completedMethods: method,
          },
        },
        {
          new: true,
        },
      ).exec();
    
      if (!attempt) {
        throw new NotFoundException(
          'Authentication attempt not found, expired, or method not required',
        );
      }
    
      const complete = attempt.requiredMethods.every(
        (required) =>
          attempt.completedMethods.includes(required),
      );
    
      if (complete) {
        const authenticatedAttempt =
          await this.model.findOneAndUpdate(
            {
              _id: attempt._id,
              status: AuthenticationAttemptStatus.PENDING,
              completedMethods: {
                $all: attempt.requiredMethods,
              },
            },
            {
              $set: {
                status: AuthenticationAttemptStatus.AUTHENTICATED,
                completedAt: new Date(),
              },
            },
            {
              new: true,
            },
          ).exec();
    
        return {
          complete: true,
          attempt: authenticatedAttempt ?? attempt,
        };
      }
    
      return {
        complete: false,
        attempt,
      };
    }
    
    
  }