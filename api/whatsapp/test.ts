import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🧪 Test endpoint called');
  console.log('Method:', req.method);
  console.log('Body:', JSON.stringify(req.body));
  console.log('Query:', JSON.stringify(req.query));
  console.log('Headers:', JSON.stringify(req.headers));
  
  return res.status(200).json({
    message: 'Webhook test endpoint is working',
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });
}

