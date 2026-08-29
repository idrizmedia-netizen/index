export default async function handler(req, res) {
    // Faqat POST so'rovlarini qabul qilamiz
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // history - frontenddan keladigan xabarlar massivi
    // files - yangi format: bir nechta fayl [{base64, mimeType, name}]
    // image/mimeType - eski format (orqaga moslik uchun saqlab qolindi)
    const { message, image, mimeType, history, files, system } = req.body || {};
    const API_KEY = process.env.GEMINI_API_KEY;

    // API Key mavjudligini tekshirish
    if (!API_KEY) {
        return res.status(500).json({ error: "API Key topilmadi. Vercel sozlamalarini tekshiring." });
    }

    // ---------- Kirish ma'lumotlarini tekshirish ----------
    const hasLegacyImage = !!(image && mimeType);
    const hasFiles = Array.isArray(files) && files.length > 0;

    if (!message && !hasLegacyImage && !hasFiles) {
        return res.status(400).json({ error: "Xabar yoki fayl yuborilmadi." });
    }
    if (message && message.length > 8000) {
        return res.status(400).json({ error: "Xabar juda uzun (maksimal 8000 belgi)." });
    }
    if (hasFiles && files.length > 4) {
        return res.status(400).json({ error: "Bir vaqtda maksimal 4 ta fayl yuborish mumkin." });
    }
    if (system && typeof system === 'string' && system.length > 4000) {
        return res.status(400).json({ error: "Tizim ko'rsatmasi juda uzun." });
    }

    try {
        // Model nomi o'z holicha qoldirildi
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${API_KEY}`;

        // Chat tarixini xavfsiz klonlash
        let contents = Array.isArray(history) ? [...history] : [];

        // ---------- Fayllarni normallashtirish ----------
        // Yangi (files[]) va eski (image/mimeType) formatlarni birlashtiramiz
        const attachments = [];
        if (hasFiles) {
            files.forEach((f) => {
                if (f && f.base64 && f.mimeType) {
                    attachments.push({ data: f.base64, mimeType: f.mimeType });
                }
            });
        } else if (hasLegacyImage) {
            attachments.push({ data: image, mimeType });
        }

        // Yangi xabar qismlarini tayyorlash
        let newParts = [];

        if (message) {
            newParts.push({ text: message });
        } else if (attachments.length) {
            const isPDF = attachments.some((a) => a.mimeType && a.mimeType.includes('pdf'));
            newParts.push({
                text: isPDF
                    ? "Ushbu hujjat(lar)ni tahlil qiling va qisqacha mazmunini ayting."
                    : "Ushbu tasvir(lar)ni tahlil qiling va tushuntirib bering.",
            });
        }

        // Fayllarni qo'shamiz (bir nechta bo'lishi mumkin)
        attachments.forEach((a) => {
            newParts.push({
                inline_data: {
                    mime_type: a.mimeType,
                    data: a.data,
                },
            });
        });

        // Yangi xabarni tarixga qo'shamiz
        contents.push({
            role: "user",
            parts: newParts,
        });

        // Tizim ko'rsatmasi (LaTeX formulalar qo'shilgan variant)
        // Agar frontend (masalan, AI Tutor) o'z tizim ko'rsatmasini yuborgan bo'lsa, o'shani ishlatamiz;
        // aks holda standart Ziyomap AI ko'rsatmasi ishlatiladi.
        const defaultSystemText = `Siz Ziyomap sun'iy intellektisiz. 
                    1. Barcha matematik va fizik formulalarni doimo LaTeX formatida yozing (masalan: $F=ma$, $\\int x dx$). 
                    2. Javoblaringizda Markdown formatlash elementlaridan (sarlavhalar, jadvallar) keng foydalaning.
                    3. O'zbek tilida aniq va mukammal tushuntiring.
                    4. Foydalanuvchilarga istalgan fan bo'yicha (fizika, matematika, kimyo, biologiya, tarix va b.) dars konspektlari va yechimlar bera olasiz.`;

        const systemText = (typeof system === 'string' && system.trim()) ? system.trim() : defaultSystemText;

        const requestBody = {
            contents: contents,
            systemInstruction: {
                parts: [{ text: systemText }]
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

        // ---------- Google API xatolarini tekshirish ----------
        if (data.error) {
            console.error("Google API xatosi:", data.error.message);
            // Kvota tugagan bo'lsa 429, aks holda 400 qaytaramiz — frontend buni farqlaydi
            const status = data.error.status === 'RESOURCE_EXHAUSTED' ? 429 : 400;
            return res.status(status).json({ error: data.error.message });
        }

        // ---------- Kontent bloklanganini tekshirish ----------
        const blockReason = data.promptFeedback && data.promptFeedback.blockReason;
        if (blockReason) {
            return res.status(400).json({
                error: `So'rov xavfsizlik siyosatiga ko'ra bloklandi (sabab: ${blockReason}). Iltimos, savolni boshqacha shaklda bering.`,
            });
        }

        // ---------- Javobni qaytarish ----------
        const candidate = data.candidates && data.candidates[0];
        const finishReason = candidate && candidate.finishReason;

        if (candidate?.content?.parts?.length) {
            const aiReply = candidate.content.parts.map((p) => p.text || '').join('');
            if (aiReply) {
                return res.status(200).json({
                    reply: aiReply,
                    role: "model",
                    truncated: finishReason === 'MAX_TOKENS',
                });
            }
        }

        if (finishReason === 'SAFETY') {
            return res.status(400).json({ error: "Javob xavfsizlik siyosatiga ko'ra bloklandi." });
        }

        return res.status(500).json({ error: "AI javob berishda qiynaldi yoki kontent bloklandi." });
    } catch (error) {
        console.error("Server xatosi:", error);
        return res.status(500).json({ error: "Serverda ichki xatolik: " + error.message });
    }
}
