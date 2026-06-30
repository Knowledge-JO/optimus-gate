import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { CreateUserInput, UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  create(input: CreateUserInput): Promise<User> {
    return this.usersRepository.create(input);
  }

  findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findByEmail(email);
  }

  findById(id: string): Promise<User | undefined> {
    return this.usersRepository.findById(id);
  }

  updatePassword(userId: string, passwordHash: string): Promise<void> {
    return this.usersRepository.updatePassword(userId, passwordHash);
  }
}
