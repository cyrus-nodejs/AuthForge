import {
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import { createHmac } from 'node:crypto';
  import { RedisService } from '../../redis/redis.service';
  
  export interface AccessTokenClaims {
    sub: string;
    sid: string;
    ver: number;
    aal: string;
    iat: number;
    exp: number;
    jti: string;
    type: 'access';
  }
  
  @Injectable()
  export class AccessTokenService {
    constructor(
      private readonly config: ConfigService,
      private readonly redis: RedisService,
    ) {}
  
    issue(input: {
      userId: string;
      sessionId: string;
      securityVersion: number;
      authenticationLevel: string;
    }) {
      const now = Math.floor(Date.now() / 1000);
      const ttl = this.config.getOrThrow<number>(
        'ACCESS_TOKEN_TTL_SECONDS',
      );
  
      const claims: AccessTokenClaims = {
        sub: input.userId,
        sid: input.sessionId,
        ver: input.securityVersion,
        aal: input.authenticationLevel,
        iat: now,
        exp: now + ttl,
        jti: this.randomId(),
        type: 'access',
      };
  
      return this.sign(claims);
    }
  
    async verify(token: string): Promise<AccessTokenClaims> {
      const [encodedHeader, encodedPayload, signature] =
        token.split('.');
  
      if (
        !encodedHeader ||
        !encodedPayload ||
        !signature
      ) {
        throw new UnauthorizedException(
          'Invalid access token',
        );
      }
  
      const expected = this.signature(
        `${encodedHeader}.${encodedPayload}`,
      );
  
      if (expected !== signature) {
        throw new UnauthorizedException(
          'Invalid access token',
        );
      }
  
      let claims: AccessTokenClaims;
  
      try {
        claims = JSON.parse(
          Buffer.from(
            encodedPayload,
            'base64url',
          ).toString('utf8'),
        );
      } catch {
        throw new UnauthorizedException(
          'Invalid access token',
        );
      }
  
      if (
        claims.type !== 'access' ||
        claims.exp <= Math.floor(Date.now() / 1000)
      ) {
        throw new UnauthorizedException(
          'Access token expired',
        );
      }
  
      const revoked = await this.redis.exists(
        `auth:access:revoked:${claims.jti}`,
      );
  
      if (revoked) {
        throw new UnauthorizedException(
          'Access token revoked',
        );
      }
  
      return claims;
    }
  
    async revoke(claims: AccessTokenClaims) {
      const ttl = Math.max(
        claims.exp - Math.floor(Date.now() / 1000),
        1,
      );
  
      await this.redis.set(
        `auth:access:revoked:${claims.jti}`,
        '1',
        ttl,
      );
    }
  
    private sign(claims: AccessTokenClaims) {
      const header = {
        alg: 'HS256',
        typ: 'JWT',
      };
  
      const encodedHeader =
        Buffer.from(JSON.stringify(header))
          .toString('base64url');
  
      const encodedPayload =
        Buffer.from(JSON.stringify(claims))
          .toString('base64url');
  
      const signature = this.signature(
        `${encodedHeader}.${encodedPayload}`,
      );
  
      return `${encodedHeader}.${encodedPayload}.${signature}`;
    }
  
    private signature(input: string) {
      return createHmac(
        'sha256',
        this.config.getOrThrow<string>(
          'AUTH_ACCESS_TOKEN_SECRET',
        ),
      )
        .update(input)
        .digest('base64url');
    }
  
    private randomId() {
      return `${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2)}`;
    }
  }