export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Faqat POST ruxsat etilgan" });
    }

    const { message } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    try {
        // Model nomiga "-latest" qo'shildi yoki "gemini-pro" deb sinab ko'rish mumkin
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(400).json({ error: "Google API xatosi: " + data.error.message });
        }

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            const aiReply = data.candidates[0].content.parts[0].text;
            res.status(200).json({ reply: aiReply });
        } else {
            res.status(500).json({ error: "Javob formati noto'g'ri" });
        }
    } catch (error) {
        res.status(500).json({ error: "Server xatosi: " + error.message });
    }
}
