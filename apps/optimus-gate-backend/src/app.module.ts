import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import * as Joi from 'joi';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().optional(),
        JWT_ACCESS_SECRET: Joi.string().optional(),
        JWT_REFRESH_SECRET: Joi.string().optional(),
        NOMBA_BASE_URL: Joi.string().uri().optional(),
        NOMBA_ACCOUNT_ID: Joi.string().optional(),
        NOMBA_CLIENT_ID: Joi.string().optional(),
        NOMBA_CLIENT_SECRET: Joi.string().optional(),
        NOMBA_WEBHOOK_SECRET: Joi.string().optional(),
        REDIS_URL: Joi.string()
          .uri({
            scheme: ['redis', 'rediss'],
          })
          .optional(),
        REDIS_HOST: Joi.string().optional(),
        REDIS_PORT: Joi.number().optional(),
      }),
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 60,
      },
    ]),
    AuthModule,
    ApiKeysModule,
    BillingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
