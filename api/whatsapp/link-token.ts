import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../lib/db';
import { v4 as uuidv4 } from 'uuid';

// Database migration: create tables and ensure currency columns exist
async function runMigrations() {
  try {
    // Create link_tokens table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS link_tokens (
        token VARCHAR(255) PRIMARY KEY,
        apple_user_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used_at TIMESTAMP WITH TIME ZONE,
        currency VARCHAR(10) DEFAULT 'USD'
      )
    `);

    // Create users table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        apple_user_id VARCHAR(255) PRIMARY KEY,
        whatsapp_number VARCHAR(255) UNIQUE,
        linked_at TIMESTAMP WITH TIME ZONE,
        currency VARCHAR(10) DEFAULT 'USD'
      )
    `);

    // Add currency column if it doesn't exist (for existing tables)
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD'
    `);
    
    await db.query(`
      ALTER TABLE link_tokens 
      ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD'
    `);
  } catch (error) {
    console.error('Migration error:', error);
    // Don't throw - migrations should be idempotent
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Run migrations on every request
  await runMigrations();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { apple_user_id, currency } = req.body;

  if (!apple_user_id) {
    return res.status(400).json({ error: 'apple_user_id is required' });
  }

  try {
    const token = uuidv4();
    // Expires in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const userCurrency = currency || 'USD';

    await db.query(
      `INSERT INTO link_tokens (token, apple_user_id, expires_at, currency) VALUES ($1, $2, $3, $4)`,
      [token, apple_user_id, expiresAt.toISOString(), userCurrency]
    );

    // Store currency in users table when linking (will be updated when token is used)
    await db.query(
      `INSERT INTO users (apple_user_id, currency) 
       VALUES ($1, $2)
       ON CONFLICT (apple_user_id) DO UPDATE SET currency = $2`,
      [apple_user_id, userCurrency]
    );

    return res.status(200).json({ token });
  } catch (error: any) {
    console.error('Link token error:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack
    });
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
}

