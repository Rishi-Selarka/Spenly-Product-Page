import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import Twilio from 'twilio';

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

async function sendWhatsAppMessage(to: string, body: string, interactive?: any): Promise<void> {
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
    const messageParams: any = {
      body: body,
      from: fromAddr,
      to: toAddr
    };

    // Add interactive buttons if provided
    if (interactive) {
      messageParams.contentSid = interactive.contentSid;
      messageParams.contentVariables = JSON.stringify(interactive.contentVariables || {});
    }

    const message = await client.messages.create(messageParams);
    console.log(`✅ Message sent to ${to}: ${message.sid}`);
  } catch (error) {
    console.error('❌ Error sending WhatsApp:', error);
    // Fallback to plain text if interactive fails
    try {
      await client.messages.create({ body, from: fromAddr, to: toAddr });
    } catch (fallbackError) {
      console.error('❌ Fallback send also failed:', fallbackError);
    }
  }
}

// Send interactive message with buttons (using Twilio Content API or fallback)
async function sendInteractiveMenu(to: string, welcomeText: string): Promise<void> {
  // For now, send formatted text with clear options
  // Twilio WhatsApp buttons require Content API setup, so we'll use formatted text
  const menuText = `${welcomeText}

Choose an option by typing the number or tapping below:

*1️⃣ Add Transaction*
Send expenses like "Pizza $15" or receipt photos

*2️⃣ Get Info*
Ask about spending, balance, or app features

*3️⃣ Exit*
End conversation

Type *1*, *2*, or *3* to continue.`;

  await sendWhatsAppMessage(to, menuText);
}

// Welcome message after linking
function getWelcomeMessage(): string {
  return `Hello! 👋

I am Spenly AI, your financial assistant.

I can help you track expenses, manage your budget, and answer questions about your finances!

Type your queries or choose one of the options below for me to assist you.`;
}

