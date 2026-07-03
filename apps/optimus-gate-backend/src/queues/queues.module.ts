import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RENEWAL_QUEUE } from './queues.constants';
import { createBullMqOptions } from './queues.providers';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: createBullMqOptions,
    }),
    BullModule.registerQueue({
      name: RENEWAL_QUEUE,
    }),
  ],
  exports: [BullModule],
})
export class QueuesModule {}
