import {
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  
  import { TokenService } from './token.service';
  import { AccessTokenService } from './access-token.service';
  import { SessionService } from '../session/session.service';
  import { UserRepository } from '../users/repositories/user.repository';
  
  @Injectable()
  export class RefreshAuthenticationService {
    constructor(
      private readonly tokens:
        TokenService,
      private readonly accessTokens:
        AccessTokenService,
      private readonly sessions:
        SessionService,
      private readonly users:
        UserRepository,
    ) {}
  
    async refresh(
      refreshToken: string,
    ) {
      const rotated =
        await this.tokens.rotateRefreshToken(
          refreshToken,
        );
  
      const session =
        await this.sessions.findActive(
          rotated.sessionId,
        );
  
     
      const user =
        await this.users.findById(
          rotated.userId,
        );
  
      if (!user) {
        throw new UnauthorizedException(
          'Authentication failed',
        );
      }
  
      const accessToken =
        this.accessTokens.issue({
          userId:
            user._id.toString(),
          sessionId:
            session.sessionId,
          securityVersion:
            user.securityVersion,
          authenticationLevel:
            session.authenticationLevel,
        });
  
      return {
        accessToken,
        refreshToken:
          rotated.token,
        accessTokenExpiresAt:
          this.accessTokenExpiry(),
        refreshTokenExpiresAt:
          rotated.expiresAt,
        sessionId:
          session.sessionId,
      };
    }
  
    private accessTokenExpiry() {
      return (
        Math.floor(Date.now() / 1000) +
        900
      );
    }
  }