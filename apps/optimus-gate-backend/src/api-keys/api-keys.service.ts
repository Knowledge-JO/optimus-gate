import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { ApiKeysRepository } from './api-keys.repository';
import { AuthenticatedApiKey } from './api-keys.types';

@Injectable()
export class ApiKeysService {
  constructor(private readonly apiKeysRepository: ApiKeysRepository) {}

  async create(userId: string, dto: CreateApiKeyDto) {
    const environment = dto.environment ?? 'test';
    const secret = randomBytes(32).toString('base64url');
    const prefix = `og_${environment}_${secret.slice(0, 8)}`;
    const rawKey = `${prefix}_${secret}`;
    const keyHash = await bcrypt.hash(rawKey, 12);
    const apiKey = await this.apiKeysRepository.create({
      userId,
      name: dto.name,
      prefix,
      keyHash,
      environment,
      scopes: dto.scopes ?? ['subscriptions:create', 'subscriptions:read'],
    });

    return {
      apiKey: rawKey,
      key: this.toPublicApiKey(apiKey),
    };
  }

  async list(userId: string) {
    const apiKeys = await this.apiKeysRepository.listByUser(userId);
    return apiKeys.map((apiKey) => this.toPublicApiKey(apiKey));
  }

  async update(userId: string, id: string, dto: UpdateApiKeyDto) {
    const apiKey = await this.apiKeysRepository.update(userId, id, dto);

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    return this.toPublicApiKey(apiKey);
  }

  async revoke(userId: string, id: string) {
    const apiKey = await this.apiKeysRepository.revoke(userId, id);

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    return this.toPublicApiKey(apiKey);
  }

  async authenticate(rawApiKey: string): Promise<AuthenticatedApiKey> {
    const prefix = this.extractPrefix(rawApiKey);
    const apiKey = await this.apiKeysRepository.findActiveByPrefix(prefix);

    if (!apiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    const matches = await bcrypt.compare(rawApiKey, apiKey.keyHash);

    if (!matches) {
      throw new UnauthorizedException('Invalid API key');
    }

    await this.apiKeysRepository.markUsed(apiKey.id);
    return this.apiKeysRepository.toAuthenticated(apiKey);
  }

  private extractPrefix(rawApiKey: string) {
    const [brand, environment, shortId] = rawApiKey.split('_');

    if (!brand || !environment || !shortId) {
      throw new UnauthorizedException('Invalid API key');
    }

    return [brand, environment, shortId].join('_');
  }

  private toPublicApiKey(apiKey: {
    id: string;
    name: string;
    prefix: string;
    environment: string;
    scopes: string[];
    lastUsedAt?: Date;
    revokedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: apiKey.id,
      name: apiKey.name,
      prefix: apiKey.prefix,
      environment: apiKey.environment,
      scopes: apiKey.scopes,
      lastUsedAt: apiKey.lastUsedAt,
      revokedAt: apiKey.revokedAt,
      createdAt: apiKey.createdAt,
      updatedAt: apiKey.updatedAt,
    };
  }
}
