import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  RefreshToken,
  RefreshTokenSchema,
} from './schemas/refresh-token.schema';

import { TokenService } from './token.service';
import { AccessTokenService } from './access-token.service';
import {
  RefreshAuthenticationService,
} from './refresh-authentication.service';

import { SessionModule } from '../session/session.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: RefreshToken.name,
        schema: RefreshTokenSchema,
      },
    ]),
    SessionModule,
    UsersModule,
  ],
  providers: [
    TokenService,
    AccessTokenService,
    RefreshAuthenticationService,
  ],
  exports: [
    TokenService,
    AccessTokenService,
    RefreshAuthenticationService,
  ],
})
export class TokenModule {}