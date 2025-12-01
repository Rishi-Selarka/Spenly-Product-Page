import { db } from './db';
import { sendWhatsAppMessage } from './twilio';
import { parseTransactionFromText, parseTransactionFromImage } from './parser';

// Database migration: ensure currency columns exist
async function runMigrations() {
  try {
    // Add currency column to users table if it doesn't exist
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD'
    `);
    
    // Add currency column to transactions table if it doesn't exist
    await db.query(`
      ALTER TABLE transactions 
      ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD'
    `);
  } catch (error) {
    console.error('Migration error:', error);
    // Don't throw - migrations should be idempotent
  }
}

// AI function to detect category using OpenRouter
async function detectCategoryWithAI(
  vendor: string,
  note: string,
  availableCategories: Array<{ category_name: string; category_type: string }>
): Promise<string> {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  const openRouterModel = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free';

  if (!openRouterApiKey) {
    console.warn('OPENROUTER_API_KEY not set, using fallback category detection');
    return detectCategoryFallback(vendor, note, availableCategories);
  }

  try {
    // Filter to only expense categories (transactions are expenses)
    const expenseCategories = availableCategories
      .filter(cat => cat.category_type === 'expense')
      .map(cat => cat.category_name);

    if (expenseCategories.length === 0) {
      return 'Other Expenses';
    }

    const prompt = `You are a transaction categorization assistant. Given a vendor/item name and note, categorize it into one of these expense categories: ${expenseCategories.join(', ')}.

Vendor/Item: "${vendor}"
Note: "${note}"

Respond with ONLY the category name from the list above. If unsure, choose the most appropriate one. Do not add any explanation, just the category name.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://www.spenly.app',
        'X-Title': 'Spenly WhatsApp Bot'
      },
      body: JSON.stringify({
        model: openRouterModel,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that categorizes expenses. Respond with only the category name.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 50
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      return detectCategoryFallback(vendor, note, availableCategories);
    }

    const data = await response.json();
    const detectedCategory = data.choices?.[0]?.message?.content?.trim();

    if (detectedCategory && expenseCategories.includes(detectedCategory)) {
      return detectedCategory;
    }

    // If AI returned something not in the list, try fallback
    return detectCategoryFallback(vendor, note, availableCategories);
  } catch (error) {
    console.error('Error detecting category with AI:', error);
    return detectCategoryFallback(vendor, note, availableCategories);
  }
}

// Fallback category detection using keyword matching
function detectCategoryFallback(
  vendor: string,
  note: string,
  availableCategories: Array<{ category_name: string; category_type: string }>
): string {
  const text = `${vendor} ${note}`.toLowerCase();
  
  const expenseCategories = availableCategories.filter(cat => cat.category_type === 'expense');
  
  // Keyword mappings for common items
  const keywordMap: { [key: string]: string[] } = {
    'Food & Dining': ['pizza', 'burger', 'restaurant', 'cafe', 'coffee', 'lunch', 'dinner', 'breakfast', 'food', 'eat', 'meal', 'snack', 'drink', 'beverage'],
    'Transportation': ['cab', 'taxi', 'uber', 'lyft', 'bus', 'train', 'metro', 'subway', 'transport', 'ride', 'fuel', 'gas', 'parking'],
    'Shopping': ['pencil', 'pencils', 'shopping', 'store', 'mall', 'retail', 'purchase', 'buy'],
    'Health & Fitness': ['vicks', 'medicine', 'pharmacy', 'doctor', 'hospital', 'medical', 'health', 'fitness', 'gym', 'vitamin'],
    'Bills & Utilities': ['bill', 'utility', 'electric', 'water', 'internet', 'phone', 'utility'],
    'Entertainment': ['movie', 'cinema', 'game', 'entertainment', 'fun', 'concert'],
    'Education': ['book', 'school', 'education', 'course', 'tuition'],
    'Personal Care': ['haircut', 'salon', 'beauty', 'personal', 'care'],
    'Other Expenses': []
  };

  // Check for keyword matches
  for (const [category, keywords] of Object.entries(keywordMap)) {
    if (expenseCategories.some(cat => cat.category_name === category)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          return category;
        }
      }
    }
  }

  // Default to "Other Expenses" if it exists, otherwise first expense category
  const otherExpenses = expenseCategories.find(cat => cat.category_name === 'Other Expenses');
  if (otherExpenses) {
    return 'Other Expenses';
  }

  return expenseCategories.length > 0 ? expenseCategories[0].category_name : 'Uncategorized';
}

