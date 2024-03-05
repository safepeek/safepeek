import { Client } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

export const client = (env: Record<string, any>) => new Client({ connectionString: env.POSTGRES_URL });

export const database = (client: Client) => drizzle(client, { schema });