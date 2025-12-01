import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

if (!accountSid || !authToken) {
  console.error('Missing Twilio credentials');
}

export const twilioClient = twilio(accountSid, authToken);

export async function sendWhatsAppMessage(to: string, body: string) {
  if (!fromNumber) {
    throw new Error('TWILIO_WHATSAPP_NUMBER is not set');
  }

  try {
    const message = await twilioClient.messages.create({
      body: body,
      from: fromNumber,
      to: to,
    });
    console.log(`Message sent to ${to}: ${message.sid}`);
    return message;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}

