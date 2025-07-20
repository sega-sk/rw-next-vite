import type { Request, Response } from 'express';

export default async function leadProxy(req: Request, res: Response) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Use Vercel env variable IMPORTANT_F_F_K for the API key
  const apiKey = process.env.IMPORTANT_F_F_K;
  if (!apiKey) {
    res.status(500).json({ error: 'Missing API key' });
    return;
  }

  try {
    const response = await fetch('https://leads-api.dealertower.com/v1/leads/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send lead' });
  }
}
