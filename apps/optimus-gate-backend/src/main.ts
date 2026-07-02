import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import type { IncomingMessage, ServerResponse } from 'http';
import { json } from 'express';
import { AppModule } from './app.module';

type RawBodyIncomingMessage = IncomingMessage & {
  rawBody?: Buffer;
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    '/nomba/webhooks',
    json({
      verify: (
        request: RawBodyIncomingMessage,
        _response: ServerResponse,
        buffer,
      ) => {
        request.rawBody = Buffer.from(buffer);
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
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
