export interface ParsedTransaction {
  amount: number;
  vendor: string;
  date: Date;
  note: string;
  isImage: boolean;
  currency?: string;
}

// AI-powered transaction parsing using OpenRouter
export async function parseTransactionFromText(
  text: string,
  userCurrency: string = 'USD'
): Promise<ParsedTransaction> {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  const openRouterModel = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free';

  // Fallback parsing if AI is not available
  const fallbackResult: ParsedTransaction = {
    amount: 0,
    vendor: '',
    date: new Date(),
    note: '',
    isImage: false,
    currency: userCurrency,
  };

  if (!openRouterApiKey) {
    console.warn('OPENROUTER_API_KEY not set, using fallback parsing');
    return parseTransactionFallback(text, userCurrency);
  }

  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const prompt = `You are a transaction parsing assistant. Extract transaction details from the user's message.

User message: "${text}"
User's default currency: ${userCurrency}
Today's date: ${todayStr}

Extract and return ONLY a valid JSON object with these exact fields:
{
  "amount": <number> (required, must be > 0),
  "vendor": "<string>" (merchant/store/vendor name, required),
  "note": "<string>" (description/details, can be empty string),
  "date": "<YYYY-MM-DD>" (transaction date, default to today if not specified),
  "currency": "<string>" (3-letter currency code like USD, EUR, INR, etc. Use ${userCurrency} if no currency specified)
}

Rules:
- If amount has currency symbol ($, €, ₹, £), use that currency. Otherwise use ${userCurrency}
- Extract vendor name (e.g., "pizza" -> "Pizza Place", "cab" -> "Taxi", "vicks" -> "Pharmacy")
- Extract meaningful note/description (e.g., "lunch at cafe" -> note: "lunch at cafe")
- For dates: "today" = ${todayStr}, "yesterday" = subtract 1 day, relative dates work
- Return ONLY valid JSON, no explanation, no markdown, no code blocks

Example inputs and outputs:
Input: "pizza 10"
Output: {"amount": 10, "vendor": "Pizza Place", "note": "pizza", "date": "${todayStr}", "currency": "${userCurrency}"}

Input: "Lunch $15.50 at cafe yesterday"
Output: {"amount": 15.50, "vendor": "Cafe", "note": "Lunch", "date": "${new Date(today.getTime() - 24*60*60*1000).toISOString().split('T')[0]}", "currency": "USD"}

Input: "₹500 for groceries"
Output: {"amount": 500, "vendor": "Grocery Store", "note": "groceries", "date": "${todayStr}", "currency": "INR"}`;

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
            content: 'You are a precise transaction parser. Always return valid JSON only, no explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 200,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      return parseTransactionFallback(text, userCurrency);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    
    if (!content) {
      return parseTransactionFallback(text, userCurrency);
    }

    // Parse JSON response
    let parsed: any;
    try {
      // Remove markdown code blocks if present
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, 'Content:', content);
      return parseTransactionFallback(text, userCurrency);
    }

    // Validate and construct result
    const result: ParsedTransaction = {
      amount: parsed.amount && parsed.amount > 0 ? parseFloat(parsed.amount) : 0,
      vendor: parsed.vendor || '',
      note: parsed.note || '',
      date: parsed.date ? new Date(parsed.date) : new Date(),
      isImage: false,
      currency: parsed.currency || userCurrency,
    };

    // Validate amount
    if (result.amount <= 0) {
      console.warn('AI returned invalid amount, using fallback');
      return parseTransactionFallback(text, userCurrency);
    }

    return result;
  } catch (error) {
    console.error('Error parsing transaction with AI:', error);
    return parseTransactionFallback(text, userCurrency);
  }
}

// Fallback parsing using regex and heuristics
function parseTransactionFallback(text: string, userCurrency: string): ParsedTransaction {
  const result: ParsedTransaction = {
    amount: 0,
    vendor: '',
    date: new Date(),
    note: '',
    isImage: false,
    currency: userCurrency,
  };

  // Detect currency from symbols
  let detectedCurrency = userCurrency;
  if (text.includes('$')) detectedCurrency = 'USD';
  else if (text.includes('€')) detectedCurrency = 'EUR';
  else if (text.includes('£')) detectedCurrency = 'GBP';
  else if (text.includes('₹')) detectedCurrency = 'INR';
  result.currency = detectedCurrency;

  // Enhanced amount regex: handles $10, 10 USD, 10.50, 10,50 (European format), etc.
  const amountRegex = /(?:^|\s|[$€£₹])(\d{1,3}(?:[.,]\d{2,3})*(?:\.\d{1,2})?)(?:\s*(?:usd|eur|gbp|inr))?(?:$|\s)/i;
  const amountMatch = text.match(amountRegex);

  if (amountMatch && amountMatch[1]) {
    // Handle European number format (comma as decimal separator)
    let amountStr = amountMatch[1].replace(/,/g, '.');
    // If multiple dots, keep only the last one as decimal
    const parts = amountStr.split('.');
    if (parts.length > 2) {
      amountStr = parts.slice(0, -1).join('') + '.' + parts[parts.length - 1];
    }
    result.amount = parseFloat(amountStr);
    text = text.replace(amountMatch[0], '').trim();
  }

  // Enhanced date parsing
  const lowerText = text.toLowerCase();
  const today = new Date();
  
  if (lowerText.includes('today')) {
    result.date = new Date(today);
    text = text.replace(/today/gi, '').trim();
  } else if (lowerText.includes('yesterday')) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    result.date = yesterday;
    text = text.replace(/yesterday/gi, '').trim();
  } else if (lowerText.includes('tomorrow')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    result.date = tomorrow;
    text = text.replace(/tomorrow/gi, '').trim();
  }

  // Extract vendor and note from remaining text
  const remainingText = text.trim();
  if (remainingText) {
    // Try to split vendor and note (common patterns)
    const forMatch = remainingText.match(/^(.+?)\s+for\s+(.+)$/i);
    if (forMatch) {
      result.vendor = forMatch[1].trim();
      result.note = forMatch[2].trim();
    } else {
      // Use first part as vendor, rest as note
      const parts = remainingText.split(/\s+/);
      if (parts.length > 1) {
        result.vendor = parts[0];
        result.note = parts.slice(1).join(' ');
      } else {
        result.vendor = remainingText;
        result.note = remainingText;
      }
    }
  }

  return result;
}

