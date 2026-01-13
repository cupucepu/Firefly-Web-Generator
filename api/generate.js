// File: api/generate.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text } = req.body;
    
    // Kita pakai Seed acak biar gambar unik terus
    const seed = Math.floor(Math.random() * 999999);
    
    // URL Ajaib (Tanpa API Key, Tanpa Login, Kualitas HD)
    const finalUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(text)}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;

    // Langsung kirim balik ke frontend
    return res.status(200).json({ url: finalUrl });
}
