import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DeviceFingerprint,
  DeviceFingerprintSchema,
} from './schemas/device-fingerprint.schema';
import { FingerprintService } from './fingerprint.service';
import { SecurityEventModule } from '../security-events/security-event.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: DeviceFingerprint.name,
        schema: DeviceFingerprintSchema,
      },
    ]),
    SecurityEventModule,
  ],
  providers: [FingerprintService],
  exports: [FingerprintService],
})
export class FingerprintModule {}