import { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookies = parse(req.headers.cookie || '');
  const address = cookies.siwe_session;

  if (address) {
    res.status(200).json({ address });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
}
