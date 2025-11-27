import { getDB, createSchema } from './db';
import { sendWhatsAppMessage } from './twilio';
import { parseTransactionFromText, ParsedTransaction } from './parser';

export async function handleWhatsAppMessage(
  from: string, 
  body: string, 
  mediaUrl: string | undefined, 
  messageType: string
): Promise<void> {
  try {
    await createSchema();
  } catch (error) {
    console.error('Failed to create schema:', error);
    // Continue anyway - tables might already exist
  }
  
  const lowerBody = (body || '').trim().toLowerCase();

  // 1. Check if it's a linking attempt
  if (lowerBody.startsWith('link_')) {
    const token = lowerBody.replace('link_', '').trim();
    await handleLinkToken(from, token);
    return;
  }

  // 2. Check if user is linked
  const appleUserID = await getAppleUserIDByWhatsAppNumber(from);
  if (!appleUserID) {
    await sendWhatsAppMessage(from, 
      "Welcome to Spenly AI! 🤖\n\nTo get started, please link your account.\n\nGo to Spenly app -> Settings -> Connect WhatsApp Bot to get your unique linking code."
    );
    return;
  }

  // 3. Handle Transaction or Help
  if (lowerBody === 'help' || lowerBody === 'hi' || lowerBody === 'hello') {
    await sendWhatsAppMessage(from,
      "👋 I'm Spenly AI. Here's how I can help:\n\n" +
      "1. **Track Expense**: Send 'Coffee $5' or 'Lunch 15.50'\n" +
      "2. **Save Receipt**: Send a photo of your receipt\n" +
      "3. **Status**: Ask 'status' to see pending items\n\n" +
      "Everything you send syncs to your Spenly app!"
    );
    return;
  }

  await handleTransactionMessage(from, appleUserID, body, mediaUrl, messageType);
}

async function handleLinkToken(whatsappNumber: string, token: string): Promise<void> {
  const db = getDB();
  
  try {
    const result = await db.query(
      `SELECT apple_user_id, expires_at, used_at FROM link_tokens WHERE token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      await sendWhatsAppMessage(whatsappNumber, "❌ Invalid linking code. Please generate a new one from the Spenly app.");
      return;
    }

    const { apple_user_id, expires_at, used_at } = result.rows[0];

    if (used_at) {
      await sendWhatsAppMessage(whatsappNumber, "❌ This linking code has already been used.");
      return;
    }

    if (new Date() > new Date(expires_at)) {
      await sendWhatsAppMessage(whatsappNumber, "❌ This linking code has expired.");
      return;
    }

    // Mark used
    await db.query(`UPDATE link_tokens SET used_at = NOW() WHERE token = $1`, [token]);

    // Link user
    await db.query(
      `INSERT INTO users (apple_user_id, whatsapp_number, linked_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (apple_user_id) DO UPDATE SET whatsapp_number = $2, linked_at = NOW()`,
      [apple_user_id, whatsappNumber]
    );

    await sendWhatsAppMessage(whatsappNumber, 
      "✅ Account linked successfully!\n\nI'm ready to track your expenses. Try sending:\n• 'Lunch $15'\n• 'Coffee $4.50'\n• Or a photo of a receipt!"
    );

  } catch (error) {
    console.error('Error linking account:', error);
    await sendWhatsAppMessage(whatsappNumber, "❌ An error occurred. Please try again.");
  }
}

async function handleTransactionMessage(
  whatsappNumber: string, 
  appleUserID: string, 
  body: string, 
  mediaUrl: string | undefined, 
  messageType: string
): Promise<void> {
  let parsed: ParsedTransaction;

  if (messageType === 'image' || mediaUrl) {
    parsed = {
      amount: 0,
      date: new Date(),
      vendor: "Receipt",
      note: "Receipt Image",
      isImage: true
    };
    messageType = 'image';
  } else {
    parsed = parseTransactionFromText(body || '');
    messageType = 'text';
  }

  const db = getDB();

  try {
    await db.query(
      `INSERT INTO transactions 
       (apple_user_id, amount, transaction_date, vendor, category, note, message_type, media_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending_sync')`,
      [
        appleUserID,
        parsed.amount,
        parsed.date,
        parsed.vendor,
        "Uncategorized",
        parsed.note,
        messageType,
        mediaUrl || null
      ]
    );

    if (parsed.isImage) {
      await sendWhatsAppMessage(whatsappNumber, "✅ Receipt received! I've saved it for you to review in Spenly.");
    } else {
      const amountStr = parsed.amount > 0 ? ` $${parsed.amount.toFixed(2)}` : '';
      await sendWhatsAppMessage(whatsappNumber, `✅ Added: ${parsed.vendor}${amountStr}`);
    }

  } catch (error) {
    console.error('Error saving transaction:', error);
    await sendWhatsAppMessage(whatsappNumber, "❌ Could not save transaction. Please try again.");
  }
}

async function getAppleUserIDByWhatsAppNumber(whatsappNumber: string): Promise<string | null> {
  const db = getDB();
  try {
    const result = await db.query(
      `SELECT apple_user_id FROM users WHERE whatsapp_number = $1`,
      [whatsappNumber]
    );
    return result.rows.length > 0 ? result.rows[0].apple_user_id : null;
  } catch (error) {
    console.error('Error querying user:', error);
    return null;
  }
}
