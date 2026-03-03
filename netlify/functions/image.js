exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { prompt } = JSON.parse(event.body || '{}');

  try {
    // Pollinations — ücretsiz, key yok, flux modeli kullanıyor
    const encoded = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?model=flux&width=768&height=768&nologo=true&enhance=true`;

    // URL'in gerçekten döndüğünü doğrula
    const check = await fetch(imageUrl);
    if (!check.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ error: 'Görsel alınamadı' })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageUrl })
    };

  } catch (e) {
    return {
      statusCode: 200,
      body: JSON.stringify({ error: e.message })
    };
  }
};
