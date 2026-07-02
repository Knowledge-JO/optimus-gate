import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { AxiosInstance } from 'axios';
import {
  NOMBA_CONFIG,
  NOMBA_HTTP_CLIENT,
  type NombaConfig,
} from './nomba.constants';

interface NombaTokenResponse {
  code: string;
  description?: string;
  data?: {
    access_token: string;
    refresh_token: string;
    expiresAt: string;
  };
}

interface CachedNombaToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

@Injectable()
export class NombaAuthService {
  private cachedToken?: CachedNombaToken;

  constructor(
    @Inject(NOMBA_HTTP_CLIENT) private readonly httpClient: AxiosInstance,
    @Inject(NOMBA_CONFIG) private readonly config: NombaConfig,
  ) {}

  async getAccessToken(): Promise<string> {
    if (this.cachedToken && this.cachedToken.expiresAt > this.refreshWindow()) {
      return this.cachedToken.accessToken;
    }

    const response = await this.httpClient.post<NombaTokenResponse>(
      '/v1/auth/token/issue',
      {
        grant_type: 'client_credentials',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      },
      {
        headers: {
          accountId: this.config.accountId,
        },
      },
    );

    if (response.data.code !== '00' || !response.data.data?.access_token) {
      throw new UnauthorizedException(
        response.data.description ?? 'Unable to authenticate with Nomba',
      );
    }

    this.cachedToken = {
      accessToken: response.data.data.access_token,
      refreshToken: response.data.data.refresh_token,
      expiresAt: new Date(response.data.data.expiresAt),
    };

    return this.cachedToken.accessToken;
  }

  private refreshWindow() {
    return new Date(Date.now() + 5 * 60 * 1000);
  }
}
