import { Inject, Injectable } from '@nestjs/common';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  NOMBA_CONFIG,
  NOMBA_HTTP_CLIENT,
  type NombaConfig,
} from './nomba.constants';
import { NombaAuthService } from './nomba-auth.service';

@Injectable()
export class NombaHttpService {
  constructor(
    @Inject(NOMBA_HTTP_CLIENT) private readonly httpClient: AxiosInstance,
    @Inject(NOMBA_CONFIG) private readonly config: NombaConfig,
    private readonly nombaAuthService: NombaAuthService,
  ) {}

  async get<TResponse>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<TResponse> {
    const accessToken = await this.nombaAuthService.getAccessToken();
    const response = await this.httpClient.get<TResponse>(url, {
      ...config,
      headers: {
        ...config?.headers,
        Authorization: `Bearer ${accessToken}`,
        accountId: this.config.accountId,
      },
    });

    return response.data;
  }

  async post<TResponse, TBody = unknown>(
    url: string,
    body: TBody,
    config?: AxiosRequestConfig,
  ): Promise<TResponse> {
    const accessToken = await this.nombaAuthService.getAccessToken();
    const response = await this.httpClient.post<TResponse>(url, body, {
      ...config,
      headers: {
        ...config?.headers,
        Authorization: `Bearer ${accessToken}`,
        accountId: this.config.accountId,
      },
    });

    return response.data;
  }
}
