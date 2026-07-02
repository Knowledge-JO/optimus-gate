export type ApiKeyEnvironment = 'test' | 'live';

export interface AuthenticatedApiKey {
  id: string;
  userId: string;
  environment: ApiKeyEnvironment;
  scopes: string[];
}

export interface ApiKeyRecord extends AuthenticatedApiKey {
  name: string;
  prefix: string;
  lastUsedAt?: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
