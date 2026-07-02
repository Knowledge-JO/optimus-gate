import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { JwtRefreshPayload } from '../types';

const cookieExtractor = (request: Request): string | null => {
  const cookies = request.cookies as Record<string, string> | undefined;
  return cookies?.refreshToken ?? null;
};

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret',
    });
  }

  async validate(request: Request, payload: JwtRefreshPayload) {
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException();
    }

    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      tokenId: payload.tokenId,
      refreshToken:
        cookieExtractor(request) ??
        ExtractJwt.fromAuthHeaderAsBearerToken()(request) ??
        '',
    };
  }
}
