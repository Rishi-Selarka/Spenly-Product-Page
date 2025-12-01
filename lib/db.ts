import { createPool } from '@vercel/postgres';

// Create a connection pool
// POSTGRES_URL is automatically set by Vercel
export const db = createPool({
  connectionString: process.env.POSTGRES_URL,
});

export async function query(text: string, params: any[] = []) {
  return db.query(text, params);
}

