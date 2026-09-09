import {
    IsNotEmpty,
    IsString,
    MaxLength,
  } from 'class-validator';
  
  export class VerifyMagicLinkDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(256)
    loginAttemptId!: string;
  
    @IsString()
    @IsNotEmpty()
    @MaxLength(512)
    challengeId!: string;
  
    @IsString()
    @IsNotEmpty()
    @MaxLength(1024)
    token!: string;
  }