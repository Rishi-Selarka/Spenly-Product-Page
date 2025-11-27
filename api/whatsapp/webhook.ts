import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleWhatsAppMessage } from '../../lib/bot';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  try {
    // Twilio sends form-urlencoded data
    const params = req.body || {};
    
    const From = params.From || '';
    const Body = params.Body || '';
    const NumMedia = params.NumMedia || '0';
    const MediaUrl0 = params.MediaUrl0 || '';
    
    let messageType = 'text';
    let mediaUrl: string | undefined = undefined;
    
    if (NumMedia && parseInt(NumMedia) > 0) {
      messageType = 'image';
      mediaUrl = MediaUrl0;
    }

    console.log(`Received message from ${From}: ${Body} (type: ${messageType})`);

    // Process message
    await handleWhatsAppMessage(From, Body, mediaUrl, messageType);

    // Return TwiML response
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send('<Response></Response>');

  } catch (error: any) {
    console.error('Error processing webhook:', error);
    // Return 200 to avoid Twilio retries
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send('<Response></Response>');
  }
}
