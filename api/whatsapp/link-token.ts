import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 as uuidv4 } from 'uuid';
import { getDB, createSchema } from '../../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
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
    // Ensure schema exists
    await createSchema();
    
    const { apple_user_id } = req.body || {};

    if (!apple_user_id) {
      return res.status(400).json({ error: 'apple_user_id is required' });
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

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
    console.error('Error in link-token:', error);
    
    // Provide helpful error messages
    if (error.message?.includes('POSTGRES_URL')) {
      return res.status(500).json({ 
        error: 'Database not configured. Please add Vercel Postgres to your project.' 
      });
    }
    
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
