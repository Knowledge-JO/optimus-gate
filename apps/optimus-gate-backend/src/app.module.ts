import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import * as Joi from 'joi';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BillingModule } from './billing/billing.module';
import { DatabaseModule } from './database/database.module';

function getTrackerValue(value: unknown) {
  if (typeof value === 'string') {
    return value.split(',')[0]?.trim() || 'unknown';
  }

  if (Array.isArray(value) && value[0]) {
    return getTrackerValue(value[0]);
  }

  return 'unknown';
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .optional(),
        DATABASE_URL: Joi.string().optional(),
        JWT_ACCESS_SECRET: Joi.string().optional(),
        JWT_REFRESH_SECRET: Joi.string().optional(),
        SMTP_HOST: Joi.when('NODE_ENV', {
          is: 'production',
          then: Joi.string().required(),
          otherwise: Joi.string().optional(),
        }),
        SMTP_PORT: Joi.when('NODE_ENV', {
          is: 'production',
          then: Joi.number().port().required(),
          otherwise: Joi.number().port().optional(),
        }),
        SMTP_USER: Joi.when('NODE_ENV', {
          is: 'production',
          then: Joi.string().required(),
          otherwise: Joi.string().optional(),
        }),
        SMTP_PASSWORD: Joi.when('NODE_ENV', {
          is: 'production',
          then: Joi.string().required(),
          otherwise: Joi.string().optional(),
        }),
        SMTP_FROM_EMAIL: Joi.when('NODE_ENV', {
          is: 'production',
          then: Joi.string().required(),
          otherwise: Joi.string().optional(),
        }),
        SMTP_SECURE: Joi.boolean().optional(),
        APP_FRONTEND_URL: Joi.when('NODE_ENV', {
          is: 'production',
          then: Joi.string().uri().required(),
          otherwise: Joi.string().uri().optional(),
        }),
        CORS_ALLOWED_ORIGINS: Joi.string().optional(),
        CORS_ALLOWED_HEADERS: Joi.string().optional(),
        CORS_EXPOSED_HEADERS: Joi.string().optional(),
        CORS_MAX_AGE: Joi.number().integer().min(0).optional(),
        CORS_CREDENTIALS: Joi.boolean().optional(),
        TRUST_PROXY: Joi.alternatives()
          .try(Joi.boolean(), Joi.number().integer().min(0), Joi.string())
          .optional(),
        NOMBA_ACCOUNT_ID: Joi.string().optional(),
        TEST_NOMBA_CLIENT_ID: Joi.string().optional(),
        TEST_NOMBA_PRIVATE_KEY: Joi.string().optional(),
        LIVE_NOMBA_CLIENT_ID: Joi.string().optional(),
        LIVE_NOMBA_PRIVATE_KEY: Joi.string().optional(),
        NOMBA_WEBHOOK_SECRET: Joi.string().optional(),
        SUB_ACCOUNT_ID: Joi.string().optional(),
        NOMBA_LIVE_API_URL: Joi.string().uri().optional(),
        NOMBA_TEST_API_URL: Joi.string().uri().optional(),
        REDIS_URL: Joi.string()
          .uri({
            scheme: ['redis', 'rediss'],
          })
          .optional(),
        REDIS_HOST: Joi.string().optional(),
        REDIS_PORT: Joi.number().optional(),
        THROTTLE_TTL_MS: Joi.number().integer().min(1000).optional(),
        THROTTLE_LIMIT: Joi.number().integer().min(1).optional(),
        THROTTLE_BLOCK_DURATION_MS: Joi.number().integer().min(1000).optional(),
      }),
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('THROTTLE_TTL_MS') ?? 60_000,
            limit: configService.get<number>('THROTTLE_LIMIT') ?? 120,
            blockDuration: configService.get<number>(
              'THROTTLE_BLOCK_DURATION_MS',
              60_000,
            ),
          },
        ],
        getTracker: (request: Record<string, unknown>) => {
          const headers = request.headers as Record<
            string,
            string | string[] | undefined
          >;
          const forwardedFor =
            headers?.['x-forwarded-for'] ?? request['x-forwarded-for'];
          const tracker = getTrackerValue(forwardedFor);

          if (tracker !== 'unknown') {
            return tracker;
          }

          return getTrackerValue(request.ip);
        },
      }),
    }),
    AuthModule,
    ApiKeysModule,
    BillingModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
