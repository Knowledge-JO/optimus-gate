import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import { DRIZZLE_DB } from '../database/database.constants';
import { apiKeys } from '../database/schemas';
import type { DrizzleDatabase } from '../database/database.types';
import {
  ApiKeyEnvironment,
  ApiKeyRecord,
  AuthenticatedApiKey,
} from './api-keys.types';

interface CreateApiKeyRecordInput {
  userId: string;
  name: string;
  prefix: string;
  keyHash: string;
  scopes: string[];
  environment: ApiKeyEnvironment;
}

interface UpdateApiKeyRecordInput {
  name?: string;
  scopes?: string[];
}

@Injectable()
export class ApiKeysRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase) {}

  async create(input: CreateApiKeyRecordInput): Promise<ApiKeyRecord> {
    const [apiKey] = await this.db.insert(apiKeys).values(input).returning();

    return this.toRecord(apiKey);
  }

  async findActiveByPrefix(prefix: string): Promise<
    | (ApiKeyRecord & {
        keyHash: string;
      })
    | undefined
  > {
    const apiKey = await this.db.query.apiKeys.findFirst({
      where: and(eq(apiKeys.prefix, prefix), isNull(apiKeys.revokedAt)),
    });

    return apiKey
      ? {
          ...this.toRecord(apiKey),
          keyHash: apiKey.keyHash,
        }
      : undefined;
  }

  async listByUser(userId: string): Promise<ApiKeyRecord[]> {
    const rows = await this.db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId));

    return rows.map((apiKey) => this.toRecord(apiKey));
  }

  async update(
    userId: string,
    id: string,
    input: UpdateApiKeyRecordInput,
  ): Promise<ApiKeyRecord | undefined> {
    const [apiKey] = await this.db
      .update(apiKeys)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(and(eq(apiKeys.userId, userId), eq(apiKeys.id, id)))
      .returning();

    return apiKey ? this.toRecord(apiKey) : undefined;
  }

  async revoke(userId: string, id: string): Promise<ApiKeyRecord | undefined> {
    const [apiKey] = await this.db
      .update(apiKeys)
      .set({
        revokedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(apiKeys.userId, userId), eq(apiKeys.id, id)))
      .returning();

    return apiKey ? this.toRecord(apiKey) : undefined;
  }

  async markUsed(id: string): Promise<void> {
    await this.db
      .update(apiKeys)
      .set({
        lastUsedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(apiKeys.id, id));
  }

  toAuthenticated(apiKey: ApiKeyRecord): AuthenticatedApiKey {
    return {
      id: apiKey.id,
      userId: apiKey.userId,
      environment: apiKey.environment,
      scopes: apiKey.scopes,
    };
  }

  private toRecord(apiKey: typeof apiKeys.$inferSelect): ApiKeyRecord {
    return {
      id: apiKey.id,
      userId: apiKey.userId,
      name: apiKey.name,
      prefix: apiKey.prefix,
      environment: apiKey.environment,
      scopes: apiKey.scopes,
      lastUsedAt: apiKey.lastUsedAt ?? undefined,
      revokedAt: apiKey.revokedAt ?? undefined,
      createdAt: apiKey.createdAt,
      updatedAt: apiKey.updatedAt,
    };
  }
}
