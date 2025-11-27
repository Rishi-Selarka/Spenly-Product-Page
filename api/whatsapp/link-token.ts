import type { VercelRequest, VercelResponse } from '@vercel/node';

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
    // Log environment check
    const hasPostgresUrl = !!process.env.POSTGRES_URL;
    console.log('POSTGRES_URL available:', hasPostgresUrl);
    
    const { apple_user_id } = req.body || {};

    if (!apple_user_id) {
      return res.status(400).json({ error: 'apple_user_id is required' });
    }

    // Dynamic imports to catch any module loading errors
    const { v4: uuidv4 } = await import('uuid');
    const { getDB, createSchema } = await import('../../lib/db');
    
    // Create schema
    console.log('Creating schema...');
    await createSchema();
    console.log('Schema created');
    
    // Generate token
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Insert into database
    console.log('Getting database connection...');
    const db = getDB();
    
    console.log('Inserting token...');
    await db.query(
      `INSERT INTO link_tokens (token, apple_user_id, expires_at) VALUES ($1, $2, $3)`,
      [token, apple_user_id, expiresAt]
    );
    console.log('Token inserted successfully');

    return res.status(200).json({
      token: token,
      expires_at: expiresAt.toISOString()
    });
  } catch (error: any) {
    console.error('Error in link-token:', error);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      type: error.constructor.name
    });
  }
}
