exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { prompt } = JSON.parse(event.body || '{}');

  try {
    const response = await fetch(
     'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HF_API_KEY}`,
          'Content-Type': 'application/json',
          'x-wait-for-model': 'true'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { width: 512, height: 512 }
        })
      }
    );

    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const err = await response.json();
      return {
        statusCode: 200,
        body: JSON.stringify({ error: err.error || JSON.stringify(err) })
      };
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: `data:image/jpeg;base64,${base64}` })
    };

  } catch (e) {
    return {
      statusCode: 200,
      body: JSON.stringify({ error: e.message })
    };
  }
};
