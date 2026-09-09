import {
    IsDefined,
    IsNotEmpty,
    IsObject,
    IsString,
  } from 'class-validator';
  import type { RegistrationResponseJSON } from '@simplewebauthn/server';
  
  export class PasskeyRegistrationVerifyDto {
    @IsString()
    @IsNotEmpty()
    challengeId!: string;
  
    @IsDefined()
    @IsObject()
    credential!: RegistrationResponseJSON;
  }
  