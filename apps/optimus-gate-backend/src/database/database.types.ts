import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schemas';

export type DrizzleDatabase = NodePgDatabase<typeof schema>;
