import { Pool, PoolClient } from 'pg';

let pool: Pool | null = null;
let schemaCreated = false;

export function getDB(): Pool {
  if (!pool) {
    const connectionString = process.env.POSTGRES_URL;
    
    if (!connectionString) {
      console.error('POSTGRES_URL is not set. Available env vars:', Object.keys(process.env).filter(k => k.includes('POSTGRES') || k.includes('DATABASE')));
      throw new Error('POSTGRES_URL environment variable is not set');
    }
    
    console.log('Creating database pool...');
    
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    
    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected database pool error:', err);
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
    console.log('Connecting to database for schema creation...');
    client = await db.connect();
    console.log('Connected. Creating tables...');
    
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
    console.log('link_tokens table ready');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        apple_user_id VARCHAR(255) PRIMARY KEY,
        whatsapp_number VARCHAR(255) UNIQUE,
        linked_at TIMESTAMP WITH TIME ZONE
      )
    `);
    console.log('users table ready');
    
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
    console.log('transactions table ready');
    
    schemaCreated = true;
    console.log('Database schema created/verified successfully');
  } catch (error) {
    console.error('Error creating schema:', error);
    // Don't throw - tables might already exist
    schemaCreated = true; // Assume they exist
  } finally {
    if (client) {
      client.release();
    }
  }
}
