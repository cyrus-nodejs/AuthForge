import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  User,
  UserDocument,
  UserStatus,
} from '../schemas/user.schema';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findById(userId: string | Types.ObjectId) {
    return this.userModel.findById(userId).exec();
  }

  async findByEmail(emailNormalized: string) {
    return this.userModel
      .findOne({ emailNormalized })
      .exec();
  }

  async create(input: {
    email: string;
    emailNormalized: string;
    displayName?: string;
  }) {
    return this.userModel.create({
      ...input,
      status: UserStatus.ACTIVE,
      securityVersion: 0,
    });
  }

  async markEmailVerified(userId: Types.ObjectId) {
    return this.userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          emailVerifiedAt: new Date(),
        },
      },
      { new: true },
    ).exec();
  }

  async markLogin(userId: Types.ObjectId) {
    return this.userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          lastLoginAt: new Date(),
        },
      },
      { new: true },
    ).exec();
  }

  async incrementSecurityVersion(userId: Types.ObjectId) {
    return this.userModel.findByIdAndUpdate(
      userId,
      {
        $inc: {
          securityVersion: 1,
        },
      },
      { new: true },
    ).exec();
  }
}