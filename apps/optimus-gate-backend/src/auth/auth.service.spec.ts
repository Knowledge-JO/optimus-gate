import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { BusinessesService } from '../businesses/businesses.service';
import { emailVerificationTokens } from '../database/schemas/auth.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { User, UserRole } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService email verification', () => {
  const user: User = {
    id: 'user_123',
    email: 'merchant@example.com',
    passwordHash: 'hash',
    firstName: 'Ada',
    lastName: 'Lovelace',
    isEmailVerified: false,
    role: UserRole.Customer,
    permissions: [],
    providers: { local: 'merchant@example.com' },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const usersService = {
    create: jest.fn(),
    findById: jest.fn(),
    markEmailVerified: jest.fn(),
  } as unknown as jest.Mocked<UsersService>;
  const jwtService = {
    signAsync: jest.fn(),
  } as unknown as jest.Mocked<JwtService>;
  const businessesService = {
    createDefaultBusinessForUser: jest.fn(),
  } as unknown as jest.Mocked<BusinessesService>;
  const notificationsService = {
    sendEmailVerification: jest.fn(),
  } as unknown as jest.Mocked<NotificationsService>;
  const db = {
    insert: jest.fn(),
    select: jest.fn(),
    update: jest.fn(),
  };

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'test';
    usersService.create.mockResolvedValue(user);
    usersService.findById.mockResolvedValue(user);
    usersService.markEmailVerified.mockResolvedValue(undefined);
    jwtService.signAsync.mockResolvedValueOnce('access-token');
    jwtService.signAsync.mockResolvedValueOnce('refresh-token');
    businessesService.createDefaultBusinessForUser.mockResolvedValue(undefined);
    notificationsService.sendEmailVerification.mockResolvedValue({
      id: 'email_123',
    });
    db.insert.mockReturnValue({
      values: jest.fn().mockResolvedValue(undefined),
    });
    db.update.mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    });
    service = new AuthService(
      usersService,
      jwtService,
      businessesService,
      notificationsService,
      db as never,
    );
  });

  it('creates a verification token and sends verification email on signup', async () => {
    const result = await service.signup(
      {
        email: user.email,
        password: 'password123',
        firstName: user.firstName,
        lastName: user.lastName,
      },
      {},
    );

    expect(result.user.isEmailVerified).toBe(false);
    expect(result.verificationToken).toEqual(expect.any(String));
    expect(notificationsService.sendEmailVerification).toHaveBeenCalledWith({
      email: user.email,
      token: result.verificationToken,
      userId: user.id,
      idempotencyKey: expect.stringMatching(
        /^email-verification\/user_123\//,
      ),
    });
  });

  it('confirms an unused verification token and marks the user verified', async () => {
    const token = 'valid-token';
    const tokenRecord = {
      id: 'token_123',
      userId: user.id,
      tokenHash: await bcrypt.hash(token, 12),
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
      createdAt: new Date(),
    };
    db.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([tokenRecord]),
      }),
    });

    await expect(service.confirmEmailVerification(token)).resolves.toEqual({
      message: 'Email has been verified',
    });

    expect(db.update).toHaveBeenCalledWith(emailVerificationTokens);
    expect(usersService.markEmailVerified).toHaveBeenCalledWith(user.id);
  });

  it('rejects reused or invalid verification tokens', async () => {
    db.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([]),
      }),
    });

    await expect(
      service.confirmEmailVerification('used-token'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(usersService.markEmailVerified).not.toHaveBeenCalled();
  });
});
