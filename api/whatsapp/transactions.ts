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
    // Try to create schema, but don't fail if it errors
    try {
      await createSchema();
    } catch (schemaError) {
      console.log('Schema already exists or creation skipped:', schemaError);
    }
    
    const db = getDB();

    if (req.method === 'GET') {
      const apple_user_id = req.query.apple_user_id as string;
      
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
        
        const transactions = result.rows.map(row => ({
          ...row,
          date: row.transaction_date ? new Date(row.transaction_date).toISOString().split('T')[0] : null
        }));

        return res.status(200).json(transactions);
      } catch (queryError: any) {
        // If table doesn't exist, return empty array (not an error for the client)
        if (queryError.code === '42P01') { // undefined_table
          console.log('Transactions table does not exist yet, returning empty array');
          return res.status(200).json([]);
        }
        throw queryError;
      }
    } 
    
    else if (req.method === 'POST') {
      const { transaction_ids } = req.body || {};

      if (!transaction_ids || !Array.isArray(transaction_ids) || transaction_ids.length === 0) {
        return res.status(400).json({ error: 'transaction_ids array is required' });
      }

      try {
        await db.query(
          `UPDATE transactions SET status = 'synced' WHERE id = ANY($1::int[])`,
          [transaction_ids]
        );
      } catch (updateError: any) {
        // If table doesn't exist, just return success (nothing to update)
        if (updateError.code === '42P01') {
          console.log('Transactions table does not exist yet');
          return res.status(200).json({ message: 'No transactions to sync' });
        }
        throw updateError;
      }
      
      return res.status(200).json({ message: 'Transactions synced successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error: any) {
    console.error('Error in transactions:', error);
    
    // Check for database connection errors
    if (error.message?.includes('POSTGRES_URL')) {
      return res.status(500).json({ 
        error: 'Database not configured',
        details: 'POSTGRES_URL environment variable is not set'
      });
    }
    
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message || 'Unknown error'
    });
  }
}
