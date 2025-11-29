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

async function ensureSchema(): Promise<void> {
  const db = getDB();
  try {
    // Add currency columns if they don't exist (migration)
    await db.query(`
      ALTER TABLE link_tokens 
      ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD'
    `).catch(() => {}); // Ignore if column already exists or table doesn't exist
    
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD'
    `).catch(() => {});
    
    await db.query(`
      ALTER TABLE transactions 
      ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD'
    `).catch(() => {});
  } catch (error) {
    // Schema migration errors are non-critical, just log
    console.log('Schema migration note:', error);
  }
}

async function sendWhatsAppMessage(to: string, body: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !from) {
    console.error('❌ Twilio credentials missing:', {
      hasAccountSid: !!accountSid,
      hasAuthToken: !!authToken,
      hasFrom: !!from
    });
    throw new Error('Twilio credentials not configured');
  }

  const client = Twilio(accountSid, authToken);
  const toAddr = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  const fromAddr = from.startsWith('whatsapp:') ? from : `whatsapp:${from}`;

  console.log(`📤 Sending message to ${toAddr} from ${fromAddr}`);
  
  try {
    const message = await client.messages.create({ body, from: fromAddr, to: toAddr });
    console.log(`✅ Message sent successfully: ${message.sid}`);
  } catch (error: any) {
    console.error('❌ Error sending WhatsApp:', error.message);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
}

function getWelcomeMessage(): string {
  return `Hello! 👋

I am Spenly AI, your financial assistant.

I can help you track expenses, manage your budget, and answer questions about your finances!

Type your queries or choose one of the options below for me to assist you.`;
}

async function sendInteractiveMenu(to: string, welcomeText?: string): Promise<void> {
  const menuText = welcomeText 
    ? `${welcomeText}\n\nChoose an option by typing the number:\n\n*1️⃣ Add Transaction*\nSend expenses like "Pizza $15" or receipt photos\n\n*2️⃣ Get Info*\nAsk about spending, balance, or app features\n\n*3️⃣ Exit*\nEnd conversation`
    : `Choose an option:\n\n*1️⃣ Add Transaction*\n*2️⃣ Get Info*\n*3️⃣ Exit*`;

  await sendWhatsAppMessage(to, menuText);
}

async function getUserTransactions(appleUserID: string, limit: number = 1000): Promise<any[]> {
  try {
    const db = getDB();
    const result = await db.query(
      `SELECT amount, transaction_date, vendor, category, note, message_type, created_at
       FROM transactions 
       WHERE apple_user_id = $1 
       ORDER BY transaction_date DESC, created_at DESC 
       LIMIT $2`,
      [appleUserID, limit]
    );
    return result.rows || [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

async function answerQuestionWithAI(question: string, transactions: any[]): Promise<string> {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  if (!openRouterApiKey || openRouterApiKey === 'YOUR_OPENROUTER_API_KEY_HERE') {
    return "I need OpenRouter API key configured to answer questions. Please set OPENROUTER_API_KEY in Vercel environment variables.";
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const allExpenses = transactions.filter(t => parseFloat(t.amount || '0') > 0);
    const todayExpenses = allExpenses.filter(t => t.transaction_date === today);
    const yesterdayExpenses = allExpenses.filter(t => t.transaction_date === yesterday);
    
    const todayTotal = todayExpenses.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
    const yesterdayTotal = yesterdayExpenses.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthExpenses = allExpenses.filter(t => t.transaction_date?.startsWith(currentMonth));
    const monthTotal = monthExpenses.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
    
    const categoryTotals: { [key: string]: number } = {};
    allExpenses.forEach(t => {
      const cat = t.category || 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(t.amount || '0');
    });
    
    const categoryBreakdown = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, total]) => `- ${cat}: $${total.toFixed(2)}`)
      .join('\n');

    const transactionContext = transactions.slice(0, 20).map(t => 
      `Date: ${t.transaction_date}, Amount: $${parseFloat(t.amount || '0').toFixed(2)}, Category: ${t.category || 'Other'}, Note: ${t.note || t.vendor || 'N/A'}`
    ).join('\n');

    const prompt = `You are Spenly AI, a financial assistant. Answer the user's question based on their transaction data.

USER'S QUESTION: "${question}"

TRANSACTION SUMMARY:
- Total transactions: ${transactions.length}
- Today's expenses: $${todayTotal.toFixed(2)} (${todayExpenses.length} transactions)
- Yesterday's expenses: $${yesterdayTotal.toFixed(2)} (${yesterdayExpenses.length} transactions)
- This month's expenses: $${monthTotal.toFixed(2)} (${monthExpenses.length} transactions)

TOP CATEGORIES:
${categoryBreakdown || 'No category data'}

RECENT TRANSACTIONS (last 20):
${transactionContext || 'No transactions found'}

INSTRUCTIONS:
- Answer the question directly and concisely
- Use actual numbers from the data above
- Be friendly and helpful
- Use emojis appropriately (💰📊✅)
- If asking about "yesterday", use yesterday's date: ${yesterday}
- If asking about "today", use today's date: ${today}
- If no data exists, say so clearly
- Keep response under 300 words
- Don't show menu unless user asks for it

Answer the question: "${question}"`;

    const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free';
    const url = 'https://openrouter.ai/api/v1/chat/completions';
    
    const body = {
      model: model,
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: 0.3,
      max_tokens: 500
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterApiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API error: ${response.status} - ${errorText}`);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const aiText = data.choices?.[0]?.message?.content || '';
    
    return aiText.trim() || "I couldn't process that question. Please try rephrasing it.";
  } catch (error: any) {
    console.error('Error answering question:', error);
    return "Sorry, I encountered an error processing your question. Please try again.";
  }
}

