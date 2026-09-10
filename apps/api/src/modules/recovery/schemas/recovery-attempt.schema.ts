import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RecoveryAttemptDocument =
  HydratedDocument<RecoveryAttempt>;

@Schema({
  collection: 'recovery_attempts',
  timestamps: true,
})
export class RecoveryAttempt {
  _id!: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  recoveryAttemptId!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId?: Types.ObjectId;

  @Prop({ index: true })
  emailNormalized?: string;

  @Prop({ required: true })
  riskLevel!: string;

  @Prop({ type: [String], default: [] })
  requiredMethods!: string[];

  @Prop({ type: [String], default: [] })
  completedMethods!: string[];

  @Prop({ default: 'pending', index: true })
  status!: string;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop()
  completedAt?: Date;
}

export const RecoveryAttemptSchema =
  SchemaFactory.createForClass(RecoveryAttempt);

RecoveryAttemptSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 },
);