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
    const message = await client.messages.create({ body, from: fromAddr, to: toAddr });
    console.log(`✅ Message sent to ${to}: ${message.sid}`);
  } catch (error) {
    console.error('❌ Error sending WhatsApp:', error);
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

// Fetch user's transactions from database
async function getUserTransactions(appleUserID: string, limit: number = 1000): Promise<any[]> {
  const db = getDB();
  const result = await db.query(
    `SELECT amount, transaction_date, vendor, category, note, message_type, created_at
     FROM transactions 
     WHERE apple_user_id = $1 
     ORDER BY transaction_date DESC, created_at DESC 
     LIMIT $2`,
    [appleUserID, limit]
  );
  return result.rows;
}

// Answer questions using Gemini AI with transaction data
async function answerQuestionWithAI(question: string, transactions: any[]): Promise<string> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey || geminiApiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return "I need Gemini API key configured to answer questions. Please set GEMINI_API_KEY in Vercel environment variables.";
  }

  try {
    // Format transactions for context
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Calculate summary stats
    const allExpenses = transactions.filter(t => parseFloat(t.amount) > 0);
    const todayExpenses = allExpenses.filter(t => t.transaction_date === today);
    const yesterdayExpenses = allExpenses.filter(t => t.transaction_date === yesterday);
    
    const todayTotal = todayExpenses.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const yesterdayTotal = yesterdayExpenses.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    // Get this month's transactions
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const monthExpenses = allExpenses.filter(t => t.transaction_date?.startsWith(currentMonth));
    const monthTotal = monthExpenses.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    // Category breakdown
    const categoryTotals: { [key: string]: number } = {};
    allExpenses.forEach(t => {
      const cat = t.category || 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(t.amount);
    });
    
    const categoryBreakdown = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, total]) => `- ${cat}: $${total.toFixed(2)}`)
      .join('\n');

    const transactionContext = transactions.slice(0, 20).map(t => 
      `Date: ${t.transaction_date}, Amount: $${parseFloat(t.amount).toFixed(2)}, Category: ${t.category || 'Other'}, Note: ${t.note || t.vendor || 'N/A'}`
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

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`;
    
    const body = {
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500
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
    
    return aiText.trim() || "I couldn't process that question. Please try rephrasing it.";
  } catch (error) {
    console.error('Error answering question:', error);
    return "Sorry, I encountered an error processing your question. Please try again.";
  }
}

// Check if message is a question/info request (not a transaction)
function isInfoQuery(text: string): boolean {
  const lower = text.toLowerCase().trim();
  
  // Menu commands
  if (lower === '1' || lower === '2' || lower === '3' || 
      lower === 'exit' || lower === 'help' || lower === 'hi' || lower === 'hello' || lower === 'menu') {
    return false; // These are menu commands, handle separately
  }
  
  // Question patterns
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
    /?\s*$/  // Ends with question mark
  ];
  
  return questionPatterns.some(pattern => pattern.test(lower));
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
    return parseTransactionFallback(text);
  }

  try {
    const prompt = `You are Spenly AI. Extract transaction details from: "${text}"

Return ONLY valid JSON:
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
  } catch (error) {
    console.error('Gemini parsing error:', error);
  }

  return parseTransactionFallback(text);
}

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
        
        // Handle menu commands
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
          // Check if it's an image
          if (messageType === 'image') {
            await db.query(
              `INSERT INTO transactions (apple_user_id, amount, transaction_date, vendor, category, note, message_type, media_url, status)
               VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6, $7, 'pending_sync')`,
              [appleUserID, 0, 'Receipt', 'Other', 'Receipt Image', messageType, mediaUrl]
            );
            
            await sendWhatsAppMessage(From,
              `✅ Receipt received! I'll process it shortly.`
            );
            return res.status(200).send('<Response></Response>');
          }
          
          // Check if it's an info query (question)
          if (isInfoQuery(Body)) {
            console.log(`🤔 Detected info query: "${Body}"`);
            const transactions = await getUserTransactions(appleUserID);
            const answer = await answerQuestionWithAI(Body, transactions);
            await sendWhatsAppMessage(From, answer);
            return res.status(200).send('<Response></Response>');
          }
          
          // Try to parse as transaction
          const parsed = await parseTransactionWithAI(Body, mediaUrl);
          
          if (parsed && parsed.amount > 0) {
            await db.query(
              `INSERT INTO transactions (apple_user_id, amount, transaction_date, vendor, category, note, message_type, media_url, status)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending_sync')`,
              [appleUserID, parsed.amount, parsed.date, parsed.vendor, parsed.category, parsed.note, messageType, mediaUrl]
            );
            
            await sendWhatsAppMessage(From,
              `✅ *Transaction Added*\n\n💰 Amount: $${parsed.amount.toFixed(2)}\n📝 Note: ${parsed.note}\n📂 Category: ${parsed.category}\n📅 Date: ${parsed.date}`
            );
          } else {
            // If not a transaction and not a question, show menu
            await sendInteractiveMenu(From, "I didn't understand that. Here are your options:");
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
