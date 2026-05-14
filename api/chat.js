export default async function handler(req, res) {
    // 1. Faqat POST so'rovlarini qabul qilamiz
    if (req.method !== 'POST') {
        console.log("Xato: Noto'g'ri so'rov turi yuborildi.");
        return res.status(405).json({ error: "Faqat POST so'rovlari ruxsat etilgan" });
    }

    const { message } = req.body;
    
    // 2. Vercel sozlamalaridagi kalitni olish (image_bce6a0.png dagi nom bilan bir xil)
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        console.error("Xatolik: GEMINI_API_KEY topilmadi. Vercel sozlamalarini tekshiring.");
        return res.status(500).json({ error: "API kalit sozlanmagan" });
    }

    try {
        console.log("Google API'ga so'rov yuborilmoqda...");

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: message }]
                }]
            })
        });

        const data = await response.json();

        // 3. Google API'dan kelgan xatolikni tekshirish
        if (data.error) {
            console.error("Google API xatosi:", data.error.message);
            return res.status(400).json({ error: data.error.message });
        }

        // 4. Javobni foydalanuvchiga yuborish
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            const aiReply = data.candidates[0].content.parts[0].text;
            console.log("AI muvaffaqiyatli javob berdi.");
            res.status(200).json({ reply: aiReply });
        } else {
            console.error("Xato: Google API'dan kutilmagan javob formati keldi.");
            res.status(500).json({ error: "Javob formati noto'g'ri" });
        }

    } catch (error) {
        console.error("Serverda kutilmagan xato:", error.message);
        res.status(500).json({ error: "Ichki server xatosi yuz berdi" });
    }
}
