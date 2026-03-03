exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  try {
    const { prompt } = JSON.parse(event.body);
    const safePrompt = `child-friendly, colorful, cute, safe for kids, animated, ${prompt}`;

    const videoRes = await fetch(
      'https://router.huggingface.co/fal-ai/wan/t2v-14b',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HF_API_KEY}`,  // ✅ FIX 1
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: safePrompt })           // ✅ FIX 2
      }
    );

    if (!videoRes.ok) {
      const err = await videoRes.json().catch(() => ({ error: 'Unknown' }));
      return { statusCode: videoRes.status, headers, body: JSON.stringify({ error: err.error || JSON.stringify(err) }) };
    }

    const data = await videoRes.json();                        // ✅ FIX 3
    const videoUrl = data?.video?.url || data?.url;

    if (!videoUrl) return { statusCode: 500, headers, body: JSON.stringify({ error: 'No video in response', raw: data }) };

    return { statusCode: 200, headers, body: JSON.stringify({ video: videoUrl }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
