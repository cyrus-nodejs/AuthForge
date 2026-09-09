import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
  } from '@nestjs/common';
  
  import {
    RefreshAuthenticationService,
  } from './refresh-authentication.service';
  
  import { Public } from '../../common/auth/public.decorator';
  
  class RefreshDto {
    refreshToken!: string;
  }
  
  @Controller('auth/token')
  export class TokenController {
    constructor(
      private readonly refresh:
        RefreshAuthenticationService,
    ) {}
  
    @Post('refresh')
    @Public()
    @HttpCode(HttpStatus.OK)
    async refreshToken(
      @Body() dto: RefreshDto,
    ) {
      return {
        success: true,
        data:
          await this.refresh.refresh(
            dto.refreshToken,
          ),
      };
    }
  }