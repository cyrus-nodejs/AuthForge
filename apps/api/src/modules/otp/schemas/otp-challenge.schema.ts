import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OtpChallengeDocument = HydratedDocument<OtpChallenge>;

@Schema({
  collection: 'otp_challenges',
  timestamps: true,
})
export class OtpChallenge {
  _id!: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  challengeId!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId?: Types.ObjectId;

  @Prop({ index: true })
  attemptId?: string;

  @Prop({ required: true })
  codeHash!: string;

  @Prop({ required: true, index: true })
  purpose!: string;

  @Prop({ required: true, default: 'active' })
  status!: string;

  @Prop({ required: true, default: 0 })
  attemptCount!: number;

  @Prop({ required: true, default: 5 })
  maxAttempts!: number;

  @Prop({ required: true, index: true })
  expiresAt!: Date;

  @Prop()
  consumedAt?: Date;
}

export const OtpChallengeSchema =
  SchemaFactory.createForClass(OtpChallenge);

OtpChallengeSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 },
);