// AI-powered intent detection
async function detectIntent(
  message: string,
  isLinked: boolean
): Promise<'transaction' | 'greeting' | 'question' | 'link'> {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  const openRouterModel = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free';

  // Check for linking command first
  if (message.toLowerCase().startsWith('link_')) {
    return 'link';
  }

  if (!openRouterApiKey) {
    // Fallback: simple heuristics
    const lower = message.toLowerCase().trim();
    if (lower === 'hi' || lower === 'hello' || lower === 'hey') return 'greeting';
    if (lower.includes('?') || lower.startsWith('what') || lower.startsWith('how') || lower.startsWith('why')) return 'question';
    // If it has numbers, likely a transaction
    if (/\d/.test(message)) return 'transaction';
    return 'question';
  }

  try {
    const prompt = `Analyze this WhatsApp message and determine the user's intent. User is ${isLinked ? 'linked' : 'not linked'} to their account.

Message: "${message}"

Respond with ONLY one word: "transaction", "greeting", "question", or "link"

Rules:
- "transaction": User wants to add an expense/transaction (e.g., "pizza 10", "lunch $15", "coffee 5 dollars")
- "greeting": Simple greetings (e.g., "hi", "hello", "hey")
- "question": User is asking something (e.g., "how do I add a transaction?", "what can you do?")
- "link": Message starts with "link_" (already handled, but include for completeness)

Examples:
- "pizza 10" → transaction
- "hi" → greeting
- "hello" → greeting
- "how do I add expenses?" → question
- "what can you do?" → question
- "lunch $15" → transaction
- "coffee 5" → transaction`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://www.spenly.app',
        'X-Title': 'Spenly WhatsApp Bot'
      },
      body: JSON.stringify({
        model: openRouterModel,
        messages: [
          {
            role: 'system',
            content: 'You are an intent classifier. Respond with only one word: transaction, greeting, question, or link.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 10
      })
    });

    if (!response.ok) {
      // Fallback to heuristics
      const lower = message.toLowerCase().trim();
      if (lower === 'hi' || lower === 'hello' || lower === 'hey') return 'greeting';
      if (/\d/.test(message)) return 'transaction';
      return 'question';
    }

    const data = await response.json();
    const intent = data.choices?.[0]?.message?.content?.trim().toLowerCase();
    
    if (intent === 'transaction' || intent === 'greeting' || intent === 'question' || intent === 'link') {
      return intent;
    }

    // Fallback
    if (/\d/.test(message)) return 'transaction';
    return 'question';
  } catch (error) {
    console.error('Error detecting intent:', error);
    // Fallback
    if (/\d/.test(message)) return 'transaction';
    return 'question';
  }
}

