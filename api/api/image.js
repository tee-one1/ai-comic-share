export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    // frontend 'prompt' gönderiyor
    const { prompt, count = 1 } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'prompt gerekli' });

    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: count }
      })
    });

    const raw = await r.text();
    if (!r.ok) return res.status(r.status).send(raw);

    const data = JSON.parse(raw);
    const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) return res.status(500).json({ error: 'Görsel dönmedi (muhtemelen Imagen yetki/billing/kota)' });

    return res.status(200).json({ imageBase64: b64 });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e) });
  }
}
