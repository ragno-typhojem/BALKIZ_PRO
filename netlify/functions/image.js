exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { prompt } = JSON.parse(event.body || '{}');

  try {
    // 1. Görsel üretim isteği gönder
    const genRes = await fetch('https://aihorde.net/api/v2/generate/async', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': '0000000000'  // anonim key
      },
      body: JSON.stringify({
        prompt: prompt,
        params: {
          width: 512,
          height: 512,
          steps: 20,
          n: 1
        },
        models: ['stable_diffusion'],
        r2: true  // base64 yerine URL döndürür
      })
    });

    const genData = await genRes.json();
    const id = genData.id;

    if (!id) {
      return {
        statusCode: 200,
        body: JSON.stringify({ error: genData.message || 'ID alınamadı' })
      };
    }

    // 2. Sonuç hazır olana kadar check et
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 3000));

      const checkRes = await fetch(`https://aihorde.net/api/v2/generate/check/${id}`);
      const checkData = await checkRes.json();

      if (checkData.done) {
        // 3. Tamamlandıysa status'tan görseli al
        const statusRes = await fetch(`https://aihorde.net/api/v2/generate/status/${id}`);
        const statusData = await statusRes.json();

        const imgUrl = statusData.generations?.[0]?.img;

        if (!imgUrl) {
          return { statusCode: 200, body: JSON.stringify({ error: 'Görsel bulunamadı' }) };
        }

        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imgUrl })
        };
      }
    }

    return { statusCode: 200, body: JSON.stringify({ error: 'Zaman aşımı (120s)' }) };

  } catch (e) {
    return { statusCode: 200, body: JSON.stringify({ error: e.message }) };
  }
};
