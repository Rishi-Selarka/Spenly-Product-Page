import { Pool } from 'pg';

let pool: Pool | null = null;

export function getDB() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: {
        rejectUnauthorized: false, // Vercel Postgres requires SSL but self-signed is common
      },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

export async function createSchema() {
  const db = getDB();
  const client = await db.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS link_tokens (
        token VARCHAR(255) PRIMARY KEY,
        apple_user_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used_at TIMESTAMP WITH TIME ZONE
      );

      CREATE TABLE IF NOT EXISTS users (
        apple_user_id VARCHAR(255) PRIMARY KEY,
        whatsapp_number VARCHAR(255) UNIQUE,
        linked_at TIMESTAMP WITH TIME ZONE
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        apple_user_id VARCHAR(255) NOT NULL REFERENCES users(apple_user_id),
        amount NUMERIC(10, 2) NOT NULL,
        transaction_date DATE NOT NULL,
        vendor VARCHAR(255),
        category VARCHAR(255),
        note TEXT,
        message_type VARCHAR(50) NOT NULL,
        media_url TEXT,
        status VARCHAR(50) DEFAULT 'pending_sync',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Schema created/verified');
  } finally {
    client.release();
  }
}

