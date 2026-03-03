exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { prompt } = JSON.parse(event.body || '{}');

  try {
    const encoded = encodeURIComponent(prompt);
    const videoUrl = `https://video.pollinations.ai/prompt/${encoded}`;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ video: videoUrl })
    };

  } catch (e) {
    return {
      statusCode: 200,
      body: JSON.stringify({ error: e.message })
    };
  }
};
