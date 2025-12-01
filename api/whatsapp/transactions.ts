import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../lib/db';

// Database migration: create transactions table if it doesn't exist
async function runMigrations() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        apple_user_id VARCHAR(255) NOT NULL,
        amount NUMERIC(10, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
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
    
    // Add currency column if it doesn't exist (for existing tables)
    try {
      await db.query(`
        ALTER TABLE transactions 
        ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD'
      `);
    } catch (alterError: any) {
      // Column might already exist, ignore error
      if (!alterError?.message?.includes('already exists')) {
        console.error('Alter table error:', alterError);
      }
    }
  } catch (error: any) {
    console.error('Migration error:', error);
    console.error('Migration error details:', {
      message: error?.message,
      code: error?.code
    });
    // Don't throw - migrations should be idempotent
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Run migrations on every request
    await runMigrations();
    
    if (req.method === 'GET') {
      const { apple_user_id } = req.query;

      if (!apple_user_id) {
        return res.status(400).json({ error: 'apple_user_id is required' });
      }

      try {
        const result = await db.query(
          `SELECT * FROM transactions 
           WHERE apple_user_id = $1 AND status = 'pending_sync'
           ORDER BY created_at ASC`,
          [apple_user_id]
        );

        return res.status(200).json(result.rows || []);
      } catch (error: any) {
        console.error('Get transactions error:', error);
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
    
    else if (req.method === 'POST') {
      const { transaction_ids } = req.body;

      if (!transaction_ids || !Array.isArray(transaction_ids)) {
        return res.status(400).json({ error: 'transaction_ids array required' });
      }

      if (transaction_ids.length === 0) {
        return res.status(200).json({ message: 'No transactions to confirm' });
      }

      try {
        await db.query(
          `UPDATE transactions SET status = 'synced' WHERE id = ANY($1::int[])`,
          [transaction_ids]
        );

        return res.status(200).json({ success: true });
      } catch (error: any) {
        console.error('Confirm transactions error:', error);
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

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Handler error:', error);
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

