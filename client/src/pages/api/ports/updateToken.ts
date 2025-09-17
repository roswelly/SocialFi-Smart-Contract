import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { Token } from '@/interface/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Token>
) {
  if (req.method !== 'PATCH') {
    return res.status(405).end();
  }

  try {
    const { address, data } = req.body;
    if (!address || !data) {
      return res.status(400).json({ error: 'Address and data are required' } as any);
    }

    const response = await axios.patch(
      `${API_BASE_URL}/api/tokens/update/${address}`,
      data
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update token' } as any);
  }
}
