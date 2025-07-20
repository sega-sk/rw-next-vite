export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Get API key from Vercel environment variables (server-side only)
  const apiKey = process.env.IMPORTANT_F_F_K;
  if (!apiKey) {
    console.error('Missing API key in environment variables');
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  try {
    // Forward to the actual Reel Wheel API with secure API key
    const response = await fetch('https://reel-wheel-api-x92jj.ondigitalocean.app/v1/leads/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey, // API key is handled server-side only
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('API Error:', data);
      res.status(response.status).json(data);
      return;
    }

    res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy Error:', err);
    res.status(500).json({ error: 'Failed to submit lead' });
  }
}
