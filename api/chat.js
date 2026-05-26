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
        // 1-O'ZGARISH QILINMADI: Sizning xohishingizga ko'ra model nomi aynan o'z holaticha qoldirildi
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${API_KEY}`;
        
        // 2-O'ZGARISH BAJARILDI: Chat tarixini xavfsiz klonlash (nusxalash) mantiqi qo'yildi
        let contents = history ? [...history] : [];

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

        // 3-O'ZGARISH BAJARILDI: Tizim ko'rsatmasi (System Instruction) qo'shildi. 
        // AI barcha fanlardan (Fizika, Matematika, Tarix, Kimyo va b.) mukammal javob berishi belgilandi.
        const requestBody = {
            contents: contents, // Barcha tarix yuboriladi
            systemInstruction: {
                parts: [{
                    text: "Siz Ziyomap sun'iy intellektisiz. Foydalanuvchilarga, ayniqsa o'qituvchi va o'quvchilarga istalgan fan bo'yicha (fizika, matematika, kimyo, biologiya, tarix, ona tili, adabiyot, ingliz tili va barcha boshqa fanlar) dars konspektlari, masalalar yechimi, metodik tavsiyalar va savollarga aniq, to'g'ri va mukammal javob berasiz. Javoblaringizda doimo o'zbek tili qoidalari va chiroyli Markdown formatlash elementlaridan (sarlavhalar, jadvallar, ro'yxatlar, qalin matnlar) keng foydalaning."
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
            body: JSON.stringify(requestBody) // So'rov tanasi tizim ko'rsatmasi bilan birga yuboriladi
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
