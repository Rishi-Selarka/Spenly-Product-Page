import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import Twilio from 'twilio';

// Inline database connection
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

// Send WhatsApp message via Twilio
async function sendWhatsAppMessage(to: string, body: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !from) {
    console.error('Twilio credentials not configured');
    return;
  }

  const client = Twilio(accountSid, authToken);
  const toAddr = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  const fromAddr = from.startsWith('whatsapp:') ? from : `whatsapp:${from}`;

  try {
    await client.messages.create({ body, from: fromAddr, to: toAddr });
  } catch (error) {
    console.error('Error sending WhatsApp:', error);
  }
}

// Parse transaction from text
function parseTransaction(text: string) {
  const result = { amount: 0, vendor: 'Expense', note: text || 'Expense' };
  
  const match = text.match(/\$?(\d+(?:\.\d{1,2})?)/);
  if (match) {
    result.amount = parseFloat(match[1]);
    result.vendor = text.replace(match[0], '').trim() || 'Expense';
    result.note = result.vendor;
  }
  
  return result;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  try {
    const params = req.body || {};
    const From = params.From || '';
    const Body = params.Body || '';
    const NumMedia = params.NumMedia || '0';
    const MediaUrl0 = params.MediaUrl0 || '';
    
    const messageType = (NumMedia && parseInt(NumMedia) > 0) ? 'image' : 'text';
    const mediaUrl = messageType === 'image' ? MediaUrl0 : null;

    console.log(`Message from ${From}: ${Body}`);

    const db = getDB();
    const lowerBody = Body.trim().toLowerCase();

    // Handle linking
    if (lowerBody.startsWith('link_')) {
      const token = lowerBody.replace('link_', '');
      
      const tokenResult = await db.query(
        `SELECT apple_user_id, expires_at, used_at FROM link_tokens WHERE token = $1`,
        [token]
      );

      if (tokenResult.rows.length === 0) {
        await sendWhatsAppMessage(From, "❌ Invalid linking code.");
      } else {
        const { apple_user_id, expires_at, used_at } = tokenResult.rows[0];
        
        if (used_at || new Date() > new Date(expires_at)) {
          await sendWhatsAppMessage(From, "❌ Code expired or already used.");
        } else {
          await db.query(`UPDATE link_tokens SET used_at = NOW() WHERE token = $1`, [token]);
          await db.query(
            `INSERT INTO users (apple_user_id, whatsapp_number, linked_at) VALUES ($1, $2, NOW())
             ON CONFLICT (apple_user_id) DO UPDATE SET whatsapp_number = $2, linked_at = NOW()`,
            [apple_user_id, From]
          );
          await sendWhatsAppMessage(From, "✅ Account linked! Send expenses like 'Coffee $5'");
        }
      }
    } else {
      // Check if user is linked
      const userResult = await db.query(
        `SELECT apple_user_id FROM users WHERE whatsapp_number = $1`,
        [From]
      );

      if (userResult.rows.length === 0) {
        await sendWhatsAppMessage(From, "Please link your account first via Spenly app → Settings → Connect WhatsApp Bot");
      } else {
        const appleUserID = userResult.rows[0].apple_user_id;
        const parsed = parseTransaction(Body);
        
        await db.query(
          `INSERT INTO transactions (apple_user_id, amount, transaction_date, vendor, category, note, message_type, media_url, status)
           VALUES ($1, $2, NOW(), $3, 'Uncategorized', $4, $5, $6, 'pending_sync')`,
          [appleUserID, parsed.amount, parsed.vendor, parsed.note, messageType, mediaUrl]
        );
        
        const amountStr = parsed.amount > 0 ? ` $${parsed.amount.toFixed(2)}` : '';
        await sendWhatsAppMessage(From, `✅ Added: ${parsed.vendor}${amountStr}`);
      }
    }

    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send('<Response></Response>');

  } catch (error: any) {
    console.error('Webhook error:', error);
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send('<Response></Response>');
  }
}
