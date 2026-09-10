import { plainToInstance,   Transform } from 'class-transformer';
import { Matches } from 'class-validator';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  validateSync,
} from 'class-validator';

const toNumber = ({ value }: { value: unknown }) => {
  if (value === undefined || value === '') {
    return value;
  }

  return Number(value);
};

const toBoolean = ({ value }: { value: unknown }) => {
  if (value === undefined || value === '') {
    return value;
  }

  if (value === true || value === false) {
    return value;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return value;
};

class EnvironmentVariables {
@IsString()
  @Matches(/^mongodb(\+srv)?:\/\//, {
    message: 'DB_URI must be a valid MongoDB connection string',
  })
  DB_URI!: string;

  @Matches(/^redis(s)?:\/\//, {
    message: 'REDIS_URL must be a valid Redis connection string',
  })
  REDIS_URL!: string;

  @IsString()
  GOOGLE_CLIENT_ID!: string;

  @IsString()
  GOOGLE_CLIENT_SECRET!: string;

  @IsUrl({ require_tld: false })
  GOOGLE_CALLBACK_URL!: string;

  @IsString()
  SMTP_HOST!: string;

  @Transform(toNumber)
  @IsInt()
  @Min(1)
  SMTP_PORT!: number;

  @IsString()
  SMTP_USER!: string;

  @IsString()
  SMTP_PASSWORD!: string;

  @IsString()
  SMTP_FROM!: string;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  SMTP_SECURE: boolean = true;

  @IsString()
  AUTH_ACCESS_TOKEN_SECRET!: string;

  @IsString()
  AUTH_REFRESH_TOKEN_SECRET!: string;

  @IsOptional()
  @Transform(toNumber)
  @IsInt()
  @Min(60)
  ACCESS_TOKEN_TTL_SECONDS = 900;

  @IsOptional()
  @Transform(toNumber)
  @IsInt()
  @Min(300)
  REFRESH_TOKEN_TTL_SECONDS = 2592000;

  @IsOptional()
  @Transform(toNumber)
  @IsInt()
  @Min(60)
  MAGIC_LINK_TTL_SECONDS = 600;

  @IsOptional()
  @Transform(toNumber)
  @IsInt()
  @Min(60)
  OTP_TTL_SECONDS = 300;

  @IsOptional()
  @Transform(toNumber)
  @IsInt()
  @Min(60)
  AUTH_ATTEMPT_TTL_SECONDS = 900;

  @IsOptional()
  @Transform(toNumber)
  @IsInt()
  @Min(60)
  RECOVERY_ATTEMPT_TTL_SECONDS = 900;

  @IsOptional()
  @IsUrl({ require_tld: false })
  FRONTEND_URL = 'http://localhost:3000';

  @IsOptional()
  @IsUrl({ require_tld: false })
  WEBAUTHN_ORIGIN = 'http://localhost:3000';

  @IsOptional()
  @IsString()
  WEBAUTHN_RP_ID = 'localhost';
}

export function validateEnvironment(config: Record<string, unknown>) {
  const values = plainToInstance(EnvironmentVariables, config);

  const errors = validateSync(values, {
    whitelist: true,
    forbidUnknownValues: true,
  });

  if (errors.length > 0) {
    throw new Error(
      `Invalid environment configuration: ${errors
        .map((error) =>
          Object.values(error.constraints ?? {}).join(', '),
        )
        .join('; ')}`,
    );
  }

  return values;
}
