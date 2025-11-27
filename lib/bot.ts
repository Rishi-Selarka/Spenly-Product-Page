import { getDB, createSchema } from './db.js';
import { sendWhatsAppMessage } from './twilio.js';
import { parseTransactionFromText, ParsedTransaction } from './parser.js';

// Initialize schema on first run (lazy init)
let schemaInitialized = false;

async function ensureSchema() {
  if (!schemaInitialized) {
    await createSchema();
    schemaInitialized = true;
  }
}

export async function handleWhatsAppMessage(from: string, body: string, mediaUrl: string | undefined, messageType: string) {
  await ensureSchema();
  
  const lowerBody = body.trim().toLowerCase();

  // 1. Check if it's a linking attempt
  if (lowerBody.startsWith('link_')) {
    const token = lowerBody.replace('link_', '').trim();
    return await handleLinkToken(from, token);
  }

  // 2. Check if user is linked
  const appleUserID = await getAppleUserIDByWhatsAppNumber(from);
  if (!appleUserID) {
    return await sendWhatsAppMessage(from, 
      "Welcome to Spenly AI! 🤖\n\nTo get started, please link your account.\n\nGo to Spenly app -> Settings -> Connect WhatsApp Bot to get your unique linking code."
    );
  }

  // 3. Handle Transaction or Help
  if (lowerBody === 'help' || lowerBody === 'hi' || lowerBody === 'hello') {
    return await sendWhatsAppMessage(from,
      "👋 I'm Spenly AI. Here's how I can help:\n\n" +
      "1. **Track Expense**: Send 'Coffee $5' or 'Lunch 15.50'\n" +
      "2. **Save Receipt**: Send a photo of your receipt\n" +
      "3. **Status**: Ask 'status' to see pending items\n\n" +
      "Everything you send syncs to your Spenly app!"
    );
  }

  return await handleTransactionMessage(from, appleUserID, body, mediaUrl, messageType);
}

async function handleLinkToken(whatsappNumber: string, token: string) {
  const db = getDB();
  
  try {
    // Verify token
    const res = await db.query(
      `SELECT apple_user_id, expires_at, used_at FROM link_tokens WHERE token = $1`,
      [token]
    );

    if (res.rows.length === 0) {
      return await sendWhatsAppMessage(whatsappNumber, "❌ Invalid linking code. Please generate a new one from the Spenly app.");
    }

    const { apple_user_id, expires_at, used_at } = res.rows[0];

    if (used_at) {
      return await sendWhatsAppMessage(whatsappNumber, "❌ This linking code has already been used.");
    }

    if (new Date() > new Date(expires_at)) {
      return await sendWhatsAppMessage(whatsappNumber, "❌ This linking code has expired.");
    }

    // Mark used
    await db.query(`UPDATE link_tokens SET used_at = NOW() WHERE token = $1`, [token]);

    // Link user
    // Remove 'whatsapp:' prefix for storage if present, to be clean, but Twilio sends it with prefix usually.
    // We will store exactly what Twilio sends to match easily.
    await db.query(
      `INSERT INTO users (apple_user_id, whatsapp_number, linked_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (apple_user_id) DO UPDATE SET whatsapp_number = $2, linked_at = NOW()`,
      [apple_user_id, whatsappNumber]
    );

    return await sendWhatsAppMessage(whatsappNumber, 
      "✅ Account linked successfully!\n\nI'm ready to track your expenses. Try sending:\n• 'Lunch $15'\n• 'Coffee $4.50'\n• Or a photo of a receipt!"
    );

  } catch (error) {
    console.error('Error linking account:', error);
    return await sendWhatsAppMessage(whatsappNumber, "❌ An error occurred. Please try again.");
  }
}

async function handleTransactionMessage(
  whatsappNumber: string, 
  appleUserID: string, 
  body: string, 
  mediaUrl: string | undefined, 
  messageType: string
) {
  let parsed: ParsedTransaction;

  if (messageType === 'image' || mediaUrl) {
    parsed = {
      amount: 0,
      date: new Date(),
      vendor: "Receipt",
      note: "Receipt Image",
      isImage: true
    };
    messageType = 'image'; // Ensure type is set
  } else {
    parsed = parseTransactionFromText(body);
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
      return await sendWhatsAppMessage(whatsappNumber, "✅ Receipt received! I've saved it for you to review in Spenly.");
    } else {
      return await sendWhatsAppMessage(whatsappNumber, `✅ Added: ${parsed.vendor} ${parsed.amount > 0 ? '$' + parsed.amount : ''}`);
    }

  } catch (error) {
    console.error('Error saving transaction:', error);
    return await sendWhatsAppMessage(whatsappNumber, "❌ Could not save transaction. Please try again.");
  }
}

async function getAppleUserIDByWhatsAppNumber(whatsappNumber: string): Promise<string | null> {
  const db = getDB();
  const res = await db.query(
    `SELECT apple_user_id FROM users WHERE whatsapp_number = $1`,
    [whatsappNumber]
  );
  return res.rows.length > 0 ? res.rows[0].apple_user_id : null;
}

