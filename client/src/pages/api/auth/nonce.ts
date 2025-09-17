import { NextApiRequest, NextApiResponse } from 'next';
import { randomBytes } from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  /* 
   Expires in 5 minutes 
  */
  const nonce = randomBytes(32).toString('hex');
  res.setHeader('Set-Cookie', `siwe_nonce=${nonce}; HttpOnly; Path=/; Max-Age=300`);
  res.status(200).json({ nonce });
}
