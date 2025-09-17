// api.ts

import axios from 'axios';
import { Token, TokenWithLiquidityEvents, PaginatedResponse, LiquidityEvent, TokenWithTransactions, PriceResponse, HistoricalPrice, USDHistoricalPrice, TokenHolder, TransactionResponse } from '@/interface/types';
import { ethers } from 'ethers';


export async function getAllTokens(page: number = 1, pageSize: number = 13): Promise<PaginatedResponse<Token>> {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ports/getAllTokens`, {
    params: { page, pageSize }
  });
  return response.data;
}

export async function getAllTokensTrends(): Promise<Token[]> {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tokens/trending`);
  console.log('getAllTokensTrends', response.data.data);
  return response.data.data;
}

export async function getAllTokensWithoutLiquidity(): Promise<Token[]> { //uniswap aggregator use
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ports/getAllTokensWithoutLiquidity`);
  return response.data;
}

//GET /api/volume/total
export async function getTotalVolume(): Promise<{ totalVolume: number }> {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ports/getTotalVolume`);
  return response.data;
}

//GET /api/volume/range?hours=24
export async function getVolumeRange(hours: number): Promise<{ totalVolume: number }> {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ports/getVolumeRange`, {
    params: { hours }
  });
  return response.data;
}

//GET /api/tokens/total-count
export async function getTotalTokenCount(): Promise<{ totalTokens: number }> {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ports/getTotalTokenCount`);
  return response.data;
}


export async function getRecentTokens(page: number = 1, pageSize: number = 20, hours: number = 24): Promise<PaginatedResponse<Token> | null> {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ports/tokens/recent/`, {
      params: { page, pageSize, hours }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      // Return null to indicate no recent tokens found
      return null;
    }
    throw error; // Re-throw other errors
  }
}

export async function searchTokens(
  query: string,
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<Token>> {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ports/searchTokens`, {
      params: { q: query, page, pageSize }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching tokens:', error);
    throw new Error('Failed to search tokens');
  }
}

export async function getTokensWithLiquidity(page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<TokenWithLiquidityEvents>> {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ports/getTokensWithLiquidity`, {
    params: { page, pageSize }
  });
  return response.data;
}

export async function getTokenByAddress(address: string): Promise<Token> {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ports/getTokenByAddress`, {
    params: { address }
  });
  return response.data;
}

export async function getTokenLiquidityEvents(tokenId: string, page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<LiquidityEvent>> {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ports/getTokenLiquidityEvents`, {
    params: { tokenId, page, pageSize }
  });
  return response.data;
}

export async function getTokenInfoAndTransactions(
  address: string,
  transactionPage: number = 1,
  transactionPageSize: number = 10
): Promise<TokenWithTransactions> {
  try {
    const baseUrl = typeof window === 'undefined' 
      ? process.env.NEXT_VERCEL_URL
        ? `https://${process.env.NEXT_VERCEL_URL}`
        : 'http://localhost:3000'
      : '';

    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ports/getTokenInfoAndTransactions`, {
      params: { address, transactionPage, transactionPageSize }
    });
    return response.data;
  } catch (error) {
    console.error('Error in getTokenInfoAndTransactions:', error);
    throw error;
  }
}


//historical price
export async function getHistoricalPriceData(address: string): Promise<Token> {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ports/getHistoricalPriceData`, {
    params: { address }
  });
  return response.data;
}

//eth price usd
export async function getCurrentPrice(): Promise<string> {
  try {
    const response = await axios.get<PriceResponse>('/api/ports/getCurrentPrice');
    return response.data.price;
  } catch (error) {
    console.error('Error fetching current price:', error);
    throw new Error('Failed to fetch current price');
  }
}


export async function getTokenUSDPriceHistory(address: string): Promise<USDHistoricalPrice[]> {
  try {
    const [ethPrice, historicalPrices] = await Promise.all([
      getCurrentPrice(),
      getHistoricalPriceData(address)
    ]);

    return historicalPrices.map((price: HistoricalPrice) => {
      const tokenPriceInWei = ethers.BigNumber.from(price.tokenPrice);
      const tokenPriceInETH = ethers.utils.formatEther(tokenPriceInWei);
      const tokenPriceUSD = parseFloat(tokenPriceInETH) * parseFloat(ethPrice);

      return {
        tokenPriceUSD: tokenPriceUSD.toFixed(9),  // Adjust decimal places as needed
        timestamp: price.timestamp
      };
    });
  } catch (error) {
    console.error('Error calculating USD price history:', error);
    throw new Error('Failed to calculate USD price history');
  }
}


export async function updateToken(
  address: string, 
  data: {
    logo?: string;
    description?: string;
    website?: string;
    telegram?: string;
    discord?: string;
    twitter?: string;
    youtube?: string;
  }
): Promise<Token> {
  try {
    const response = await axios.patch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ports/updateToken`, {
      address,
      data
    });
    return response.data;
  } catch (error) {
    console.error('Error updating token:', error);
    throw new Error('Failed to update token');
  }
}

// get all transaction associated with a particular address
export async function getTransactionsByAddress(
  address: string, 
  page: number = 1, 
  pageSize: number = 10
): Promise<TransactionResponse> {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ports/getTransactionsByAddress`, {
      params: { address, page, pageSize }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw new Error('Failed to fetch transactions');
  }
}

// POST /chats: Add a new chat message with optional reply_to
export async function addChatMessage(
  user: string, 
  token: string, 
  message: string, 
  replyTo?: number
): Promise<{ id: number }> {
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ports/addChatMessage`, {
      user,
      token,
      message,
      reply_to: replyTo  // Optional: ID of the message being replied to
    });
    return response.data;
  } catch (error) {
    console.error('Error adding chat message:', error);
    throw new Error('Failed to add chat message');
  }
}

// GET /chats: Get chat messages for a specific token
export async function getChatMessages(token: string): Promise<Array<{
  id: number;
  user: string;
  token: string;
  message: string;
  reply_to: number | null;
  timestamp: string;
}>> {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ports/getChatMessages`, {
      params: { token }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    throw new Error('Failed to fetch chat messages');
  }
}

//get all token address
export async function getAllTokenAddresses(): Promise<Array<{address: string, symbol: string}>> {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ports/getAllTokenAddresses`);
    return response.data;
  } catch (error) {
    console.error('Error fetching token addresses and symbols:', error);
    throw new Error('Failed to fetch token addresses and symbols');
  }
}

export async function getTokensByCreator(
  creatorAddress: string,
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<Token>> {
  try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ports/getTokensByCreator`, {
      params: { creatorAddress, page, pageSize }
    });
    // console.log('getTokensByCreator', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching tokens by creator:', error);
    throw new Error('Failed to fetch tokens by creator');
  }
}


//blockexplorer Get token Holders
export async function getTokenHolders(tokenAddress: string): Promise<TokenHolder[]> {
  try {
    const response = await axios.get(`https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${tokenAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${process.env.ETHERSCAN_API_KEY}`);
    const data = response.data;

    return data.items.map((item: any) => {
      return {
        address: item.address.hash,
        balance: item.value
      };
    });
  } catch (error) {
    console.error('Error fetching token holders:', error);
    throw new Error('Failed to fetch token holders');
  }
}
