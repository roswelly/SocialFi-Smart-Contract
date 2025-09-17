import { NextApiRequest, NextApiResponse } from 'next';

export const maxAge = 24 * 60 * 60;
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
    res.status(200).send(`
      User-agent: *
      Sitemap: ${process.env.NEXT_PUBLIC_API_BASE_URL}/sitemap.xml
      Disallow: /admin
    `);
}