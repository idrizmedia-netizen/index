export default async function handler(req, res) {
    // Faqat POST so'rovlarini qabul qilamiz
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // history - frontenddan keladigan xabarlar massivi
    // image o'zgaruvchisini endi umumiy 'file' deb ham tushunish mumkin
    const { message, image, mimeType, history } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    // API Key mavjudligini tekshirish
    if (!API_KEY) {
        return res.status(500).json({ error: "API Key topilmadi. Vercel sozlamalarini tekshiring." });
    }

    try {
        // Ziyomap AI uchun eng optimal model
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${API_KEY}`;
        
        // 1. Chat tarixini shakllantiramiz (agar bo'sh bo'lsa, yangi massiv)
        let contents = history || [];

        // 2. Yangi xabar uchun qismlarni (parts) tayyorlaymiz
        let newParts = [];

        // Matn bo'lsa qo'shamiz
        if (message) {
            newParts.push({ text: message });
        } else if (image && !message) {
            // Agar faqat fayl yuborilgan bo'lsa, uni turiga qarab so'rov yuboramiz
            const isPDF = mimeType && mimeType.includes('pdf');
            newParts.push({ text: isPDF ? "Ushbu hujjatni tahlil qiling va qisqacha mazmunini ayting." : "Ushbu tasvirni tahlil qiling va tushuntirib bering." });
        }

        // Fayl (Rasm, PDF yoki matnli hujjat) bo'lsa qo'shamiz
        if (image && mimeType) {
            newParts.push({
                inline_data: {
                    mime_type: mimeType, // Bu yerda 'application/pdf' yoki 'image/jpeg' ketaveradi
                    data: image // Base64 formatidagi fayl kodi
                }
            });
        }

        // 3. Yangi xabarni tarixga qo'shamiz
        contents.push({
            role: "user",
            parts: newParts
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: contents, // Barcha tarix yuboriladi
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
            
            // Ziyomap AI nomi bilan javob qaytaramiz
            res.status(200).json({ 
                reply: aiReply,
                role: "model" 
            });
        } else {
            res.status(500).json({ error: "AI javob berishda qiynaldi yoki kontent bloklandi." });
        }

    } catch (error) {
        console.error("Server xatosi:", error);
        res.status(500).json({ error: "Serverda ichki xatolik: " + error.message });
    }
}
