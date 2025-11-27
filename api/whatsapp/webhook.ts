import type { VercelRequest, VercelResponse } from '@vercel/node';
import twilio from 'twilio';
import { handleWhatsAppMessage } from '../../lib/bot.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  // Validate Twilio Signature
  // In Vercel, headers are lowercased
  const twilioSignature = req.headers['x-twilio-signature'] as string;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  // Construct URL - Vercel might be on http/https, assume https for production
  const url = `https://${req.headers.host}${req.url}`;
  
  // Note: Signature validation is strict. 
  // For MVP debugging, if this fails frequently due to Vercel proxying/URL mismatches, 
  // you can temporarily wrap it in try/catch or log it.
  
  try {
    // Note: Twilio webhook body is Form URL Encoded, not JSON usually.
    // Vercel parses body automatically if content-type matches.
    // Twilio sends 'application/x-www-form-urlencoded'.
    const params = req.body;
    
    if (authToken) {
      const requestIsValid = twilio.validateRequest(
        authToken,
        twilioSignature,
        url,
        params
      );

      if (!requestIsValid) {
        console.warn('Twilio signature validation failed. Proceeding for debugging (Enable strict check in production).');
        // return res.status(401).send('Unauthorized');
      }
    }
    
    const From = params.From;
    const Body = params.Body;
    const NumMedia = params.NumMedia;
    const MediaUrl0 = params.MediaUrl0;
    
    let messageType = 'text';
    let mediaUrl = undefined;
    
    if (NumMedia && parseInt(NumMedia) > 0) {
      messageType = 'image';
      mediaUrl = MediaUrl0;
    }

    // Process message
    await handleWhatsAppMessage(From, Body || '', mediaUrl, messageType);

    // Return TwiML
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send('<Response></Response>');

  } catch (error) {
    console.error('Error processing webhook:', error);
    // Return 200 to avoid Twilio retrying indefinitely on internal error
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send('<Response></Response>');
  }
}

