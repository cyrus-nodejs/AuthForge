import {
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  import {
    generateRegistrationOptions,
    generateAuthenticationOptions,
    verifyRegistrationResponse,
    verifyAuthenticationResponse,
    AuthenticationResponseJSON,
    RegistrationResponseJSON
  } from '@simplewebauthn/server';
 
  
  import {
    PasskeyCredential,
    PasskeyCredentialDocument,
  } from './schemas/passkey-credential.schema';
  import { RedisService } from '../../redis/redis.service';
  import { CryptoService } from '../../security/crypto.service';
  import { UserRepository } from '../users/repositories/user.repository';
  import { SecurityEventService } from '../security-events/security-event.service';
  import { SecurityEventType } from '../security-events/schemas/security-event.schema';
  
  @Injectable()
  export class PasskeyService {
    constructor(
      @InjectModel(PasskeyCredential.name)
      private readonly credentials:
        Model<PasskeyCredentialDocument>,
      private readonly redis: RedisService,
      private readonly crypto: CryptoService,
      private readonly users: UserRepository,
      private readonly config: ConfigService,
      private readonly events: SecurityEventService,
    ) {}
  
    async registrationOptions(
      userId: string,
    ) {
      const user =
        await this.users.findById(userId);
  
      if (!user) {
        throw new UnauthorizedException(
          'Authentication failed',
        );
      }
  
      const existing =
        await this.credentials.find({
          userId: user._id,
          revokedAt: { $exists: false },
        });
  
      const options =
        await generateRegistrationOptions({
          rpName: 'AuthFort',
          rpID: this.rpId(),
          userName: user.email,
          userDisplayName:
            user.displayName ?? user.email,
          userID: new TextEncoder().encode(
            user._id.toString(),
          ),
          attestationType: 'none',
          excludeCredentials:
            existing.map((credential) => ({
              id: credential.credentialId,
              transports:
                credential.transports as any,
            })),
          authenticatorSelection: {
            residentKey: 'preferred',
            userVerification: 'required',
          },
        });
  
      const challengeId =
        `pk_${this.crypto.randomToken(18)}`;
  
      await this.redis.set(
        `auth:passkey:registration:${challengeId}`,
        JSON.stringify({
          challenge: options.challenge,
          userId,
        }),
        300,
      );
  
      return {
        challengeId,
        options,
      };
    }
  
    async verifyRegistration(
      challengeId: string,
      credential: RegistrationResponseJSON,
    ) {
      const raw = await this.redis.get(
        `auth:passkey:registration:${challengeId}`,
      );
  
      if (!raw) {
        throw new UnauthorizedException(
          'Passkey challenge expired',
        );
      }
  
      const state = JSON.parse(raw) as {
        challenge: string;
        userId: string;
      };
  
      await this.redis.delete(
        `auth:passkey:registration:${challengeId}`,
      );
  
      const verification =
        await verifyRegistrationResponse({
          response: credential as any,
          expectedChallenge: state.challenge,
          expectedOrigin: this.origin(),
          expectedRPID: this.rpId(),
        });
  
      if (
        !verification.verified ||
        !verification.registrationInfo
      ) {
        throw new UnauthorizedException(
          'Passkey registration failed',
        );
      }
  
      const info =
        verification.registrationInfo;
  
      await this.credentials.create({
        userId: state.userId,
        credentialId:
          Buffer.from(
            info.credential.id,
          ).toString('base64url'),
        publicKey:
          Buffer.from(
            info.credential.publicKey,
          ).toString('base64'),
        counter: info.credential.counter,
        transports:
          credential.response &&
          typeof credential.response === 'object'
            ? ((credential.response as any)
                .transports ?? [])
            : [],
        aaguid: info.aaguid,
        deviceType: info.credentialDeviceType,
        backedUp: info.credentialBackedUp,
        name: 'Passkey',
      });
  
      await this.events.record({
        userId: state.userId,
        eventType:
          SecurityEventType.PASSKEY_REGISTERED,
      });
  
      return {
        registered: true,
      };
    }
  
    async authenticationOptions() {
      const options =
        await generateAuthenticationOptions({
          rpID: this.rpId(),
          userVerification: 'required',
        });
  
      const challengeId =
        `pk_${this.crypto.randomToken(18)}`;
  
      await this.redis.set(
        `auth:passkey:authentication:${challengeId}`,
        JSON.stringify({
          challenge: options.challenge,
        }),
        300,
      );
  
      return {
        challengeId,
        options,
      };
    }
  
    async verifyAuthentication(
      challengeId: string,
      credential:   AuthenticationResponseJSON,
    ) {
      const raw = await this.redis.get(
        `auth:passkey:authentication:${challengeId}`,
      );
  
      if (!raw) {
        throw new UnauthorizedException(
          'Passkey challenge expired',
        );
      }
  
      const state = JSON.parse(raw) as {
        challenge: string;
      };
  
      await this.redis.delete(
        `auth:passkey:authentication:${challengeId}`,
      );
  
      const credentialId =
        credential.id;
  
      const stored =
        await this.credentials.findOne({
          credentialId,
          revokedAt: { $exists: false },
        });
  
      if (!stored) {
        throw new UnauthorizedException(
          'Passkey authentication failed',
        );
      }
  
      const verification =
        await verifyAuthenticationResponse({
          response: credential,
          expectedChallenge: state.challenge,
          expectedOrigin: this.origin(),
          expectedRPID: this.rpId(),
          credential: {
            id: stored.credentialId,
            publicKey: Buffer.from(
              stored.publicKey,
              'base64',
            ),
            counter: stored.counter,
            transports:
              stored.transports as any,
          },
        });
  
      if (!verification.verified) {
        throw new UnauthorizedException(
          'Passkey authentication failed',
        );
      }
  
      stored.counter =
        verification.authenticationInfo.newCounter;
      stored.lastUsedAt = new Date();
  
      await stored.save();
  
      await this.events.record({
        userId: stored.userId,
        eventType:
          SecurityEventType.PASSKEY_AUTHENTICATED,
      });
  
      return {
        authenticated: true,
        userId: stored.userId.toString(),
      };
    }
  
    private rpId() {
      return (
        this.config.get<string>(
          'WEBAUTHN_RP_ID',
        ) ?? 'localhost'
      );
    }
  
    private origin() {
      return (
        this.config.get<string>(
          'WEBAUTHN_ORIGIN',
        ) ?? 'http://localhost:3001'
      );
    }
  }