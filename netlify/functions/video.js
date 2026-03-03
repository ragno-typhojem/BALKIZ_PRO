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

    // router.huggingface.co — yeni zorunlu endpoint
    const res = await fetch(
      'https://router.huggingface.co/hf-inference/models/cerspense/zeroscope_v2_576w',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HF_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inputs: safePrompt })
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown' }));
      return { statusCode: res.status, headers, body: JSON.stringify({ error: err.error || JSON.stringify(err) }) };
    }

    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ video: `data:video/mp4;base64,${base64}` })
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};