export interface ParsedTransaction {
  amount: number;
  vendor: string;
  date: Date;
  note: string;
  isImage: boolean;
}

export function parseTransactionFromText(text: string): ParsedTransaction {
  const transaction: ParsedTransaction = {
    amount: 0,
    date: new Date(),
    vendor: 'Unknown',
    note: '',
    isImage: false
  };

  if (!text) {
    return transaction;
  }

  // Extract amount using regex
  // Matches: $10, 10.50, $10.50, 10 USD, etc.
  const amountRegex = /(?:\$|€|£|₹)?(\d+(?:\.\d{1,2})?)/;
  const amountMatch = text.match(amountRegex);

  let cleanText = text;

  if (amountMatch && amountMatch[1]) {
    const amount = parseFloat(amountMatch[1]);
    if (!isNaN(amount)) {
      transaction.amount = amount;
      cleanText = cleanText.replace(amountMatch[0], ' ').trim();
    }
  }

  // Parse date keywords
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

  // Remaining text is vendor/note
  cleanText = cleanText.replace(/\s+/g, ' ').trim();
  
  if (cleanText.length > 0) {
    transaction.vendor = cleanText;
    transaction.note = cleanText;
  } else {
    transaction.vendor = 'Expense';
    transaction.note = 'Expense';
  }

  return transaction;
}
