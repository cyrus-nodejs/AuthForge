import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RecoveryAttempt,
  RecoveryAttemptSchema,
} from './schemas/recovery-attempt.schema';
import {
  RecoveryCode,
  RecoveryCodeSchema,
} from './schemas/recovery-code.schema';
import { RecoveryService } from './recovery.service';
import { RecoveryController } from './recovery.controller';
import { UsersModule } from '../users/users.module';
import { OtpModule } from '../otp/otp.module';
import { SecurityEventModule } from '../security-events/security-event.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: RecoveryAttempt.name,
        schema: RecoveryAttemptSchema,
      },
      {
        name: RecoveryCode.name,
        schema: RecoveryCodeSchema,
      },
    ]),
    UsersModule,
    OtpModule,
    SecurityEventModule,
  ],
  controllers: [RecoveryController],
  providers: [RecoveryService],
  exports: [RecoveryService],
})
export class RecoveryModule {}