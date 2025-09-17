import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { Token } from '@/interface/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Token[]>
) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/api/tokens/without-liquidityEvent`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json([]);
  }
}
