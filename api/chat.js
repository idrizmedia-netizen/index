export default async function handler(req, res) {
    // Faqat POST so'rovlarini qabul qilamiz
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // history - frontenddan keladigan xabarlar massivi
    const { message, image, mimeType, history } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    // API Key mavjudligini tekshirish
    if (!API_KEY) {
        return res.status(500).json({ error: "API Key topilmadi. Vercel sozlamalarini tekshiring." });
    }

    try {
        // Model nomi o'z holicha qoldirildi
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${API_KEY}`;
        
        // Chat tarixini xavfsiz klonlash
        let contents = history ? [...history] : [];

        // Yangi xabar qismlarini tayyorlash
        let newParts = [];

        // Matn bo'lsa qo'shamiz
        if (message) {
            newParts.push({ text: message });
        } else if (image && !message) {
            const isPDF = mimeType && mimeType.includes('pdf');
            newParts.push({ text: isPDF ? "Ushbu hujjatni tahlil qiling va qisqacha mazmunini ayting." : "Ushbu tasvirni tahlil qiling va tushuntirib bering." });
        }

        // Fayl bo'lsa qo'shamiz
        if (image && mimeType) {
            newParts.push({
                inline_data: {
                    mime_type: mimeType,
                    data: image
                }
            });
        }

        // Yangi xabarni tarixga qo'shamiz
        contents.push({
            role: "user",
            parts: newParts
        });

        // Tizim ko'rsatmasi (LaTeX formulalar qo'shilgan variant)
        const requestBody = {
            contents: contents,
            systemInstruction: {
                parts: [{
                    text: `Siz Ziyomap sun'iy intellektisiz. 
                    1. Barcha matematik va fizik formulalarni doimo LaTeX formatida yozing (masalan: $F=ma$, $\\int x dx$). 
                    2. Javoblaringizda Markdown formatlash elementlaridan (sarlavhalar, jadvallar) keng foydalaning.
                    3. O'zbek tilida aniq va mukammal tushuntiring.
                    4. Foydalanuvchilarga istalgan fan bo'yicha (fizika, matematika, kimyo, biologiya, tarix va b.) dars konspektlari va yechimlar bera olasiz.`
                }]
            },
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 2048,
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
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
