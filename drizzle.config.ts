import 'dotenv/config';
// @ts-ignore TODO fix this at some point
import * as process from 'node:process';
import { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.POSTGRES_URL
  },
  verbose: true,
  strict: true
} satisfies Config;
