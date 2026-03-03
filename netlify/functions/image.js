exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  try {
    const { prompt } = JSON.parse(event.body);
    const safePrompt = `child-friendly, cartoon style, colorful, safe for kids, cute, high quality, ${prompt}`;

    const imageRes = await fetch(
      'https://router.huggingface.co/fal-ai/flux/dev',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HF_API_KEY}`,  // ✅ FIX 1
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: safePrompt })           // ✅ FIX 2
      }
    );

    if (!imageRes.ok) {
      const err = await imageRes.json().catch(() => ({ error: 'Unknown error' }));
      return { statusCode: imageRes.status, headers, body: JSON.stringify({ error: err.error || 'Image generation failed' }) };
    }

    const data = await imageRes.json();                        // ✅ FIX 3 — fal-ai JSON döner
    const imageUrl = data?.images?.[0]?.url || data?.image?.url || data?.url;

    if (!imageUrl) return { statusCode: 500, headers, body: JSON.stringify({ error: 'No image in response', raw: data }) };

    return { statusCode: 200, headers, body: JSON.stringify({ image: imageUrl }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