// Parse transaction using Gemini AI
async function parseTransactionWithAI(text: string, mediaUrl?: string): Promise<{
  amount: number;
  vendor: string;
  note: string;
  category: string;
  date: string;
} | null> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey || geminiApiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.log('⚠️ Gemini API key not set, using fallback parsing');
    return parseTransactionFallback(text);
  }

  try {
    const prompt = `You are Spenly AI, a financial assistant. Extract transaction details from: "${text}"

Return ONLY valid JSON (no markdown, no code blocks):
{
  "amount": <number>,
  "vendor": "<string>",
  "note": "<string>",
  "category": "<Food & Dining|Shopping|Transportation|Entertainment|Healthcare|Bills|Income|Other>",
  "date": "<YYYY-MM-DD>"
}

CATEGORY RULES:
- Food & Dining: food, restaurant, pizza, coffee, lunch, dinner, cafe, grocery
- Shopping: store, purchase, amazon, clothes, retail
- Transportation: uber, taxi, gas, fuel, parking, bus, train
- Entertainment: movie, concert, game, streaming, netflix
- Healthcare: doctor, medicine, pharmacy, hospital
- Bills: electricity, water, internet, phone, utility
- Income: salary, freelance, payment received
- Other: everything else

Extract from: "${text}"`;

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`;
    
    const body = {
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 200
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    let jsonText = aiText.trim();
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      if (parsed.amount !== undefined) {
        return {
          amount: parseFloat(parsed.amount) || 0,
          vendor: parsed.vendor || 'Expense',
          note: parsed.note || parsed.vendor || 'Expense',
          category: parsed.category || 'Other',
          date: parsed.date || new Date().toISOString().split('T')[0]
        };
      }
    }
    
    console.log('⚠️ Could not parse Gemini response:', aiText);
  } catch (error) {
    console.error('Gemini parsing error:', error);
  }

  return parseTransactionFallback(text);
}

// Fallback simple parsing
function parseTransactionFallback(text: string): {
  amount: number;
  vendor: string;
  note: string;
  category: string;
  date: string;
} {
  const result = {
    amount: 0,
    vendor: 'Expense',
    note: text || 'Expense',
    category: 'Other',
    date: new Date().toISOString().split('T')[0]
  };
  
  const match = text.match(/\$?(\d+(?:\.\d{1,2})?)/);
  if (match) {
    result.amount = parseFloat(match[1]);
    result.vendor = text.replace(match[0], '').trim() || 'Expense';
    result.note = result.vendor;
    
    const lower = result.vendor.toLowerCase();
    if (lower.includes('pizza') || lower.includes('food') || lower.includes('restaurant') || 
        lower.includes('coffee') || lower.includes('lunch') || lower.includes('dinner') ||
        lower.includes('cafe') || lower.includes('grocery') || lower.includes('meal')) {
      result.category = 'Food & Dining';
    } else if (lower.includes('uber') || lower.includes('taxi') || lower.includes('gas') || 
               lower.includes('fuel') || lower.includes('parking') || lower.includes('transport')) {
      result.category = 'Transportation';
    } else if (lower.includes('movie') || lower.includes('concert') || lower.includes('entertainment') ||
               lower.includes('netflix') || lower.includes('streaming')) {
      result.category = 'Entertainment';
    } else if (lower.includes('doctor') || lower.includes('medicine') || lower.includes('pharmacy') ||
               lower.includes('hospital') || lower.includes('health')) {
      result.category = 'Healthcare';
    } else if (lower.includes('electricity') || lower.includes('water') || lower.includes('internet') ||
               lower.includes('phone') || lower.includes('bill') || lower.includes('utility')) {
      result.category = 'Bills';
    } else if (lower.includes('salary') || lower.includes('income') || lower.includes('freelance') ||
               lower.includes('payment')) {
      result.category = 'Income';
    } else if (lower.includes('store') || lower.includes('shopping') || lower.includes('amazon') ||
               lower.includes('purchase')) {
      result.category = 'Shopping';
    }
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

    console.log(`📨 Webhook from ${From}: "${Body}" (type: ${messageType})`);

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
          
          // Send welcome message with menu
          await sendInteractiveMenu(From, getWelcomeMessage());
        }
      }
    } else {
      // Check if user is linked
      const userResult = await db.query(
        `SELECT apple_user_id FROM users WHERE whatsapp_number = $1`,
        [From]
      );

      if (userResult.rows.length === 0) {
        await sendWhatsAppMessage(From, 
          "👋 Welcome! Please link your account first.\n\nGo to Spenly app → Settings → Connect WhatsApp Bot to get your linking code."
        );
      } else {
        const appleUserID = userResult.rows[0].apple_user_id;
        
        // Handle menu options
        if (lowerBody === 'exit' || lowerBody === '3' || lowerBody === 'exit conversation') {
          await sendWhatsAppMessage(From, "👋 Goodbye! Message me anytime to track expenses.");
        } else if (lowerBody === '1' || lowerBody === 'add transaction' || lowerBody === 'add expense') {
          await sendWhatsAppMessage(From, 
            "💳 *Add Transaction*\n\nSend me an expense like:\n• Pizza $15\n• Coffee $5\n• Lunch $20\n\nOr send a photo of your receipt!"
          );
        } else if (lowerBody === '2' || lowerBody === 'get info' || lowerBody === 'info') {
          await sendWhatsAppMessage(From,
            "ℹ️ *Get Info*\n\nI can help you with:\n• Spending summaries\n• Balance inquiries\n• App features\n• Budget questions\n\nWhat would you like to know?"
          );
        } else if (lowerBody === 'help' || lowerBody === 'hi' || lowerBody === 'hello' || lowerBody === 'menu') {
          await sendInteractiveMenu(From, getWelcomeMessage());
        } else {
          // Try to parse as transaction
          const parsed = await parseTransactionWithAI(Body, mediaUrl);
          
          if (parsed && parsed.amount > 0) {
            await db.query(
              `INSERT INTO transactions (apple_user_id, amount, transaction_date, vendor, category, note, message_type, media_url, status)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending_sync')`,
              [appleUserID, parsed.amount, parsed.date, parsed.vendor, parsed.category, parsed.note, messageType, mediaUrl]
            );
            
            await sendWhatsAppMessage(From,
              `✅ *Transaction Added*\n\n💰 Amount: $${parsed.amount.toFixed(2)}\n📝 Note: ${parsed.note}\n📂 Category: ${parsed.category}\n📅 Date: ${parsed.date}\n\n${getWelcomeMessage()}`
            );
            
            // Show menu again
            await sendInteractiveMenu(From, '');
          } else if (messageType === 'image') {
            await db.query(
              `INSERT INTO transactions (apple_user_id, amount, transaction_date, vendor, category, note, message_type, media_url, status)
               VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6, $7, 'pending_sync')`,
              [appleUserID, 0, 'Receipt', 'Other', 'Receipt Image', messageType, mediaUrl]
            );
            
            await sendWhatsAppMessage(From,
              `✅ Receipt received! I'll process it shortly.`
            );
            
            await sendInteractiveMenu(From, '');
          } else {
            // Not a transaction, show menu
            await sendInteractiveMenu(From, getWelcomeMessage());
          }
        }
      }
    }

    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send('<Response></Response>');

  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send('<Response></Response>');
  }
}
