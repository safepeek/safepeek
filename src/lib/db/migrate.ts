import { config } from 'dotenv';
import * as process from 'node:process';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.dev.vars' });

const databaseUrl = drizzle(postgres(`${process.env.POSTGRES_URL}`, { max: 1 }));

const main = async () => {
  try {
    await migrate(databaseUrl, { migrationsFolder: 'src/lib/db/migrations' });
    console.log('Migration complete');
  } catch (error) {
    console.log(error);
  }
  process.exit(0);
};

main();
