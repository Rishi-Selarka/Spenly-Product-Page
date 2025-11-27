import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDB } from '../../lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const db = getDB();

  if (req.method === 'GET') {
    const { apple_user_id } = req.query;
    
    if (!apple_user_id) {
      return res.status(400).json({ error: 'apple_user_id is required' });
    }

    try {
      const result = await db.query(
        `SELECT id, apple_user_id, amount, transaction_date, vendor, category, note, message_type, media_url, status, created_at
         FROM transactions
         WHERE apple_user_id = $1 AND status = 'pending_sync'
         ORDER BY created_at ASC`,
        [apple_user_id]
      );
      
      // Format dates for JSON
      const transactions = result.rows.map(row => ({
        ...row,
        date: new Date(row.transaction_date).toISOString().split('T')[0] // YYYY-MM-DD
      }));

      return res.status(200).json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } 
  
  else if (req.method === 'POST') {
    const { transaction_ids } = req.body;

    if (!transaction_ids || !Array.isArray(transaction_ids) || transaction_ids.length === 0) {
      return res.status(400).json({ error: 'transaction_ids array is required' });
    }

    try {
      await db.query(
        `UPDATE transactions SET status = 'synced' WHERE id = ANY($1)`,
        [transaction_ids]
      );
      
      return res.status(200).json({ message: 'Transactions synced successfully' });
    } catch (error) {
      console.error('Error syncing transactions:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

