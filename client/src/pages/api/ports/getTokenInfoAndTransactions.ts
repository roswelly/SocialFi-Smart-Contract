import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { TokenWithTransactions, Token } from '@/interface/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Empty token object for error cases
const emptyToken: Token = {
  id: '',
  chainId: 0,
  address: '',
  creatorAddress: '',
  name: '',
  symbol: '',
  logo: '',
  description: '',
  createdAt: '',
  updatedAt: '',
  website: '',
  youtube: '',
  discord: '',
  twitter: '',
  telegram: '',
  latestTransactionTimestamp: '',
  _count: {
    liquidityEvents: 0
  },
  // liquidityEvents: 0,
  map: null
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TokenWithTransactions>
) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const { address, transactionPage = 1, transactionPageSize = 10 } = req.query;
    if (!address || typeof address !== 'string') {
      return res.status(400).json({ 
        ...emptyToken,
        transactions: { 
          data: [], 
          pagination: { 
            currentPage: 1, 
            pageSize: 10, 
            totalCount: 0, 
            totalPages: 0 
          } 
        }
      });
    }

    const response = await axios.get(
      `${API_BASE_URL}/api/tokens/address/${address}/info-and-transactions`,
      {
        params: { 
          transactionPage: Number(transactionPage), 
          transactionPageSize: Number(transactionPageSize) 
        }
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Server-side error in getTokenInfoAndTransactions:', error);
    res.status(500).json({ 
      ...emptyToken,
      transactions: { 
        data: [], 
        pagination: { 
          currentPage: 1, 
          pageSize: 10, 
          totalCount: 0, 
          totalPages: 0 
        } 
      }
    });
  }
}
