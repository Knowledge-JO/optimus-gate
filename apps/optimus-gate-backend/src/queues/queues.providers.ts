import type { BullRootModuleOptions } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import type { RedisOptions } from 'ioredis';

export const createBullMqOptions = (
  configService: ConfigService,
): BullRootModuleOptions => ({
  connection: createRedisConnectionOptions(configService),
});

export const createRedisConnectionOptions = (
  configService: ConfigService,
): RedisOptions => {
  const redisUrl = configService.get<string>('REDIS_URL');

  if (redisUrl) {
    return parseRedisUrl(redisUrl);
  }

  return {
    host: configService.get<string>('REDIS_HOST') ?? '127.0.0.1',
    port: Number(configService.get<number | string>('REDIS_PORT') ?? 6379),
    maxRetriesPerRequest: null,
  };
};

const parseRedisUrl = (redisUrl: string): RedisOptions => {
  const parsedUrl = new URL(redisUrl);
  const database = parsedUrl.pathname.replace('/', '');
  const options: RedisOptions = {
    host: parsedUrl.hostname,
    port: parsedUrl.port ? Number(parsedUrl.port) : 6379,
    username: parsedUrl.username
      ? decodeURIComponent(parsedUrl.username)
      : undefined,
    password: parsedUrl.password
      ? decodeURIComponent(parsedUrl.password)
      : undefined,
    db: database ? Number(database) : undefined,
    maxRetriesPerRequest: null,
  };

  if (parsedUrl.protocol === 'rediss:') {
    options.tls = {};
  }

  return options;
};
