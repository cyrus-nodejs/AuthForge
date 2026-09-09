import {
    ConflictException,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  
  import {
    ClientSession,
    Connection,
    Model,
  } from 'mongoose';
  
  import { InjectConnection, InjectModel } from '@nestjs/mongoose';
  
  import {
    createHash,
    randomBytes,
  } from 'node:crypto';
  
  import {
    RefreshToken,
    RefreshTokenDocument,
  } from './schemas/refresh-token.schema';
  
  import { RedisService } from '../../redis/redis.service';
  import { SessionService } from '../session/session.service';
  import { SecurityEventService } from '../security-events/security-event.service';
  import { SecurityEventType } from '../security-events/schemas/security-event.schema';
  import { ConfigService } from '@nestjs/config';
  
  @Injectable()
  export class TokenService {
    constructor(
      @InjectConnection()
      private readonly connection:
        Connection,
  
      @InjectModel(RefreshToken.name)
      private readonly model:
        Model<RefreshTokenDocument>,
  
      private readonly redis:
        RedisService,
  
      private readonly sessions:
        SessionService,
  
      private readonly events:
        SecurityEventService,
  
      private readonly config:
        ConfigService,
    ) {}
  
    async issueRefreshToken(input: {
      userId: string;
      sessionId: string;
      tokenFamilyId: string;
      parentTokenId?: string;
    }) {
      const token =
        randomBytes(48).toString(
          'base64url',
        );
    
      const tokenId =
        `rt_${randomBytes(18).toString(
          'base64url',
        )}`;
    
      const ttl =
        this.config.getOrThrow<number>(
          'REFRESH_TOKEN_TTL_SECONDS',
        );
    
      const tokenHash =
        this.hash(token);
    
      const expiresAt =
        new Date(
          Date.now() + ttl * 1000,
        );
    
      await this.model.create({
        tokenId,
        userId: input.userId,
        sessionId: input.sessionId,
        tokenFamilyId:
          input.tokenFamilyId,
        parentTokenId:
          input.parentTokenId,
        tokenHash,
        status: 'active',
        expiresAt,
      });
    
      return {
        token,
        tokenId,
        expiresAt:
          expiresAt.getTime(),
      };
    }
    
  
    async rotateRefreshToken(
      rawToken: string,
    ) {
      const tokenHash =
        this.hash(rawToken);
  
      const existing =
        await this.model.findOne({
          tokenHash,
        });
  
      if (!existing) {
        throw new UnauthorizedException(
          'Invalid refresh token',
        );
      }
  
      const familyKey =
        `auth:refresh:family:${existing.tokenFamilyId}`;
  
      const lockKey =
        `auth:refresh:rotate:${tokenHash}`;
  
      const lock = await this.redis.setIfAbsent(
        lockKey,
        '1',
        10,
      );
  
      if (!lock) {
        throw new ConflictException(
          'Refresh token rotation already in progress',
        );
      }
  
      try {
        const result =
          await this.connection.transaction(
            async (
              session: ClientSession,
            ) => {
              const tokenDoc =
                await this.model.findOne({
                  _id: existing._id,
                }).session(session);
  
              if (!tokenDoc) {
                throw new UnauthorizedException(
                  'Invalid refresh token',
                );
              }
  
              if (
                tokenDoc.status !==
                'active'
              ) {
                await this.handleReuse(
                  tokenDoc,
                  familyKey,
                  session,
                );
                
  
                throw new UnauthorizedException(
                  'Refresh token reuse detected',
                );
              }
  
              if (
                tokenDoc.expiresAt <=
                new Date()
              ) {
                tokenDoc.status =
                  'expired';
  
                await tokenDoc.save({
                  session,
                });
  
                throw new UnauthorizedException(
                  'Refresh token expired',
                );
              }
  
              tokenDoc.status =
                'rotated';
  
              tokenDoc.rotatedAt =
                new Date();
  
              await tokenDoc.save({
                session,
              });
  
              const next =
                await this.createRotatedToken(
                  tokenDoc,
                  session,
                );
  
              return {
                tokenDoc,
                next,
              };
            },
          );
  
        await this.redis.set(
          `${familyKey}:version`,
          String(Date.now()),
          86400,
        );
  
        await this.events.record({
          userId:
            result.tokenDoc.userId,
          sessionId:
            result.tokenDoc.sessionId,
          eventType:
            SecurityEventType.SESSION_CREATED,
          metadata: {
            operation:
              'refresh_rotation',
            tokenFamilyId:
              result.tokenDoc.tokenFamilyId,
          },
        });
  
        return result.next;
      } finally {
        await this.redis.delete(
          lockKey,
        );
      }
    }
  
    private async createRotatedToken(
      parent: RefreshTokenDocument,
      session: ClientSession,
    ) {
      const token =
        randomBytes(48).toString(
          'base64url',
        );
    
      const tokenId =
        `rt_${randomBytes(18).toString(
          'base64url',
        )}`;
    
      const ttl =
        this.config.getOrThrow<number>(
          'REFRESH_TOKEN_TTL_SECONDS',
        );
    
      const expiresAt =
        new Date(
          Date.now() + ttl * 1000,
        );
    
      const tokenHash =
        this.hash(token);
    
      await this.model.create(
        [
          {
            tokenId,
            userId: parent.userId,
            sessionId: parent.sessionId,
            tokenFamilyId:
              parent.tokenFamilyId,
            parentTokenId:
              parent._id,
            tokenHash,
            status: 'active',
            expiresAt,
          },
        ],
        { session },
      );
    
      return {
        token,
        tokenId,
        userId:
          parent.userId.toString(),
        sessionId:
          parent.sessionId,
        expiresAt:
          expiresAt.getTime(),
      };
    }
    
    private async handleReuse(
      token: RefreshTokenDocument,
      familyKey: string,
      session: ClientSession,
    ) {
      await this.model.updateMany(
        {
          tokenFamilyId:
            token.tokenFamilyId,
          status: 'active',
        },
        {
          $set: {
            status: 'revoked',
            revokedAt: new Date(),
            revokedReason:
              'refresh_token_reuse',
          },
        },
        { session },
      );
    
      await this.sessions.revoke(
        token.sessionId,
        'refresh_token_reuse',
        session,

      );
    
      await this.redis.set(
        `${familyKey}:revoked`,
        '1',
        86400,
      );
    
      await this.events.record({
        userId: token.userId,
        sessionId:
          token.sessionId,
        eventType:
          SecurityEventType.REFRESH_REUSE_DETECTED,
        metadata: {
          tokenFamilyId:
            token.tokenFamilyId,
        },
      });
    }
    
    private hash(value: string) {
      return createHash('sha256')
        .update(value)
        .digest('hex');
    }
  }