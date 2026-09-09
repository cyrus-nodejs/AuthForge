import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PasskeyCredentialDocument =
  HydratedDocument<PasskeyCredential>;

@Schema({
  collection: 'passkey_credentials',
  timestamps: true,
})
export class PasskeyCredential {
  _id!: Types.ObjectId;

  @Prop({ required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, unique: true })
  credentialId!: string;

  @Prop({ required: true })
  publicKey!: string;

  @Prop({ required: true, default: 0 })
  counter!: number;

  @Prop({ type: [String], default: [] })
  transports!: string[];

  @Prop()
  aaguid?: string;

  @Prop()
  deviceType?: string;

  @Prop({ default: false })
  backedUp!: boolean;

  @Prop({ maxlength: 100 })
  name?: string;

  @Prop()
  lastUsedAt?: Date;

  @Prop()
  revokedAt?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const PasskeyCredentialSchema =
  SchemaFactory.createForClass(PasskeyCredential);

PasskeyCredentialSchema.index({ credentialId: 1 }, { unique: true });
PasskeyCredentialSchema.index({ userId: 1 });