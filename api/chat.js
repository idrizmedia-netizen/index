export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

    const { message } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    try {
        // Model nomi skrinshotdagi Gemini 3 Flash Preview'ga moslashtirildi
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Google API xatosi:", data.error.message);
            return res.status(400).json({ error: data.error.message });
        }

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
        } else {
            res.status(500).json({ error: "Javobni o'qib bo'lmadi" });
        }
    } catch (error) {
        res.status(500).json({ error: "Server xatosi: " + error.message });
    }
}
