import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { LiquidityEvent, PaginatedResponse } from '@/interface/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaginatedResponse<LiquidityEvent>>
) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const { tokenId, page = 1, pageSize = 20 } = req.query;
    if (!tokenId || typeof tokenId !== 'string') {
      return res.status(400).json({ 
        tokens: [],
        data: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 1
      });
    }

    const response = await axios.get(`${API_BASE_URL}/api/liquidity/token/${tokenId}`, {
      params: { 
        page: Number(page), 
        pageSize: Number(pageSize) 
      }
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ 
      tokens: [],
      data: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 1
    });
  }
}
