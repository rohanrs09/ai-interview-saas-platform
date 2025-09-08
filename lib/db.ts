import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const raw = process.env.DATABASE_URL!;
const url = new URL(raw);
if (!url.searchParams.get('sslmode')) url.searchParams.set('sslmode', 'require');
const client = postgres(url.toString());

export const db = drizzle(client, { schema });