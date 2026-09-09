import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
  } from '@nestjs/common';
  import type { Request } from 'express';
  
  import { SessionService } from './session.service';
  import { AccessTokenService } from '../token/access-token.service';
  import { UserRepository } from '../users/repositories/user.repository';
  import { SecurityEventService } from '../security-events/security-event.service';
  import { SecurityEventType } from '../security-events/schemas/security-event.schema';
  import { AuthUser } from '../../common/auth/auth-user.decorator';
  import { Public } from '../../common/auth/public.decorator';
  
  @Controller('auth')
  export class SessionController {
    constructor(
      private readonly sessions:
        SessionService,
      private readonly accessTokens:
        AccessTokenService,
      private readonly users:
        UserRepository,
      private readonly events:
        SecurityEventService,
    ) {}
  
    @Get('session')
    async session(
      @AuthUser() auth: any,
    ) {
      const user =
        await this.users.findById(
          auth.id,
        );
  
      if (!user) {
        return {
          success: true,
          data: {
            authenticated: false,
          },
        };
      }
  
      return {
        success: true,
        data: {
          authenticated: true,
          user: {
            id:
              user._id.toString(),
            email: user.email,
            displayName:
              user.displayName,
          },
          session: {
            id:
              auth.sessionId,
            authenticationLevel:
              auth.authenticationLevel,
          },
        },
      };
    }
  
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(
      @AuthUser() auth: any,
    ) {
      await this.sessions.revoke(
        auth.sessionId,
        'logout',
      );
  
      await this.accessTokens.revoke({
        sub: auth.id,
        sid: auth.sessionId,
        ver: auth.securityVersion,
        aal: auth.authenticationLevel,
        jti: auth.jti,
        type: 'access',
        iat: 0,
        exp:
          Math.floor(Date.now() / 1000) +
          1,
      });
  
      await this.events.record({
        userId: auth.id,
        sessionId:
          auth.sessionId,
        eventType:
          SecurityEventType.SESSION_REVOKED,
        metadata: {
          reason: 'logout',
        },
      });
  
      return {
        success: true,
        data: {
          authenticated: false,
        },
      };
    }
  
    @Post('logout/all')
    @HttpCode(HttpStatus.OK)
    async logoutAll(
      @AuthUser() auth: any,
    ) {
      await this.sessions.revokeFamily(
        auth.sessionId,
        'logout_all',
      );
  
      await this.users.incrementSecurityVersion(
        auth.id,
      );
  
      return {
        success: true,
        data: {
          authenticated: false,
        },
      };
    }
  }