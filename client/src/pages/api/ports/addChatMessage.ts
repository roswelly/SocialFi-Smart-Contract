import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ id: number }>
) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    const { user, token, message, replyTo } = req.body;
    if (!user || !token || !message) {
      return res.status(400).json({ error: 'User, token, and message are required' } as any);
    }

    const response = await axios.post(`${API_BASE_URL}/chats`, {
      user,
      token,
      message,
      reply_to: replyTo
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add chat message' } as any);
  }
}
