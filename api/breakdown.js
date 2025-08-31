export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { story, style } = req.body || {};
    if (!story || !style) return res.status(400).json({ error: 'story ve style gerekli' });

    const prompt =
      `Analyze this Turkish story and reply as English JSON. Story: "${story}". ` +
      `Break it into exactly 4 sequential comic book panels. For each panel, write a detailed ` +
      `visual description for an image generation AI that reflects the "${style}" style. ` +
      `Respond strictly as JSON: {"panels":[{"description":"..."}]}`;

    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }]}],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    const raw = await r.text();
    if (!r.ok) return res.status(r.status).send(raw);

    const data = JSON.parse(raw);
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const parsed = JSON.parse(text);

    return res.status(200).json(parsed); // { panels: [ { description } ] }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e) });
  }
}
