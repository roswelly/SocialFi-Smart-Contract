import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ totalVolume: number }>
) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const { hours = 24 } = req.query;
    const response = await axios.get(`${API_BASE_URL}/api/volume/range`, {
      params: { hours: Number(hours) }
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ totalVolume: 0 });
  }
}
