export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Faqat POST ruxsat etilgan" });
    }

    const { message } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    try {
        // MUHIM: Model nomi "gemini-1.5-flash-latest" shaklida yozildi
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data = await response.json();

        // Agar Google xato qaytarsa, logda to'liq ko'rinadi
        if (data.error) {
            console.error("Google'dan kelgan xato:", data.error);
            return res.status(400).json({ error: data.error.message });
        }

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
        } else {
            res.status(500).json({ error: "Kutilmagan javob formati" });
        }
    } catch (error) {
        console.error("Server xatosi:", error);
        res.status(500).json({ error: "Serverda xatolik yuz berdi" });
    }
}
