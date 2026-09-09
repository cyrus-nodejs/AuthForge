import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async findById(userId: string | Types.ObjectId) {
    return this.userRepository.findById(userId);
  }

  async findByEmail(emailNormalized: string) {
    return this.userRepository.findByEmail(emailNormalized);
  }

  async create(input: {
    email: string;
    emailNormalized: string;
    displayName?: string;
  }) {
    return this.userRepository.create(input);
  }

  async markEmailVerified(userId: Types.ObjectId) {
    return this.userRepository.markEmailVerified(userId);
  }

  async markLogin(userId: Types.ObjectId) {
    return this.userRepository.markLogin(userId);
  }

  async incrementSecurityVersion(userId: Types.ObjectId) {
    return this.userRepository.incrementSecurityVersion(userId);
  }
}
