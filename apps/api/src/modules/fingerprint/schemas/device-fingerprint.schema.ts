import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DeviceFingerprintDocument =
  HydratedDocument<DeviceFingerprint>;

export enum FingerprintStatus {
  ACTIVE = 'active',
  REVOKED = 'revoked',
}

export enum FingerprintTrustLevel {
  UNKNOWN = 'unknown',
  TRUSTED = 'trusted',
}

@Schema({
  collection: 'device_fingerprints',
  timestamps: true,
})
export class DeviceFingerprint {
  _id!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId!: Types.ObjectId;

  @Prop({ required: true, index: true })
  fingerprintHash!: string;

  @Prop({
    enum: FingerprintTrustLevel,
    default: FingerprintTrustLevel.UNKNOWN,
  })
  trustLevel!: FingerprintTrustLevel;

  @Prop({
    enum: FingerprintStatus,
    default: FingerprintStatus.ACTIVE,
  })
  status!: FingerprintStatus;

  @Prop({ required: true })
  firstSeenAt!: Date;

  @Prop({ required: true })
  lastSeenAt!: Date;

  @Prop()
  lastIpHash?: string;

  @Prop()
  userAgentHash?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const DeviceFingerprintSchema =
  SchemaFactory.createForClass(DeviceFingerprint);

DeviceFingerprintSchema.index(
  { userId: 1, fingerprintHash: 1 },
  { unique: true },
);