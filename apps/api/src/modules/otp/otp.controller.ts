import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
  } from '@nestjs/common';
  import { OtpService } from './otp.service';
  import { SendOtpDto } from './dto/send-otp.dto';
  import { VerifyOtpDto } from './dto/verify-otp.dto';
  import { AuthenticationAttemptService } from '../auth/authentication-attempt.service';
  import { UserRepository } from '../users/repositories/user.repository';
  
  @Controller('auth/otp')
  export class OtpController {
    constructor(
      private readonly otp: OtpService,
      private readonly attempts: AuthenticationAttemptService,
      private readonly users: UserRepository,
    ) {}
  
    @Post('send')
    @HttpCode(HttpStatus.OK)
    async send(@Body() dto: SendOtpDto) {
      const attempt =
        await this.attempts.findByAttemptId(
          dto.attemptId,
        );
  
      const user = attempt.userId
        ? await this.users.findById(attempt.userId)
        : undefined;
  
      if (!user) {
        return {
          success: true,
          data: {
            challengeId: 'issued',
            expiresAt: attempt.expiresAt,
          },
        };
      }
  
      const result = await this.otp.issue({
        attemptId: attempt.attemptId,
        userId: user._id.toString(),
        email: user.email,
        purpose: dto.purpose,
      });
  
      return {
        success: true,
        data: result,
      };
    }
  
    @Post('verify')
    @HttpCode(HttpStatus.OK)
    async verify(@Body() dto: VerifyOtpDto) {
      const result =
        await this.otp.verify(dto);
  
      return {
        success: true,
        data: result,
      };
    }
  }