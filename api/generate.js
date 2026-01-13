// File: api/generate.js
// MODE: STEALTH / PENYAMARAN TOTAL

export default async function handler(req, res) {
    // 1. Setup CORS biar bisa diakses dari frontend mana aja
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { text, ratio, type, userToken } = req.body;
    
    // Ambil token dari inputan user (Prioritas) atau Environment
    const activeToken = userToken || process.env.FIREFLY_ACCESS_TOKEN;

    if (!activeToken) {
        return res.status(400).json({ error: "Token kosong! Masukkan token di menu samping." });
    }

    // LOGIKA UKURAN PIXEL (Wajib pas biar gak error)
    let width = 1024;
    let height = 1024;
    if (ratio === 'landscape') { width = 1792; height = 1024; }
    else if (ratio === 'portrait') { width = 1024; height = 1792; }
    
    // ID Project Adobe (Penting biar dikira resmi)
    const clientIds = ["clio-playground-web", "firefly-web"]; 
    const randomClientId = clientIds[Math.floor(Math.random() * clientIds.length)];

    try {
        console.log("🚀 Mengirim request ke Adobe...");
        
        const response = await fetch("https://firefly-api.adobe.io/v2/images/generate", {
            method: "POST",
            headers: {
                "X-Api-Key": randomClientId, 
                "Authorization": `Bearer ${activeToken}`,
                "Content-Type": "application/json",
                
                // --- HEADER PENYAMARAN (STEALTH MODE) ---
                // Ini bikin request terlihat seperti dari Browser Chrome asli
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
                "Referer": "https://firefly.adobe.com/",
                "Origin": "https://firefly.adobe.com",
                "Accept-Language": "en-US,en;q=0.9",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-site",
                "x-adobe-app-id": "firefly-web"
            },
            body: JSON.stringify({
                numVariations: 1,
                prompt: text,
                size: { width: width, height: height },
                contentClass: type || "photo",
                // Parameter tambahan biar hasil lebih bagus
                seeds: [Math.floor(Math.random() * 1000000)], 
                locale: "en-US" 
            })
        });

        const data = await response.json();

        // Cek kalau Token Expired / Ditolak
        if (!response.ok) {
            console.error("❌ Adobe Block/Error:", data);
            return res.status(response.status).json({ 
                error: `Ditolak Adobe (${response.status}). Token mungkin expired atau Client ID salah. Coba refresh token.` 
            });
        }

        // Ambil URL Gambar
        let imageUrl = "";
        if (data.images && data.images[0]) imageUrl = data.images[0].url;
        else if (data.outputs && data.outputs[0] && data.outputs[0].image) imageUrl = data.outputs[0].image.url;

        if (imageUrl) {
            return res.status(200).json({ url: imageUrl });
        } else {
            return res.status(500).json({ error: "Gambar berhasil dibuat tapi URL tidak ditemukan di respon." });
        }

    } catch (error) {
        console.error("❌ Server Error:", error);
        return res.status(500).json({ error: error.message });
    }
}
