import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { Token, PaginatedResponse } from '@/interface/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaginatedResponse<Token>>
) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const { creatorAddress, page = 1, pageSize = 20 } = req.query;
    if (!creatorAddress || typeof creatorAddress !== 'string') {
      return res.status(400).json({ 
        tokens: [], 
        data: [], 
        totalCount: 0, 
        currentPage: 1, 
        totalPages: 1 
      });
    }

    const response = await axios.get(
      `${API_BASE_URL}/api/tokens/creator/${creatorAddress}`,
      {
        params: { 
          page: Number(page), 
          pageSize: Number(pageSize) 
        }
      }
    );
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
