export default async function handler(req, res) {
    // Faqat POST so'rovlarini qabul qilamiz
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { message, image, mimeType } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    // API Key mavjudligini tekshirish
    if (!API_KEY) {
        return res.status(500).json({ error: "API Key topilmadi. Vercel sozlamalarini tekshiring." });
    }

    try {
        // Gemini 1.5 Flash modeli - multimodal (rasm + matn) uchun eng mos va tezkor model
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
        
        // Google API uchun xabar strukturasini shakllantirish
        const promptParts = [];

        // Agar matn bo'lsa qo'shamiz
        if (message) {
            promptParts.push({ text: message });
        } else if (image) {
            // Agar faqat rasm bo'lsa, standart so'rov yuboramiz
            promptParts.push({ text: "Ushbu tasvirni tahlil qiling va tushuntirib bering." });
        }

        // Agar rasm (Base64) yuborilgan bo'lsa, uni struktura qo'shamiz
        if (image && mimeType) {
            promptParts.push({
                inline_data: {
                    mime_type: mimeType,
                    data: image // Frontenddan kelayotgan toza Base64 kodi
                }
            });
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: promptParts
                }],
                // AI javobini biroz cheklash yoki sozlash mumkin (ixtiyoriy)
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.95,
                    topK: 40,
                    maxOutputTokens: 2048,
                }
            })
        });

        const data = await response.json();

        // Xatoliklarni tekshirish
        if (data.error) {
            console.error("Google API xatosi:", data.error.message);
            return res.status(400).json({ error: data.error.message });
        }

        // Javobni qaytarish
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            const aiReply = data.candidates[0].content.parts[0].text;
            res.status(200).json({ reply: aiReply });
        } else {
            res.status(500).json({ error: "AI javob berishda qiynaldi yoki kontent bloklandi." });
        }

    } catch (error) {
        console.error("Server xatosi:", error);
        res.status(500).json({ error: "Serverda ichki xatolik: " + error.message });
    }
}








