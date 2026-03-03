exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { prompt } = JSON.parse(event.body || '{}');
  if (!prompt) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Prompt gerekli' }) };
  }

  try {
    // Pollinations video endpoint (ücretsiz, key yok)
    const encoded = encodeURIComponent(prompt);
    const videoUrl = `https://video.pollinations.ai/prompt/${encoded}`;

    // URL'in erişilebilir olup olmadığını kontrol et
    const check = await fetch(videoUrl, { method: 'HEAD' });

    if (check.ok) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video: videoUrl })
      };
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({ error: 'Video oluşturulamadı, tekrar dene.' })
      };
    }
  } catch (e) {
    return {
      statusCode: 200,
      body: JSON.stringify({ error: e.message })
    };
  }
};
