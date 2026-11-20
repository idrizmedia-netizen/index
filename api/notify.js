// Adminga Telegram orqali bildirishnoma yuborish — bot tokeni faqat serverda (Vercel env) saqlanadi.
// Vercel → Settings → Environment Variables: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
import { json, originAllowed, verifyFirebaseToken, rateLimit } from './_lib/auth.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
    if (!originAllowed(req)) return json({ error: 'Ruxsat etilmagan manba.' }, 403);

    const user = await verifyFirebaseToken(req);
    if (!user) return json({ error: 'Avval tizimga kiring.' }, 401);

    if (!(await rateLimit(user.uid, 'notify', 5, 30))) {
        return json({ error: "Juda ko'p so'rov. Birozdan so'ng urinib ko'ring." }, 429);
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) return json({ ok: false, skipped: true }, 200); // sozlanmagan — jim o'tkazamiz

    let body;
    try { body = await req.json(); } catch { body = {}; }
    const text = typeof body.text === 'string' ? body.text.trim().slice(0, 1000) : '';
    if (!text) return json({ error: "Matn bo'sh." }, 400);

    try {
        const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text }),
        });
        return json({ ok: r.ok }, r.ok ? 200 : 502);
    } catch {
        return json({ error: 'Telegramga ulanib bo\u2018lmadi.' }, 502);
    }
}
