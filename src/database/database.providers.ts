import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schemas';
import { DATABASE_POOL, DRIZZLE_DB } from './database.constants';

const defaultConnectionString =
  'postgresql://postgres:postgres@localhost:5432/optimus_gate';

export const databaseProviders = [
  {
    provide: DATABASE_POOL,
    useFactory: () =>
      new Pool({
        connectionString: process.env.DATABASE_URL ?? defaultConnectionString,
      }),
  },
  {
    provide: DRIZZLE_DB,
    inject: [DATABASE_POOL],
    useFactory: (pool: Pool) => drizzle(pool, { schema }),
  },
];
