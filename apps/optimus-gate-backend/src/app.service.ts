import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DRIZZLE_DB } from './database/database.constants';
import type { DrizzleDatabase } from './database/database.types';

@Injectable()
export class AppService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase) {}

  async getStatus() {
    const startedAt = new Date();
    let database: {
      status: 'up' | 'down';
      latencyMs?: number;
      error?: string;
    };

    try {
      const beforeQuery = Date.now();
      await this.db.execute(sql`select 1`);
      database = {
        status: 'up',
        latencyMs: Date.now() - beforeQuery,
      };
    } catch (error) {
      database = {
        status: 'down',
        error: error instanceof Error ? error.message : 'Database unavailable',
      };
    }

    return {
      status: database.status === 'up' ? 'ok' : 'degraded',
      server: {
        status: 'up',
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: startedAt.toISOString(),
      },
      database,
    };
  }
}
