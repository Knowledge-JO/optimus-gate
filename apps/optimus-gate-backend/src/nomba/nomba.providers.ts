import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';
import {
  NOMBA_CONFIG,
  NOMBA_HTTP_CLIENT,
  NombaConfig,
} from './nomba.constants';

export const nombaProviders = [
  {
    provide: NOMBA_CONFIG,
    inject: [ConfigService],
    useFactory: (configService: ConfigService): NombaConfig => ({
      baseUrl:
        configService.get<string>('NOMBA_BASE_URL') ??
        'https://sandbox.nomba.com',
      accountId: configService.get<string>('NOMBA_ACCOUNT_ID') ?? '',
      clientId: configService.get<string>('TEST_NOMBA_CLIENT_ID') ?? '',
      clientSecret: configService.get<string>('TEST_NOMBA_PRIVATE_KEY') ?? '',
      webhookSecret: configService.get<string>('NOMBA_WEBHOOK_SECRET') ?? '',
      subAccountId: configService.get<string>('SUB_ACCOUNT_ID') ?? '',
    }),
  },
  {
    provide: NOMBA_HTTP_CLIENT,
    inject: [NOMBA_CONFIG],
    useFactory: (config: NombaConfig): AxiosInstance =>
      axios.create({
        baseURL: config.baseUrl,
        timeout: 30_000,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
  },
];
