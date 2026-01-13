// File: api/generate.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text } = req.body;
    
    // Ambil kunci dari Environment Variable Vercel
    const apiKey = process.env.FIREFLY_API_KEY;
    const token = process.env.FIREFLY_ACCESS_TOKEN; // Ingat token ini harus update/refresh
    
    // Logic Request ke Adobe (Sama kayak Python tadi, tapi versi JS)
    try {
        const response = await fetch("https://firefly-api.adobe.io/v2/images/generate", {
            method: "POST",
            headers: {
                "X-Api-Key": apiKey,
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                numVariations: 1,
                prompt: text,
                size: { width: 1024, height: 1024 }
            })
        });

        const data = await response.json();

        if (response.ok && data.images && data.images[0]) {
            return res.status(200).json({ url: data.images[0].url });
        } else {
            return res.status(500).json({ error: JSON.stringify(data) });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
