import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { and, eq, gt, isNull } from 'drizzle-orm';
import type { SignOptions } from 'jsonwebtoken';
import { randomBytes, randomUUID } from 'crypto';
import { DRIZZLE_DB } from '../database/database.constants';
import {
  passwordResetTokens,
  refreshTokens,
} from '../database/schemas/auth.schema';
import type { DrizzleDatabase } from '../database/database.types';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignupDto } from './dto/signup.dto';
import {
  AuthenticatedUser,
  JwtAccessPayload,
  JwtRefreshPayload,
  RefreshAuthenticatedUser,
} from './types';

export interface AuthRequestContext {
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase,
  ) {}

  async signup(dto: SignupDto, context: AuthRequestContext) {
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    return this.issueTokenPair(user, context);
  }

  async login(dto: LoginDto, context: AuthRequestContext) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokenPair(user, context);
  }

  async refresh(user: RefreshAuthenticatedUser, context: AuthRequestContext) {
    const storedRefreshToken = await this.db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.id, user.tokenId),
    });

    if (!storedRefreshToken || storedRefreshToken.revokedAt) {
      throw new UnauthorizedException();
    }

    const tokenMatches = await bcrypt.compare(
      user.refreshToken,
      storedRefreshToken.tokenHash,
    );

    if (!tokenMatches || storedRefreshToken.expiresAt <= new Date()) {
      throw new UnauthorizedException();
    }

    const fullUser = await this.usersService.findById(user.id);

    if (!fullUser) {
      throw new UnauthorizedException();
    }

    await this.revokeRefreshToken(storedRefreshToken.id);
    return this.issueTokenPair(fullUser, context);
  }

  async logout(user: RefreshAuthenticatedUser) {
    await this.revokeRefreshToken(user.tokenId);

    return { message: 'Logged out' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    let resetToken: string | undefined;

    if (user) {
      resetToken = this.createOpaqueToken();
      const resetTokenId = randomUUID();
      await this.db.insert(passwordResetTokens).values({
        id: resetTokenId,
        userId: user.id,
        tokenHash: await bcrypt.hash(resetToken, 12),
        expiresAt: this.fromNowMinutes(20),
      });
    }

    return {
      message: 'If that email exists, a password reset link has been sent',
      ...(process.env.NODE_ENV !== 'production' && resetToken
        ? { resetToken }
        : {}),
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const resetToken = await this.findValidPasswordResetToken(dto.token);

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    await this.usersService.updatePassword(resetToken.userId, passwordHash);
    await this.db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, resetToken.id));
    await this.revokeAllUserRefreshTokens(resetToken.userId);

    return { message: 'Password has been reset' };
  }

  toPublicUser(user: AuthenticatedUser | User) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      ...('firstName' in user ? { firstName: user.firstName } : {}),
      ...('lastName' in user ? { lastName: user.lastName } : {}),
      ...('isEmailVerified' in user
        ? { isEmailVerified: user.isEmailVerified }
        : {}),
    };
  }

  private async issueTokenPair(user: User, context: AuthRequestContext) {
    const refreshTokenId = randomUUID();
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
          type: 'access',
        } satisfies JwtAccessPayload,
        {
          secret: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret',
          expiresIn: this.getJwtExpiresIn('JWT_ACCESS_EXPIRES_IN', '15m'),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: user.id,
          tokenId: refreshTokenId,
          type: 'refresh',
        } satisfies JwtRefreshPayload,
        {
          secret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret',
          expiresIn: this.getJwtExpiresIn('JWT_REFRESH_EXPIRES_IN', '30d'),
        },
      ),
    ]);

    await this.db.insert(refreshTokens).values({
      id: refreshTokenId,
      userId: user.id,
      tokenHash: await bcrypt.hash(refreshToken, 12),
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
      expiresAt: this.fromNowDays(30),
    });

    return {
      user: this.toPublicUser(user),
      accessToken,
      refreshToken,
    };
  }

  private async findValidPasswordResetToken(token: string) {
    const candidates = await this.db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, new Date()),
        ),
      );

    for (const resetToken of candidates) {
      if (await bcrypt.compare(token, resetToken.tokenHash)) {
        return resetToken;
      }
    }

    return undefined;
  }

  private async revokeRefreshToken(tokenId: string) {
    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.id, tokenId));
  }

  private async revokeAllUserRefreshTokens(userId: string) {
    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)),
      );
  }

  private createOpaqueToken() {
    return randomBytes(32).toString('base64url');
  }

  private fromNowMinutes(minutes: number) {
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  private fromNowDays(days: number) {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  private getJwtExpiresIn(
    envName: 'JWT_ACCESS_EXPIRES_IN' | 'JWT_REFRESH_EXPIRES_IN',
    fallback: NonNullable<SignOptions['expiresIn']>,
  ): NonNullable<SignOptions['expiresIn']> {
    return (process.env[envName] ?? fallback) as NonNullable<
      SignOptions['expiresIn']
    >;
  }
}
