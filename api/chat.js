export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Faqat POST so'rovlari ruxsat etilgan" });
    }

    const { message } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    // API Key borligini tekshirish
    if (!API_KEY) {
        return res.status(500).json({ error: "Vercel sozlamalarida API kalit topilmadi" });
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data = await response.json();

        // Google xatolik qaytarsa uni tutib qolamiz
        if (data.error) {
            console.error("Google API Error:", data.error.message);
            return res.status(400).json({ error: data.error.message });
        }

        // Javob formatini tekshirish (Eng ko'p xato shu yerda bo'ladi)
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const aiReply = data.candidates[0].content.parts[0].text;
            res.status(200).json({ reply: aiReply });
        } else {
            console.error("Noto'g'ri javob formati:", data);
            res.status(500).json({ error: "AI noto'g'ri formatda javob qaytardi" });
        }
        
    } catch (error) {
        console.error("Server Error:", error.message);
        res.status(500).json({ error: "Xatolik: " + error.message });
    }
}
