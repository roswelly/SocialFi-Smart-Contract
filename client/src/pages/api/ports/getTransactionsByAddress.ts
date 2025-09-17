import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { TransactionResponse } from '@/interface/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TransactionResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const { address, page = 1, pageSize = 10 } = req.query;
    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: 'Address is required' } as any);
    }

    const response = await axios.get(
      `${API_BASE_URL}/api/transactions/address/${address}`,
      {
        params: { 
          page: Number(page), 
          pageSize: Number(pageSize) 
        }
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' } as any);
  }
}
