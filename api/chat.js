export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send();

    const { message } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    try {
        // Eng barqaror model va versiya kombinatsiyasi
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Aniq xato:", data.error.message);
            return res.status(400).json({ error: data.error.message });
        }

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
        } else {
            // Agar javob bo'sh kelsa, logda tekshirish uchun
            console.log("Kutilmagan javob:", JSON.stringify(data));
            res.status(500).json({ error: "AI javob bera olmadi" });
        }
    } catch (error) {
        res.status(500).json({ error: "Server xatosi: " + error.message });
    }
}
