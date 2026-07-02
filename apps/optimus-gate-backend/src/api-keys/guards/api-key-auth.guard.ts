import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiKeysService } from '../api-keys.service';
import type { AuthenticatedApiKey } from '../api-keys.types';

type ApiKeyRequest = Request & {
  apiKey?: AuthenticatedApiKey;
};

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ApiKeyRequest>();
    const rawApiKey = this.extractApiKey(request);

    if (!rawApiKey) {
      throw new UnauthorizedException('API key is required');
    }

    request.apiKey = await this.apiKeysService.authenticate(rawApiKey);
    return true;
  }

  private extractApiKey(request: Request): string | undefined {
    const apiKeyHeader = request.header('x-api-key');

    if (apiKeyHeader) {
      return apiKeyHeader;
    }

    const authorization = request.header('authorization');

    if (!authorization?.startsWith('Bearer ')) {
      return undefined;
    }

    return authorization.slice('Bearer '.length);
  }
}