// AI-powered response generation for greetings and questions
async function generateAIResponse(
  message: string,
  isLinked: boolean,
  intent: 'greeting' | 'question'
): Promise<string> {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  const openRouterModel = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free';

  if (!openRouterApiKey) {
    // Fallback responses
    if (intent === 'greeting') {
      return isLinked
        ? "👋 Hi! I'm Spenly AI. Send me your expenses like 'Pizza $15' or send a receipt photo!"
        : "👋 Welcome to Spenly AI! Please link your account first. Go to Spenly app → Settings → Connect WhatsApp Bot.";
    }
    return "I'm Spenly AI, your expense tracking assistant. Send me transactions like 'Lunch $15' or ask me questions!";
  }

  try {
    const context = isLinked
      ? "The user is linked to their Spenly account. They can add transactions, view spending, and ask questions about their expenses."
      : "The user is NOT linked yet. They need to link their account first via the Spenly app.";

    const prompt = `You are Spenly AI, a friendly WhatsApp bot for expense tracking. ${context}

User message: "${message}"
Intent: ${intent}

Generate a helpful, concise response (max 200 characters). Be friendly and natural. If user is not linked, remind them to link their account. If linked, explain how to add transactions.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://www.spenly.app',
        'X-Title': 'Spenly WhatsApp Bot'
      },
      body: JSON.stringify({
        model: openRouterModel,
        messages: [
          {
            role: 'system',
            content: 'You are Spenly AI, a friendly expense tracking assistant. Keep responses concise and helpful.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    if (!response.ok) {
      throw new Error('AI response failed');
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content?.trim();
    
    if (aiResponse) {
      return aiResponse;
    }
  } catch (error) {
    console.error('Error generating AI response:', error);
  }

  // Fallback
  if (intent === 'greeting') {
    return isLinked
      ? "👋 Hi! Send me expenses like 'Pizza $15' or receipt photos!"
      : "👋 Welcome! Link your account in Spenly app → Settings → Connect WhatsApp Bot.";
  }
  return "I'm Spenly AI! Send transactions like 'Lunch $15' or ask me questions about expenses.";
}

export async function handleWhatsAppMessage(
  from: string,
  body: string,
  mediaUrl?: string,
  messageType: string = 'text'
) {
  // Check if user is linked
  const appleUserId = await getAppleUserIdByWhatsApp(from);
  const isLinked = !!appleUserId;

  // Detect intent using AI
  const intent = await detectIntent(body, isLinked);

  // Handle linking
  if (intent === 'link' || body.toLowerCase().startsWith('link_')) {
    const token = body.toLowerCase().replace('link_', '').trim();
    return handleLinkToken(from, token);
  }

  // Handle greetings and questions with AI
  if (intent === 'greeting' || intent === 'question') {
    const response = await generateAIResponse(body, isLinked, intent);
    return sendWhatsAppMessage(from, response);
  }

  // If not linked and not a greeting/question, prompt to link
  if (!isLinked) {
    return sendWhatsAppMessage(
      from,
      "Welcome to Spenly AI! To get started, please link your account. Go to Spenly app -> Settings -> Connect WhatsApp Bot to get your unique linking code."
    );
  }

  // Handle transaction (intent === 'transaction' or images)
  return handleTransactionMessage(from, appleUserId, body, mediaUrl, messageType);
}

async function handleLinkToken(whatsappNumber: string, token: string) {
  try {
    const result = await db.query(
      `SELECT apple_user_id, expires_at, used_at FROM link_tokens WHERE token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return sendWhatsAppMessage(whatsappNumber, "❌ Invalid or expired linking code.");
    }

    const { apple_user_id, expires_at, used_at } = result.rows[0];

    if (new Date() > new Date(expires_at)) {
      return sendWhatsAppMessage(whatsappNumber, "❌ This linking code has expired.");
    }

    if (used_at) {
      return sendWhatsAppMessage(whatsappNumber, "❌ This linking code has already been used.");
    }

    // Get currency from link token before marking as used
    const tokenResult = await db.query(
      `SELECT currency FROM link_tokens WHERE token = $1`,
      [token]
    );
    const tokenCurrency = tokenResult.rows[0]?.currency || 'USD';

    // Mark used
    await db.query(`UPDATE link_tokens SET used_at = NOW() WHERE token = $1`, [token]);

    // Link user and preserve currency
    await db.query(
      `INSERT INTO users (apple_user_id, whatsapp_number, linked_at, currency)
       VALUES ($1, $2, NOW(), $3)
       ON CONFLICT (apple_user_id) DO UPDATE SET whatsapp_number = $2, linked_at = NOW(), currency = $3`,
      [apple_user_id, whatsappNumber, tokenCurrency]
    );

    return sendWhatsAppMessage(
      whatsappNumber,
      "✅ Account linked! I'm Spenly AI. You can now send me your expenses. Try sending: 'Lunch $15' or a photo of your receipt."
    );
  } catch (error) {
    console.error('Error linking account:', error);
    return sendWhatsAppMessage(whatsappNumber, "❌ An error occurred while linking your account.");
  }
}

