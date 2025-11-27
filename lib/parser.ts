export interface ParsedTransaction {
  amount: number;
  vendor?: string;
  date: Date;
  note?: string;
  isImage: boolean;
}

export function parseTransactionFromText(text: string): ParsedTransaction {
  const transaction: ParsedTransaction = {
    amount: 0,
    date: new Date(), // Default to now
    isImage: false
  };

  // 1. Extract Amount
  // Regex for amount: matches $10, 10.50, 10 USD, etc.
  // Looks for numbers with optional decimals, potentially preceded by currency symbol
  const amountRegex = /(?:^|\s|\$|€|£|₹)(\d+(?:\.\d{1,2})?)(?:\s*(?:usd|eur|gbp|inr))?(?:$|\s)/i;
  const amountMatch = text.match(amountRegex);

  let cleanText = text;

  if (amountMatch && amountMatch[1]) {
    const amountStr = amountMatch[1];
    const amount = parseFloat(amountStr);
    if (!isNaN(amount)) {
      transaction.amount = amount;
      // Remove the matched amount string from text to clean it up
      cleanText = cleanText.replace(amountMatch[0], ' ').trim();
    }
  }

  // 2. Parse Date (Simple heuristics)
  const lowerText = cleanText.toLowerCase();
  if (lowerText.includes('today')) {
    transaction.date = new Date();
    cleanText = cleanText.replace(/today/i, '').trim();
  } else if (lowerText.includes('yesterday')) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    transaction.date = d;
    cleanText = cleanText.replace(/yesterday/i, '').trim();
  }
  // Add more sophisticated date parsing if needed later

  // 3. Remaining text is the Vendor/Note
  // Clean up extra spaces
  cleanText = cleanText.replace(/\s+/g, ' ').trim();
  
  if (cleanText.length > 0) {
    transaction.vendor = cleanText;
    transaction.note = cleanText;
  } else {
    transaction.vendor = "Unknown";
    transaction.note = "Expense";
  }

  return transaction;
}

