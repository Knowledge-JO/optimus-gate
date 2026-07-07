import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { ApiKeysService } from '../../api-keys/api-keys.service';
import type { AuthenticatedApiKey } from '../../api-keys/api-keys.types';
import type { AuthenticatedUser, JwtAccessPayload } from '../../auth/types';
import { UsersService } from '../../users/users.service';

type CheckoutAuthRequest = Request & {
  apiKey?: AuthenticatedApiKey;
  user?: AuthenticatedUser;
};

@Injectable()
export class ApiKeyOrJwtAuthGuard implements CanActivate {
  constructor(
    private readonly apiKeysService: ApiKeysService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<CheckoutAuthRequest>();
    const rawApiKey = request.header('x-api-key');

    if (rawApiKey && (await this.authenticateApiKey(request, rawApiKey))) {
      return true;
    }

    const bearer = this.extractBearer(request);

    if (bearer && (await this.authenticateApiKey(request, bearer))) {
      return true;
    }

    if (bearer && (await this.authenticateJwt(request, bearer))) {
      return true;
    }

    throw new UnauthorizedException('API key or JWT is required');
  }

  private async authenticateApiKey(
    request: CheckoutAuthRequest,
    rawApiKey: string,
  ) {
    try {
      request.apiKey = await this.apiKeysService.authenticate(rawApiKey);
      return true;
    } catch {
      return false;
    }
  }

  private async authenticateJwt(request: CheckoutAuthRequest, token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtAccessPayload>(
        token,
        {
          secret: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret',
        },
      );

      if (payload.type !== 'access') {
        return false;
      }

      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        return false;
      }

      request.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        isEmailVerified: user.isEmailVerified,
      };
      return true;
    } catch {
      return false;
    }
  }

  private extractBearer(request: Request) {
    const authorization = request.header('authorization');

    if (!authorization?.startsWith('Bearer ')) {
      return undefined;
    }

    return authorization.slice('Bearer '.length);
  }
}
