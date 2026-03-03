// server.js / api/image endpoint
app.post('/api/image', async (req, res) => {
  const { prompt } = req.body;
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HF_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inputs: prompt })
      }
    );

    if(!response.ok) {
      const err = await response.json();
      // Model yükleniyorsa
      if(err.error?.includes('loading')) {
        return res.json({ error: 'loading' });
      }
      return res.json({ error: err.error || 'Hata' });
    }

    // Binary blob döner → base64'e çevir
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    res.json({ image: `data:image/jpeg;base64,${base64}` });

  } catch(e) {
    res.json({ error: e.message });
  }
});
