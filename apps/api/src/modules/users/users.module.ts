import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  User,
  UserSchema,
} from './schemas/user.schema';
import { UserRepository } from './repositories/user.repository';
import { UsersService } from './user.service';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  providers: [UserRepository, UsersService],
  exports: [UserRepository, UsersService]
})
export class UsersModule {}