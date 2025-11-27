import { Pool, PoolClient } from 'pg';

let pool: Pool | null = null;
let schemaCreated = false;

export function getDB(): Pool {
  if (!pool) {
    const connectionString = process.env.POSTGRES_URL;
    
    if (!connectionString) {
      throw new Error('POSTGRES_URL environment variable is not set. Please add Vercel Postgres to your project.');
    }
    
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

export async function createSchema(): Promise<void> {
  // Only create schema once per cold start
  if (schemaCreated) {
    return;
  }
  
  const db = getDB();
  let client: PoolClient | null = null;
  
  try {
    client = await db.connect();
    
    // Create tables separately to avoid issues
    await client.query(`
      CREATE TABLE IF NOT EXISTS link_tokens (
        token VARCHAR(255) PRIMARY KEY,
        apple_user_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used_at TIMESTAMP WITH TIME ZONE
      )
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        apple_user_id VARCHAR(255) PRIMARY KEY,
        whatsapp_number VARCHAR(255) UNIQUE,
        linked_at TIMESTAMP WITH TIME ZONE
      )
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        apple_user_id VARCHAR(255) NOT NULL,
        amount NUMERIC(10, 2) NOT NULL,
        transaction_date DATE NOT NULL,
        vendor VARCHAR(255),
        category VARCHAR(255),
        note TEXT,
        message_type VARCHAR(50) NOT NULL,
        media_url TEXT,
        status VARCHAR(50) DEFAULT 'pending_sync',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    schemaCreated = true;
    console.log('Database schema created/verified');
  } catch (error) {
    console.error('Error creating schema:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}
