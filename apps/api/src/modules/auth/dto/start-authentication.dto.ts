import {
    IsEmail,
    IsObject,
    IsOptional,
    IsString,
    MaxLength,
  } from 'class-validator';
  
  export class StartAuthenticationDto {
    @IsEmail()
    @MaxLength(254)
    email!: string;
  
    @IsOptional()
    @IsObject()
    fingerprint?: Record<string, unknown>;
  
    @IsOptional()
    @IsString()
    @MaxLength(2048)
    userAgent?: string;
  }