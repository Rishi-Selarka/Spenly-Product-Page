import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 as uuidv4 } from 'uuid';
import { getDB, createSchema } from '../../lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Ensure schema exists
  await createSchema();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { apple_user_id } = req.body;

  if (!apple_user_id) {
    return res.status(400).json({ error: 'apple_user_id is required' });
  }

  const token = uuidv4();
  // Expires in 10 minutes
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const db = getDB();

  try {
    await db.query(
      `INSERT INTO link_tokens (token, apple_user_id, expires_at) VALUES ($1, $2, $3)`,
      [token, apple_user_id, expiresAt]
    );

    return res.status(200).json({
      token: token,
      expires_at: expiresAt.toISOString()
    });
  } catch (error) {
    console.error('Error creating link token:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

