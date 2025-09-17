import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { PriceResponse } from '@/interface/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PriceResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const response = await axios.get<PriceResponse>(`${API_BASE_URL}/api/price`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ price: '0' });
  }
}