function isInfoQuery(text: string): boolean {
  const lower = text.toLowerCase().trim();
  
  if (lower === '1' || lower === '2' || lower === '3' || 
      lower === 'exit' || lower === 'help' || lower === 'hi' || lower === 'hello' || lower === 'menu') {
    return false;
  }
  
  const questionPatterns = [
    /how much/i,
    /how many/i,
    /what/i,
    /when/i,
    /where/i,
    /why/i,
    /tell me/i,
    /show me/i,
    /spent/i,
    /spending/i,
    /balance/i,
    /total/i,
    /summary/i,
    /expense/i,
    /income/i,
    /category/i,
    /budget/i,
    /yesterday/i,
    /today/i,
    /week/i,
    /month/i,
    /year/i,
    /\?\s*$/  // Ends with question mark (escaped ?)
  ];
  
  return questionPatterns.some(pattern => pattern.test(lower));
}

async function parseTransactionWithAI(text: string, mediaUrl?: string, userCurrency: string = 'USD'): Promise<{
  amount: number;
  vendor: string;
  note: string;
  category: string;
  date: string;
  currency: string;
} | null> {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  if (!openRouterApiKey || openRouterApiKey === 'YOUR_OPENROUTER_API_KEY_HERE') {
    return parseTransactionFallback(text, userCurrency);
  }

  try {
    // Detect currency from message
    const hasDollar = /\$/.test(text);
    const detectedCurrency = hasDollar ? 'USD' : userCurrency;
    
    const prompt = `You are Spenly AI. Extract transaction details from: "${text}"

Return ONLY valid JSON:
{
  "amount": <number>,
  "vendor": "<string>",
  "note": "<string>",
  "category": "<Food & Dining|Shopping|Transportation|Entertainment|Healthcare|Bills|Income|Other>",
  "date": "<YYYY-MM-DD>"
}

IMPORTANT: Extract the numeric amount only. If the message contains "$" or "dollar", the currency is USD. Otherwise, assume the amount is in the user's local currency (${userCurrency}).

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

    const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free';
    const url = 'https://openrouter.ai/api/v1/chat/completions';
    
    const body = {
      model: model,
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: 0.1,
      max_tokens: 200
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterApiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const aiText = data.choices?.[0]?.message?.content || '';
    
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
          date: parsed.date || new Date().toISOString().split('T')[0],
          currency: detectedCurrency
        };
      }
    }
  } catch (error) {
    console.error('OpenRouter parsing error:', error);
  }

  return parseTransactionFallback(text, userCurrency);
}

function parseTransactionFallback(text: string, userCurrency: string = 'USD'): {
  amount: number;
  vendor: string;
  note: string;
  category: string;
  date: string;
  currency: string;
} {
  const hasDollar = /\$/.test(text);
  const detectedCurrency = hasDollar ? 'USD' : userCurrency;
  
  const result = {
    amount: 0,
    vendor: 'Expense',
    note: text || 'Expense',
    category: 'Other',
    date: new Date().toISOString().split('T')[0],
    currency: detectedCurrency
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
  // Always return TwiML response
  const sendResponse = () => {
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send('<Response></Response>');
  };

  // Ensure schema is up to date
  await ensureSchema();

  console.log('🚀 Webhook called at:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Body type:', typeof req.body);
  console.log('Body keys:', req.body ? Object.keys(req.body) : 'no body');
  console.log('Full body:', JSON.stringify(req.body, null, 2));

  if (req.method !== 'POST') {
    console.log('❌ Invalid method:', req.method);
    return res.status(405).send('Method not allowed');
  }

  try {
    // Twilio sends form-urlencoded data
    // Vercel automatically parses it, but let's handle both cases
    let params: any = {};
    
    if (typeof req.body === 'string') {
      // Manual parsing if needed
      const urlParams = new URLSearchParams(req.body);
      params = Object.fromEntries(urlParams);
      console.log('📝 Parsed from string:', params);
    } else if (req.body && typeof req.body === 'object') {
      params = req.body;
      console.log('📦 Using object body:', params);
    } else {
      console.error('❌ Unexpected body type:', typeof req.body);
      return sendResponse();
    }
    
    const From = params.From || '';
    const Body = (params.Body || '').trim();
    const NumMedia = params.NumMedia || '0';
    const MediaUrl0 = params.MediaUrl0 || '';
    
    console.log('📨 Extracted params:', { From, Body, NumMedia, MediaUrl0 });
    
    if (!From) {
      console.error('❌ Missing From field. Available params:', Object.keys(params));
      return sendResponse();
    }
    
    const messageType = (NumMedia && parseInt(NumMedia) > 0) ? 'image' : 'text';
    const mediaUrl = messageType === 'image' ? MediaUrl0 : null;

    const db = getDB();
    const lowerBody = Body.toLowerCase();

    // Handle linking
    if (lowerBody.startsWith('link_')) {
      const token = lowerBody.replace('link_', '');
      console.log(`🔗 Processing link token: ${token}`);
      
      try {
        const tokenResult = await db.query(
          `SELECT apple_user_id, expires_at, used_at FROM link_tokens WHERE token = $1`,
          [token]
        );

        if (tokenResult.rows.length === 0) {
          console.log('❌ Invalid token');
          await sendWhatsAppMessage(From, "❌ Invalid linking code.");
        } else {
          const { apple_user_id, expires_at, used_at } = tokenResult.rows[0];
          
          if (used_at || new Date() > new Date(expires_at)) {
            console.log('❌ Token expired or used');
            await sendWhatsAppMessage(From, "❌ Code expired or already used.");
          } else {
            await db.query(`UPDATE link_tokens SET used_at = NOW() WHERE token = $1`, [token]);
            
            // Get user's currency from link_tokens or default to USD
            const tokenData = await db.query(
              `SELECT currency FROM link_tokens WHERE token = $1`,
              [token]
            );
            const userCurrency = tokenData.rows[0]?.currency || 'USD';
            
            await db.query(
              `INSERT INTO users (apple_user_id, whatsapp_number, currency, linked_at) VALUES ($1, $2, $3, NOW())
               ON CONFLICT (apple_user_id) DO UPDATE SET whatsapp_number = $2, currency = $3, linked_at = NOW()`,
              [apple_user_id, From, userCurrency]
            );
            
            console.log('✅ Account linked successfully');
            await sendInteractiveMenu(From, getWelcomeMessage());
          }
        }
      } catch (error: any) {
        console.error('❌ Link error:', error);
        await sendWhatsAppMessage(From, "❌ Error processing link. Please try again.");
      }
      
      return sendResponse();
    }
    
    // Check if user is linked
    let userResult;
    try {
      userResult = await db.query(
        `SELECT apple_user_id, currency FROM users WHERE whatsapp_number = $1`,
        [From]
      );
      console.log('👤 User lookup result:', userResult.rows.length > 0 ? 'Found' : 'Not found');
    } catch (error: any) {
      console.error('❌ DB query error:', error);
      await sendWhatsAppMessage(From, "❌ Database error. Please try again later.");
      return sendResponse();
    }

    if (userResult.rows.length === 0) {
      console.log('❌ User not linked');
      await sendWhatsAppMessage(From, 
        "👋 Welcome! Please link your account first.\n\nGo to Spenly app → Settings → Connect WhatsApp Bot to get your linking code."
      );
      return sendResponse();
    }
    
    const appleUserID = userResult.rows[0].apple_user_id;
    const userCurrency = (userResult.rows[0].currency || 'USD').toUpperCase();
    console.log('✅ User linked, processing message:', Body, 'Currency:', userCurrency);
    
    // Handle menu commands
    if (lowerBody === 'exit' || lowerBody === '3' || lowerBody === 'exit conversation') {
      await sendWhatsAppMessage(From, "👋 Goodbye! Message me anytime to track expenses.");
      return sendResponse();
    }
    
    if (lowerBody === '1' || lowerBody === 'add transaction' || lowerBody === 'add expense') {
      await sendWhatsAppMessage(From, 
        "💳 *Add Transaction*\n\nSend me an expense like:\n• Pizza $15\n• Coffee $5\n• Lunch $20\n\nOr send a photo of your receipt!"
      );
      return sendResponse();
    }
    
    if (lowerBody === '2' || lowerBody === 'get info' || lowerBody === 'info') {
      await sendWhatsAppMessage(From,
        "ℹ️ *Get Info*\n\nI can help you with:\n• Spending summaries\n• Balance inquiries\n• App features\n• Budget questions\n\nWhat would you like to know?"
      );
      return sendResponse();
    }
    
    if (lowerBody === 'help' || lowerBody === 'hi' || lowerBody === 'hello' || lowerBody === 'menu') {
      console.log('📋 Showing menu for:', lowerBody);
      await sendInteractiveMenu(From, getWelcomeMessage());
      return sendResponse();
    }
    
    // Handle image
    if (messageType === 'image') {
      try {
        await db.query(
          `INSERT INTO transactions (apple_user_id, amount, transaction_date, vendor, category, note, message_type, media_url, status)
           VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6, $7, 'pending_sync')`,
          [appleUserID, 0, 'Receipt', 'Other', 'Receipt Image', messageType, mediaUrl]
        );
        
        await sendWhatsAppMessage(From, `✅ Receipt received! I'll process it shortly.`);
      } catch (error: any) {
        console.error('❌ Image save error:', error);
        await sendWhatsAppMessage(From, "❌ Error saving receipt. Please try again.");
      }
      return sendResponse();
    }
    
    // Check if it's an info query
    if (isInfoQuery(Body)) {
      console.log(`🤔 Detected info query: "${Body}"`);
      try {
        const transactions = await getUserTransactions(appleUserID);
        const answer = await answerQuestionWithAI(Body, transactions);
        await sendWhatsAppMessage(From, answer);
      } catch (error: any) {
        console.error('❌ Info query error:', error);
        await sendWhatsAppMessage(From, "Sorry, I encountered an error. Please try again.");
      }
      return sendResponse();
    }
    
    // Try to parse as transaction
    try {
      const parsed = await parseTransactionWithAI(Body, mediaUrl, userCurrency);
      
      if (parsed && parsed.amount > 0) {
        await db.query(
          `INSERT INTO transactions (apple_user_id, amount, currency, transaction_date, vendor, category, note, message_type, media_url, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending_sync')`,
          [appleUserID, parsed.amount, parsed.currency, parsed.date, parsed.vendor, parsed.category, parsed.note, messageType, mediaUrl]
        );
        
        const currencySymbol = parsed.currency === 'USD' ? '$' : (parsed.currency === 'INR' ? '₹' : parsed.currency);
        await sendWhatsAppMessage(From,
          `✅ *Transaction Added*\n\n💰 Amount: ${currencySymbol}${parsed.amount.toFixed(2)}\n📝 Note: ${parsed.note}\n📂 Category: ${parsed.category}\n📅 Date: ${parsed.date}`
        );
      } else {
        // Not a transaction, show menu
        console.log('❓ Unknown message, showing menu');
        await sendInteractiveMenu(From, "I didn't understand that. Here are your options:");
      }
    } catch (error: any) {
      console.error('❌ Transaction parse error:', error);
      await sendWhatsAppMessage(From, "Sorry, I couldn't process that. Please try again or type 'help' for options.");
    }
    
    return sendResponse();

  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    console.error('Error stack:', error.stack);
    
    // Try to send error message if we have From
    try {
      const params = req.body || {};
      const From = params.From || '';
      if (From) {
        await sendWhatsAppMessage(From, "Sorry, I encountered an error. Please try again.");
      }
    } catch (sendError) {
      console.error('Failed to send error message:', sendError);
    }
    
    return sendResponse();
  }
}
