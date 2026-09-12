import {
    Controller,
    Get,
    Query,
    Res,
  } from '@nestjs/common';
  import type { Response } from 'express';
  
  import { GoogleService } from './google.service';
  import {
    GoogleAuthenticationService,
  } from './google-authentication.service';
  
  @Controller('auth/google')
  export class GoogleController {
    constructor(
      private readonly google:
        GoogleService,
      private readonly authentication:
        GoogleAuthenticationService,
    ) {}
  
    @Get()
    async start(
      @Res() response: Response,
    ) {
      return response.redirect(
        await this.google.createAuthorizationUrl(),
      );
    }
  
    @Get('callback')
    async callback(
      @Query('code') code: string,
      @Query('state') state: string,
    ) {
      if (!code || !state) {
        return {
          success: false,
          error: {
            code: 'INVALID_OAUTH_CALLBACK',
          },
        };
      }
  
      const tokens =
        await this.authentication.authenticate(
          code,
          state,
        );
  
      return {
        success: true,
        data: tokens,
      };
    }
  }