// OCR function to extract transaction details from receipt images using vision AI
export async function parseTransactionFromImage(
  imageUrl: string,
  userCurrency: string = 'USD'
): Promise<ParsedTransaction> {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  const openRouterModel = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free';

  const fallbackResult: ParsedTransaction = {
    amount: 0,
    vendor: '',
    date: new Date(),
    note: 'Receipt (unable to parse)',
    isImage: true,
    currency: userCurrency,
  };

  if (!openRouterApiKey) {
    console.warn('OPENROUTER_API_KEY not set, cannot parse receipt image');
    return fallbackResult;
  }

  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Use a vision-capable model (Gemini supports vision)
    const visionModel = openRouterModel.includes('gemini') 
      ? openRouterModel 
      : 'google/gemini-2.0-flash-exp:free'; // Fallback to Gemini for vision

    const prompt = `You are a receipt OCR assistant. Analyze this receipt image and extract transaction details.

Extract and return ONLY a valid JSON object with these exact fields:
{
  "amount": <number> (total amount paid, required, must be > 0),
  "vendor": "<string>" (store/merchant name, required),
  "note": "<string>" (items purchased or description, can be empty string),
  "date": "<YYYY-MM-DD>" (transaction date from receipt, use ${todayStr} if not visible),
  "currency": "<string>" (3-letter currency code like USD, EUR, INR, etc. Use ${userCurrency} if not visible)
}

Rules:
- Extract the TOTAL amount (not individual items)
- Extract the merchant/store name clearly
- List key items purchased in the note field (e.g., "Pizza, Coke, Fries")
- Extract date from receipt if visible, otherwise use ${todayStr}
- Detect currency from receipt (symbols or text), default to ${userCurrency}
- Return ONLY valid JSON, no explanation, no markdown, no code blocks

Be accurate and thorough. If you cannot read the receipt clearly, set amount to 0.`;

    // Fetch image as base64 for vision models
    let imageBase64: string;
    try {
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.status}`);
      }
      const imageBuffer = await imageResponse.arrayBuffer();
      imageBase64 = Buffer.from(imageBuffer).toString('base64');
    } catch (imageError) {
      console.error('Error fetching image for OCR:', imageError);
      return fallbackResult;
    }

    // Determine image MIME type
    const imageMimeType = imageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)?.[0]?.toLowerCase() || 'image/jpeg';
    const mimeType = imageMimeType === '.png' ? 'image/png' : 
                     imageMimeType === '.gif' ? 'image/gif' :
                     imageMimeType === '.webp' ? 'image/webp' : 'image/jpeg';

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://www.spenly.app',
        'X-Title': 'Spenly WhatsApp Bot'
      },
      body: JSON.stringify({
        model: visionModel,
        messages: [
          {
            role: 'system',
            content: 'You are a precise receipt OCR assistant. Always return valid JSON only, no explanations.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 300,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter Vision API error:', response.status, errorText);
      return fallbackResult;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    
    if (!content) {
      return fallbackResult;
    }

    // Parse JSON response
    let parsed: any;
    try {
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse OCR response:', parseError, 'Content:', content);
      return fallbackResult;
    }

    // Validate and construct result
    const result: ParsedTransaction = {
      amount: parsed.amount && parsed.amount > 0 ? parseFloat(parsed.amount) : 0,
      vendor: parsed.vendor || 'Unknown Merchant',
      note: parsed.note || 'Receipt',
      date: parsed.date ? new Date(parsed.date) : new Date(),
      isImage: true,
      currency: parsed.currency || userCurrency,
    };

    // Validate amount
    if (result.amount <= 0) {
      console.warn('OCR returned invalid amount');
      result.note = 'Receipt (amount not detected)';
    }

    return result;
  } catch (error) {
    console.error('Error parsing receipt with OCR:', error);
    return fallbackResult;
  }
}

