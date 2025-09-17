import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { Token } from '@/interface/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Token>
) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const { address } = req.query;
    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: 'Address is required' } as any);
    }

    const response = await axios.get(`${API_BASE_URL}/api/tokens/address/${address}/historical-prices`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch historical price data' } as any);
  }
}
