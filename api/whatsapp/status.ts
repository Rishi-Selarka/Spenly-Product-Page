import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

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
    });
  }
  return pool;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = getDB();
    const apple_user_id = req.query.apple_user_id as string;

    if (!apple_user_id) {
      return res.status(400).json({ error: 'apple_user_id is required' });
    }

    if (req.method === 'GET') {
      // Check if user is linked
      const result = await db.query(
        `SELECT whatsapp_number, linked_at FROM users WHERE apple_user_id = $1`,
        [apple_user_id]
      );

      if (result.rows.length === 0) {
        return res.status(200).json({ linked: false });
      }

      return res.status(200).json({
        linked: true,
        whatsapp_number: result.rows[0].whatsapp_number,
        linked_at: result.rows[0].linked_at
      });
    }

    else if (req.method === 'DELETE') {
      // Unlink user
      await db.query(
        `DELETE FROM users WHERE apple_user_id = $1`,
        [apple_user_id]
      );

      return res.status(200).json({ message: 'Account unlinked successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}

