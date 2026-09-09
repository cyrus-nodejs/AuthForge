import {
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import { randomBytes } from 'node:crypto';
  import { RedisService } from '../../redis/redis.service';
  import { UserRepository } from '../users/repositories/user.repository';
  import { SecurityEventService } from '../security-events/security-event.service';
  import { SecurityEventType } from '../security-events/schemas/security-event.schema';
  
  interface GoogleTokenResponse {
    access_token: string;
    id_token?: string;
  }
  
  interface GoogleUserInfo {
    sub: string;
    email: string;
    email_verified: boolean;
    name?: string;
  }
  
  @Injectable()
  export class GoogleService {
    constructor(
      private readonly config: ConfigService,
      private readonly redis: RedisService,
      private readonly users: UserRepository,
      private readonly events: SecurityEventService,
    ) {}
  
    async createAuthorizationUrl() {
      const state = randomBytes(32).toString(
        'base64url',
      );
  
      const ttl = 600;
  
      await this.redis.set(
        `auth:oauth:google:${state}`,
        'active',
        ttl,
      );
  
      const params = new URLSearchParams({
        client_id:
          this.config.getOrThrow<string>(
            'GOOGLE_CLIENT_ID',
          ),
        redirect_uri:
          this.config.getOrThrow<string>(
            'GOOGLE_CALLBACK_URL',
          ),
        response_type: 'code',
        scope:
          'openid email profile',
        state,
        access_type: 'offline',
        prompt: 'select_account',
      });
  
      return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    }
  
    async authenticate(
      code: string,
      state: string,
    ) {
      const stateKey =
        `auth:oauth:google:${state}`;
  
      const valid =
        await this.redis.exists(stateKey);
  
      if (!valid) {
        throw new UnauthorizedException(
          'Invalid OAuth state',
        );
      }
  
      await this.redis.delete(stateKey);
  
      const tokenResponse =
        await fetch(
          'https://oauth2.googleapis.com/token',
          {
            method: 'POST',
            headers: {
              'content-type':
                'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              code,
              client_id:
                this.config.getOrThrow<string>(
                  'GOOGLE_CLIENT_ID',
                ),
              client_secret:
                this.config.getOrThrow<string>(
                  'GOOGLE_CLIENT_SECRET',
                ),
              redirect_uri:
                this.config.getOrThrow<string>(
                  'GOOGLE_CALLBACK_URL',
                ),
              grant_type:
                'authorization_code',
            }),
          },
        );
  
      if (!tokenResponse.ok) {
        throw new UnauthorizedException(
          'Google authentication failed',
        );
      }
  
      const tokens =
        (await tokenResponse.json()) as GoogleTokenResponse;
  
      const profileResponse =
        await fetch(
          'https://openidconnect.googleapis.com/v1/userinfo',
          {
            headers: {
              Authorization:
                `Bearer ${tokens.access_token}`,
            },
          },
        );
  
      if (!profileResponse.ok) {
        throw new UnauthorizedException(
          'Google authentication failed',
        );
      }
  
      const profile =
        (await profileResponse.json()) as GoogleUserInfo;
  
      if (
        !profile.email ||
        !profile.email_verified
      ) {
        throw new UnauthorizedException(
          'Google email is not verified',
        );
      }
  
      const emailNormalized =
        profile.email.toLowerCase();
  
      let user =
        await this.users.findByEmail(
          emailNormalized,
        );
  
      if (!user) {
        user = await this.users.create({
          email: profile.email,
          emailNormalized,
          displayName: profile.name,
        });
      }
  
      await this.users.markEmailVerified(
        user._id,
      );
  
      await this.events.record({
        userId: user._id,
        eventType:
          SecurityEventType.GOOGLE_AUTHENTICATED,
        metadata: {
          provider: 'google',
          subject: profile.sub,
        },
      });
  
      return user;
    }
  }