async function handleTransactionMessage(
  whatsappNumber: string,
  appleUserId: string,
  body: string,
  mediaUrl?: string,
  messageType: string = 'text'
) {
  try {
    // Run migrations to ensure schema is up-to-date
    await runMigrations();
    
    // Get user's currency from database
    const userResult = await db.query(
      `SELECT currency FROM users WHERE apple_user_id = $1`,
      [appleUserId]
    );
    const userCurrency = userResult.rows[0]?.currency || 'USD';

    let parsed;
    
    if (messageType === 'text') {
      // Use AI-powered text parsing
      parsed = await parseTransactionFromText(body, userCurrency);
      
      if (parsed.amount <= 0) {
        return sendWhatsAppMessage(
          whatsappNumber,
          "❌ I couldn't find an amount in your message. Please send something like 'Pizza $15' or 'Lunch 500 rupees'"
        );
      }
    } else if (messageType === 'image' && mediaUrl) {
      // Use AI-powered OCR for receipt images
      await sendWhatsAppMessage(whatsappNumber, "📸 Processing receipt...");
      parsed = await parseTransactionFromImage(mediaUrl, userCurrency);
      
      if (parsed.amount <= 0) {
        return sendWhatsAppMessage(
          whatsappNumber,
          "❌ I couldn't extract transaction details from the receipt. Please try sending it again or add the transaction manually as text."
        );
      }
    } else {
      return sendWhatsAppMessage(whatsappNumber, "I can only process text or images.");
    }

    const { amount, vendor, note, date, currency } = parsed;

    // Fetch user's available categories
    const categoriesResult = await db.query(
      `SELECT category_name, category_type 
       FROM user_categories 
       WHERE apple_user_id = $1`,
      [appleUserId]
    );

    const availableCategories = categoriesResult.rows;

    // Detect category using AI if categories are available
    let category = 'Uncategorized';
    if (availableCategories.length > 0 && vendor) {
      category = await detectCategoryWithAI(vendor, note, availableCategories);
    } else if (availableCategories.length === 0) {
      // No categories synced yet, use fallback
      category = detectCategoryFallback(vendor, note, []);
    }

    // Store currency in transaction (format date as YYYY-MM-DD)
    const transactionDate = date instanceof Date ? date.toISOString().split('T')[0] : date;
    await db.query(
      `INSERT INTO transactions 
      (apple_user_id, amount, currency, transaction_date, vendor, category, note, message_type, media_url, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending_sync')`,
      [
        appleUserId,
        amount,
        currency || userCurrency,
        transactionDate,
        vendor,
        category,
        note,
        messageType,
        mediaUrl || null
      ]
    );

    // Format response with currency symbol
    const currencySymbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'INR': '₹',
    };
    const symbol = currencySymbols[currency || userCurrency] || (currency || userCurrency);
    
    const response = messageType === 'text'
      ? `✅ Transaction added:\n${vendor}\n${category}\n${symbol}${amount.toFixed(2)}${note ? `\nNote: ${note}` : ''}`
      : `✅ Receipt processed:\n${vendor}\n${category}\n${symbol}${amount.toFixed(2)}${note ? `\nItems: ${note}` : ''}`;

    return sendWhatsAppMessage(whatsappNumber, response);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return sendWhatsAppMessage(whatsappNumber, "❌ Error saving transaction. Please try again.");
  }
}

async function getAppleUserIdByWhatsApp(whatsappNumber: string): Promise<string | null> {
  const result = await db.query(
    `SELECT apple_user_id FROM users WHERE whatsapp_number = $1`,
    [whatsappNumber]
  );
  return result.rows.length > 0 ? result.rows[0].apple_user_id : null;
}
