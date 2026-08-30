// Edge Runtime — bu Vercel'ga shu funksiyani Node.js emas, Edge muhitida
// ishga tushirishni buyuradi. Edge muhiti haqiqiy streaming (token-by-token)
// javob qaytarishni ishonchli qo'llab-quvvatlaydi.
export const config = { runtime: 'edge' };

function json(obj, status) {
    return new Response(JSON.stringify(obj), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

export default async function handler(req) {
    // Faqat POST so'rovlarini qabul qilamiz
    if (req.method !== 'POST') {
        return json({ error: "Method not allowed" }, 405);
    }

    let body;
    try {
        body = await req.json();
    } catch {
        body = {};
    }

    // history - frontenddan keladigan xabarlar massivi
    // files - yangi format: bir nechta fayl [{base64, mimeType, name}]
    // image/mimeType - eski format (orqaga moslik uchun saqlab qolindi)
    // stream - true bo'lsa, javob token-by-token oqim (stream) sifatida qaytariladi
    const { message, image, mimeType, history, files, system, stream } = body || {};
    const API_KEY = process.env.GEMINI_API_KEY;

    // API Key mavjudligini tekshirish
    if (!API_KEY) {
        return json({ error: "API Key topilmadi. Vercel sozlamalarini tekshiring." }, 500);
    }

    // ---------- Kirish ma'lumotlarini tekshirish ----------
    const hasLegacyImage = !!(image && mimeType);
    const hasFiles = Array.isArray(files) && files.length > 0;

    if (!message && !hasLegacyImage && !hasFiles) {
        return json({ error: "Xabar yoki fayl yuborilmadi." }, 400);
    }
    if (message && message.length > 8000) {
        return json({ error: "Xabar juda uzun (maksimal 8000 belgi)." }, 400);
    }
    if (hasFiles && files.length > 4) {
        return json({ error: "Bir vaqtda maksimal 4 ta fayl yuborish mumkin." }, 400);
    }
    if (system && typeof system === 'string' && system.length > 4000) {
        return json({ error: "Tizim ko'rsatmasi juda uzun." }, 400);
    }

    // ---------- Fayllarni normallashtirish ----------
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

    // Chat tarixini xavfsiz klonlash
    let contents = Array.isArray(history) ? [...history] : [];

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
    attachments.forEach((a) => {
        newParts.push({ inline_data: { mime_type: a.mimeType, data: a.data } });
    });
    contents.push({ role: "user", parts: newParts });

    // Tizim ko'rsatmasi — frontend (masalan, AI Tutor) o'zinikini yuborsa o'shani,
    // aks holda standart Ziyomap AI ko'rsatmasini ishlatamiz.
    const defaultSystemText = `Siz Ziyomap sun'iy intellektisiz. 
                    1. Barcha matematik va fizik formulalarni doimo LaTeX formatida yozing (masalan: $F=ma$, $\\int x dx$). 
                    2. Javoblaringizda Markdown formatlash elementlaridan (sarlavhalar, jadvallar) keng foydalaning.
                    3. O'zbek tilida aniq va mukammal tushuntiring.
                    4. Foydalanuvchilarga istalgan fan bo'yicha (fizika, matematika, kimyo, biologiya, tarix va b.) dars konspektlari va yechimlar bera olasiz.`;
    const systemText = (typeof system === 'string' && system.trim()) ? system.trim() : defaultSystemText;

    const requestBody = {
        contents,
        systemInstruction: { parts: [{ text: systemText }] },
        generationConfig: { temperature: 0.7, topP: 0.95, topK: 40, maxOutputTokens: 2048 },
    };

    const wantsStream = stream === true;
    const modelName = 'gemini-3.1-flash-lite';
    const modelUrl = wantsStream
        ? `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${API_KEY}`
        : `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;

    // ============================================================
    // ODDIY (STREAMSIZ) YO'L — Tutor/Essay va eski frontendlar uchun
    // ============================================================
    if (!wantsStream) {
        let response;
        try {
            response = await fetch(modelUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });
        } catch (error) {
            return json({ error: "Serverda ichki xatolik: " + error.message }, 500);
        }

        let data;
        try {
            data = await response.json();
        } catch {
            return json({ error: "AI javobini o'qib bo'lmadi." }, 500);
        }

        if (data.error) {
            console.error("Google API xatosi:", data.error.message);
            const status = data.error.status === 'RESOURCE_EXHAUSTED' ? 429 : 400;
            return json({ error: data.error.message }, status);
        }

        const blockReason = data.promptFeedback && data.promptFeedback.blockReason;
        if (blockReason) {
            return json({ error: `So'rov xavfsizlik siyosatiga ko'ra bloklandi (sabab: ${blockReason}). Iltimos, savolni boshqacha shaklda bering.` }, 400);
        }

        const candidate = data.candidates && data.candidates[0];
        const finishReason = candidate && candidate.finishReason;

        if (candidate?.content?.parts?.length) {
            const aiReply = candidate.content.parts.map((p) => p.text || '').join('');
            if (aiReply) {
                return json({ reply: aiReply, role: "model", truncated: finishReason === 'MAX_TOKENS' }, 200);
            }
        }

        if (finishReason === 'SAFETY') {
            return json({ error: "Javob xavfsizlik siyosatiga ko'ra bloklandi." }, 400);
        }

        return json({ error: "AI javob berishda qiynaldi yoki kontent bloklandi." }, 500);
    }

    // ============================================================
    // STREAMING YO'LI — AI Chat tab uchun (token-by-token)
    // ============================================================
    let upstream;
    try {
        upstream = await fetch(modelUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
    } catch (error) {
        return json({ error: "Serverga ulanib bo'lmadi: " + error.message }, 500);
    }

    if (!upstream.ok || !upstream.body) {
        let errMsg = "AI bilan bog'lanishda xatolik.";
        try {
            const errData = await upstream.json();
            if (errData?.error?.message) errMsg = errData.error.message;
        } catch { /* javob JSON bo'lmasligi mumkin, standart xabar qoladi */ }
        const status = upstream.status && upstream.status >= 400 ? upstream.status : 500;
        return json({ error: errMsg }, status);
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const outStream = new ReadableStream({
        async start(controller) {
            const reader = upstream.body.getReader();
            let buffer = '';
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop(); // oxirgi (tugallanmagan) qatorni saqlab qolamiz
                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed.startsWith('data:')) continue;
                        const jsonStr = trimmed.slice(5).trim();
                        if (!jsonStr || jsonStr === '[DONE]') continue;
                        let obj;
                        try {
                            obj = JSON.parse(jsonStr);
                        } catch {
                            continue; // noto'g'ri JSON qatorini o'tkazib yuboramiz
                        }
                        if (obj.error) {
                            controller.enqueue(encoder.encode(`\n\n[XATOLIK: ${obj.error.message || "noma'lum xato"}]`));
                            continue;
                        }
                        const cand = obj.candidates && obj.candidates[0];
                        const textPart = cand?.content?.parts?.map((p) => p.text || '').join('') || '';
                        if (textPart) controller.enqueue(encoder.encode(textPart));
                    }
                }
            } catch (e) {
                controller.enqueue(encoder.encode(`\n\n[XATOLIK: ulanish uzildi]`));
            } finally {
                controller.close();
            }
        },
    });

    return new Response(outStream, {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
}
