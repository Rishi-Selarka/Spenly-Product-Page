import twilio from 'twilio';

let client: twilio.Twilio | null = null;

export function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set');
  }

  if (!client) {
    client = twilio(accountSid, authToken);
  }
  return client;
}

export async function sendWhatsAppMessage(to: string, body: string) {
  const client = getTwilioClient();
  const from = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!from) {
    throw new Error('TWILIO_WHATSAPP_NUMBER must be set');
  }

  // Ensure 'to' number has whatsapp: prefix if not present
  const toAddress = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  const fromAddress = from.startsWith('whatsapp:') ? from : `whatsapp:${from}`;

  try {
    const message = await client.messages.create({
      body: body,
      from: fromAddress,
      to: toAddress
    });
    console.log(`Message sent to ${to}: ${message.sid}`);
    return message;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}

