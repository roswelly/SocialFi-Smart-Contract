import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ChatMessage {
  id: number;
  user: string;
  token: string;
  message: string;
  reply_to: number | null;
  timestamp: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
      return res.status(400).json([]);
    }

    const response = await axios.get(`${API_BASE_URL}/chats`, {
      params: { token }
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json([]);
  }
}
