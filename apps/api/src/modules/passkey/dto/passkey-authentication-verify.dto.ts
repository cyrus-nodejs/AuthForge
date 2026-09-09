import {
    IsDefined,
    IsNotEmpty,
    IsObject,
    IsString,
  } from 'class-validator';
  import type { AuthenticationResponseJSON } from '@simplewebauthn/server';
  
  export class PasskeyAuthenticationVerifyDto {
    @IsString()
    @IsNotEmpty()
    challengeId!: string;
  
    @IsDefined()
    @IsObject()
    credential!: AuthenticationResponseJSON;
  }
  