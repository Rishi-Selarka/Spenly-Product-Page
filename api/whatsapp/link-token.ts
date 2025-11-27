import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 as uuidv4 } from 'uuid';
import { Pool } from 'pg';

// Inline database connection (avoids import path issues in Vercel)
let pool: Pool | null = null;

function getDB(): Pool {
  if (!pool) {
    const connectionString = process.env.POSTGRES_URL;
    if (!connectionString) {
      throw new Error('POSTGRES_URL environment variable is not set');
    }
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

async function createSchema(): Promise<void> {
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
  } finally {
    client.release();
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { apple_user_id } = req.body || {};

    if (!apple_user_id) {
      return res.status(400).json({ error: 'apple_user_id is required' });
    }

    await createSchema();
    
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const db = getDB();
    await db.query(
      `INSERT INTO link_tokens (token, apple_user_id, expires_at) VALUES ($1, $2, $3)`,
      [token, apple_user_id, expiresAt]
    );

    return res.status(200).json({
      token: token,
      expires_at: expiresAt.toISOString()
    });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}
