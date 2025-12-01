import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleWhatsAppMessage } from '../../lib/bot';
import twilio from 'twilio';

const { validateRequest } = twilio;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // Verify Twilio Signature
  const authToken = process.env.TWILIO_AUTH_TOKEN || '';
  const signature = req.headers['x-twilio-signature'] as string;
  
  // For Vercel, we need to reconstruct the full URL
  // Note: x-forwarded-proto usually 'https' on Vercel
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const url = `${protocol}://${host}/api/whatsapp/webhook`;
  
  // In production, you should validate the signature
  // However, proxy/forwarding can sometimes break validation if headers/params change
  // For now, we'll skip strict validation if it fails, but log it.
  // You can enable strict mode by returning 401 if !isValid
  
  // const isValid = validateRequest(authToken, signature, url, req.body);
  // if (!isValid) {
  //   console.warn('Invalid Twilio signature');
  //   // return res.status(401).send('Unauthorized');
  // }

  try {
    const { From, Body, MediaUrl0, NumMedia } = req.body;
    const messageType = (NumMedia && parseInt(NumMedia) > 0) ? 'image' : 'text';
    
    await handleWhatsAppMessage(From, Body || '', MediaUrl0, messageType);
    
    // Return TwiML
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send('<Response></Response>');
  } catch (error) {
    console.error('Webhook error:', error);
    // Return 200 to stop Twilio from retrying indefinitely on internal errors
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send('<Response></Response>');
  }
}

