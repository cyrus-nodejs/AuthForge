import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('DB_URI'),
        autoIndex: true,
        serverSelectionTimeoutMS: 10_000,
      }),
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}