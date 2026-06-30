import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB } from '../database/database.constants';
import { users } from '../database/schemas';
import type { DrizzleDatabase } from '../database/database.types';
import { User, UserRole } from './user.entity';

export interface CreateUserInput {
  email: string;
  passwordHash?: string;
  firstName?: string;
  lastName?: string;
  isEmailVerified?: boolean;
  role?: UserRole;
}

@Injectable()
export class UsersRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase) {}

  async create(input: CreateUserInput): Promise<User> {
    const email = input.email.toLowerCase().trim();

    if (await this.findByEmail(email)) {
      throw new ConflictException('Email is already registered');
    }

    const [user] = await this.db
      .insert(users)
      .values({
        email,
        passwordHash: input.passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        isEmailVerified: input.isEmailVerified ?? false,
        role: input.role ?? UserRole.Customer,
      })
      .returning();

    return this.toDomainUser(user);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    });

    return user ? this.toDomainUser(user) : undefined;
  }

  async findById(id: string): Promise<User | undefined> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    });

    return user ? this.toDomainUser(user) : undefined;
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.db
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  private toDomainUser(user: typeof users.$inferSelect): User {
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash ?? undefined,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
      isEmailVerified: user.isEmailVerified,
      role: user.role as UserRole,
      permissions: user.permissions,
      providers: { local: user.email },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
