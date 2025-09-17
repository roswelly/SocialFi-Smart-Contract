import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { Token, PaginatedResponse } from '@/interface/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaginatedResponse<Token> | null>
) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const { page = 1, pageSize = 20, hours = 24 } = req.query;
    const response = await axios.get(`${API_BASE_URL}/api/tokens/recent`, {
      params: { 
        page: Number(page), 
        pageSize: Number(pageSize),
        hours: Number(hours)
      }
    });
    
    // If we get an empty array of tokens, return 404
    if (!response.data.tokens || response.data.tokens.length === 0) {
      return res.status(404).json(null);
    }
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error in getRecentTokens:', error);
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return res.status(404).json(null);
    }
    res.status(500).json(null);
  }
}
