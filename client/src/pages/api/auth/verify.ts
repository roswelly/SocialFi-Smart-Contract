import { NextApiRequest, NextApiResponse } from 'next';
import { SiweMessage } from 'siwe';
import { parse } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, signature } = req.body;

    const siweMessage = new SiweMessage(message);
    const fields = await siweMessage.validate(signature);

    const cookies = parse(req.headers.cookie || '');
    const storedNonce = cookies.siwe_nonce;

    if (fields.nonce !== storedNonce) {
      return res.status(422).json({ error: 'Invalid nonce' });
    }

    const sessionExpiration = 5 * 24 * 60 * 60;
    res.setHeader('Set-Cookie', `siwe_session=${fields.address}; HttpOnly; Path=/; Max-Age=${sessionExpiration}`);

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Verification failed:', error);
    res.status(400).json({ error: 'Verification failed' });
  }
}
