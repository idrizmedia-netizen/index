// api/chat.js
export default async function handler(req, res) {
    const { message } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY; // Vercel-dagi kalitni shu yerda oladi

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data = await response.json();
        const aiReply = data.candidates[0].content.parts[0].text;
        
        res.status(200).json({ reply: aiReply });
    } catch (error) {
        res.status(500).json({ error: "API bilan bog'lanishda xatolik" });
    }
}
