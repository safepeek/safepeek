import 'dotenv/config';
// @ts-ignore TODO fix this at some point
import * as process from 'node:process';
import { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: 'postgres://safepeek:safepeek@localhost:5432/safepeek'
    // connectionString: process.env.POSTGRES_URL
    // connectionString:
    //   'postgres://default:YVHR5TxBFXC4@ep-square-sunset-a4pbsjqp.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require'
  },
  verbose: true,
  strict: true
} satisfies Config;
