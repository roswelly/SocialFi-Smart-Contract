import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface TokenAddress {
  address: string;
  symbol: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/api/tokens/addresses`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json([]);
  }
}
