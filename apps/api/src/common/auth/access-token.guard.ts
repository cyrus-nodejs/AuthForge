import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { AccessTokenService } from '../../modules/token/access-token.service';
  import { SessionService } from '../../modules/session/session.service';
  import { UsersService } from '../../modules/users/user.service';
  import {
    AUTH_LEVEL_KEY,
    AuthenticationLevel,
  } from './auth-level.decorator';
  import { IS_PUBLIC_KEY } from './public.decorator';
  import {
    RequestContextService,
  } from '../request-context/request-context.service';
  
  @Injectable()
  export class AccessTokenGuard
    implements CanActivate
  {
    constructor(
      private readonly reflector: Reflector,
      private readonly accessTokens:
        AccessTokenService,
      private readonly sessions:
        SessionService,
      private readonly users:
        UsersService,
      private readonly context:
        RequestContextService,
    ) {}
  
    async canActivate(
      executionContext: ExecutionContext,
    ) {
      const isPublic =
        this.reflector.getAllAndOverride<boolean>(
          IS_PUBLIC_KEY,
          [
            executionContext.getHandler(),
            executionContext.getClass(),
          ],
        );
  
      if (isPublic) {
        return true;
      }
  
      const request =
        executionContext
          .switchToHttp()
          .getRequest();
  
      const token =
        this.extractBearer(request);
  
      if (!token) {
        throw new UnauthorizedException(
          'Authentication required',
        );
      }
  
      const claims =
        await this.accessTokens.verify(token);
  
      const session =
        await this.sessions.findActive(
          claims.sid,
        );
  
      if (!session) {
        throw new UnauthorizedException(
          'Session is no longer active',
        );
      }
  
      const user =
        await this.users.findById(
          claims.sub,
        );
  
      if (!user) {
        throw new UnauthorizedException(
          'Authentication required',
        );
      }
  
      if (
        user.securityVersion !== claims.ver
      ) {
        throw new UnauthorizedException(
          'Authentication context expired',
        );
      }
  
      const requiredLevel =
        this.reflector.getAllAndOverride<
          AuthenticationLevel
        >(
          AUTH_LEVEL_KEY,
          [
            executionContext.getHandler(),
            executionContext.getClass(),
          ],
        );
  
      if (
        requiredLevel &&
        !this.satisfiesLevel(
              claims.aal,
          requiredLevel,
        )
      ) {
        throw new UnauthorizedException(
          'Step-up authentication required',
        );
      }
  
      request.user = {
        id: claims.sub,
        sessionId: claims.sid,
        securityVersion: claims.ver,
        authenticationLevel:
            claims.aal,
        jti: claims.jti,
      };
  
      this.context.setAuthenticatedContext({
        userId: claims.sub,
        sessionId: claims.sid,
      });
  
      await this.sessions.touch(
        claims.sid,
      );
  
      return true;
    }
  
    private extractBearer(
      request: any,
    ) {
      const authorization =
        request.headers.authorization;
  
      if (
        typeof authorization !==
          'string' ||
        !authorization.startsWith(
          'Bearer ',
        )
      ) {
        return undefined;
      }
  
      return authorization.slice(7);
    }
  
    private satisfiesLevel(
      actual: string,
      required: AuthenticationLevel,
    ) {
      if (actual === 'passkey') {
        return true;
      }
  
      if (
        required === 'step_up'
      ) {
        return actual === 'passkey';
      }
  
      return actual === required;
    }
  }