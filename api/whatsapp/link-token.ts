import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../lib/db';
import { v4 as uuidv4 } from 'uuid';

// Database migration: ensure currency columns exist
async function runMigrations() {
  try {
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
  } catch (error) {
    console.error('Link token error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

