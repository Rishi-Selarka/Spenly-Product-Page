import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDB, createSchema } from '../../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await createSchema();
    const db = getDB();

    if (req.method === 'GET') {
      const apple_user_id = req.query.apple_user_id as string;
      
      if (!apple_user_id) {
        return res.status(400).json({ error: 'apple_user_id is required' });
      }

      const result = await db.query(
        `SELECT id, apple_user_id, amount, transaction_date, vendor, category, note, message_type, media_url, status, created_at
         FROM transactions
         WHERE apple_user_id = $1 AND status = 'pending_sync'
         ORDER BY created_at ASC`,
        [apple_user_id]
      );
      
      const transactions = result.rows.map(row => ({
        ...row,
        date: row.transaction_date ? new Date(row.transaction_date).toISOString().split('T')[0] : null
      }));

      return res.status(200).json(transactions);
    } 
    
    else if (req.method === 'POST') {
      const { transaction_ids } = req.body || {};

      if (!transaction_ids || !Array.isArray(transaction_ids) || transaction_ids.length === 0) {
        return res.status(400).json({ error: 'transaction_ids array is required' });
      }

      await db.query(
        `UPDATE transactions SET status = 'synced' WHERE id = ANY($1::int[])`,
        [transaction_ids]
      );
      
      return res.status(200).json({ message: 'Transactions synced successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error: any) {
    console.error('Error in transactions:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
