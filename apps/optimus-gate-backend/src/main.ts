import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import type { IncomingMessage } from 'http';
import { json } from 'express';
import { AppModule } from './app.module';

type RawBodyIncomingMessage = IncomingMessage & {
  rawBody?: Buffer;
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const trustProxy = configService.get<string>('TRUST_PROXY') ?? '1';
  const httpAdapter = app.getHttpAdapter().getInstance() as {
    set?: (key: string, value: string) => void;
  };

  httpAdapter.set?.('trust proxy', trustProxy);
  app.enableCors({
    origin: createCorsOriginValidator(configService),
    credentials: configService.get<boolean>('CORS_CREDENTIALS') ?? true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: getCsvConfig(configService, 'CORS_ALLOWED_HEADERS', [
      'Authorization',
      'Content-Type',
      'Accept',
      'Origin',
      'X-Requested-With',
      'X-API-Key',
      'x-api-key',
      'nomba-signature',
    ]),
    exposedHeaders: getCsvConfig(configService, 'CORS_EXPOSED_HEADERS', [
      'RateLimit-Limit',
      'RateLimit-Remaining',
      'RateLimit-Reset',
      'Retry-After',
    ]),
    maxAge: configService.get<number>('CORS_MAX_AGE') ?? 86_400,
    optionsSuccessStatus: 204,
  });
  app.use(
    json({
      verify: (request: RawBodyIncomingMessage, _response, buffer) => {
        if (request.url?.startsWith('/webhook')) {
          request.rawBody = Buffer.from(buffer);
        }
      },
    }),
  );
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 4000);
}

function createCorsOriginValidator(configService: ConfigService) {
  const configuredOrigins = getCsvConfig(
    configService,
    'CORS_ALLOWED_ORIGINS',
    process.env.NODE_ENV === 'production'
      ? []
      : [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:5173',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:5173',
        ],
  );
  const allowAllOrigins = configuredOrigins.includes('*');

  return (
    origin: string | undefined,
    callback: (error: Error | null, allow?: boolean) => void,
  ) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowAllOrigins || configuredOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS`), false);
  };
}

function getCsvConfig(
  configService: ConfigService,
  key: string,
  fallback: string[],
) {
  const value = configService.get<string>(key);

  if (!value) {
    return fallback;
  }

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

void bootstrap();
