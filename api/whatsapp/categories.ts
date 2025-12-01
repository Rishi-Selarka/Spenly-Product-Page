import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../lib/db';

// Database migration: ensure categories table exists
async function runMigrations() {
  try {
    // Create categories table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_categories (
        id SERIAL PRIMARY KEY,
        apple_user_id VARCHAR(255) NOT NULL,
        category_name VARCHAR(255) NOT NULL,
        category_type VARCHAR(50) NOT NULL,
        is_custom BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(apple_user_id, category_name, category_type)
      )
    `);
    
    // Create index for faster lookups
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_user_categories_apple_user_id 
      ON user_categories(apple_user_id)
    `);
  } catch (error) {
    console.error('Migration error:', error);
    // Don't throw - migrations should be idempotent
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Run migrations on every request to ensure schema is up-to-date
  await runMigrations();

  if (req.method === 'POST') {
    const { apple_user_id, categories } = req.body;

    if (!apple_user_id) {
      return res.status(400).json({ error: 'apple_user_id is required' });
    }

    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({ error: 'categories array is required' });
    }

    try {
      // Delete existing categories for this user
      await db.query(
        `DELETE FROM user_categories WHERE apple_user_id = $1`,
        [apple_user_id]
      );

      // Insert new categories
      for (const category of categories) {
        await db.query(
          `INSERT INTO user_categories (apple_user_id, category_name, category_type, is_custom)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (apple_user_id, category_name, category_type) DO NOTHING`,
          [
            apple_user_id,
            category.name,
            category.type,
            category.isCustom || false
          ]
        );
      }

      return res.status(200).json({ success: true, message: 'Categories synced' });
    } catch (error) {
      console.error('Sync categories error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'GET') {
    const { apple_user_id } = req.query;

    if (!apple_user_id) {
      return res.status(400).json({ error: 'apple_user_id is required' });
    }

    try {
      const result = await db.query(
        `SELECT category_name, category_type, is_custom 
         FROM user_categories 
         WHERE apple_user_id = $1
         ORDER BY is_custom ASC, category_name ASC`,
        [apple_user_id]
      );

      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('Get categories error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

