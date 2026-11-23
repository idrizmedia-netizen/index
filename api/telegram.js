// Telegram bot bilan ishlash — FAQAT adminlar uchun. Bot tokeni brauzerga hech qachon chiqmaydi.
// Vercel → Settings → Environment Variables:
//   TELEGRAM_BOT_TOKEN  (majburiy)  — @BotFather bergan token
//   TELEGRAM_CHANNEL    (ixtiyoriy) — post yuboriladigan kanal, masalan @ziyomap_kanal yoki -1001234567890
//                                      (bo'lmasa admin paneldagi "kanal username" ishlatiladi)
import { json, originAllowed, verifyFirebaseToken, isAdminUser, rateLimit } from './_lib/auth.js';

export const config = { runtime: 'edge' };

const CHAT_RE = /^(@[A-Za-z0-9_]{4,32}|-?\d{5,20})$/;
const MAX_PHOTO_B64 = 700000;

function normalizeChat(raw) {
    let v = String(raw == null ? '' : raw).trim().replace(/^https?:\/\/t\.me\//i, '');
    // Sof raqamli ID ga '@' qo'shilmaydi (faqat username'larga)
    if (!/^-?\d+$/.test(v) && /^[A-Za-z0-9_]{4,32}$/.test(v)) v = '@' + v;
    return CHAT_RE.test(v) ? v : '';
}

async function tg(token, method, payload, isForm) {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, isForm
        ? { method: 'POST', body: payload }
        : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => ({}));
    if (!data.ok) {
        const e = new Error(data.description || 'Telegram xatosi (' + res.status + ')');
        e.tg = true;
        throw e;
    }
    return data.result;
}

function dataUrlToBlob(u) {
    const m = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(u);
    if (!m || m[2].length > MAX_PHOTO_B64) return null;
    const bin = atob(m[2]);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: m[1] });
}

export default async function handler(req) {
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
    if (!originAllowed(req)) return json({ error: 'Ruxsat etilmagan manba.' }, 403);

    const user = await verifyFirebaseToken(req);
    if (!user) return json({ error: 'Avval tizimga kiring.' }, 401);
    if (!(await isAdminUser(req, user))) return json({ error: 'Bu amal faqat adminlar uchun.' }, 403);

    let body;
    try { body = await req.json(); } catch { body = {}; }
    const action = String(body.action || '');

    const token = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
    const envChannel = normalizeChat(process.env.TELEGRAM_CHANNEL);

    // Holat — tokenning o'zi qaytarilmaydi, faqat "sozlangan/sozlanmagan"
    if (action === 'status') {
        return json({ ok: true, configured: !!token, envChannel: envChannel || null });
    }
    if (!token) {
        return json({ error: 'Bot tokeni sozlanmagan: Vercel → Settings → Environment Variables → TELEGRAM_BOT_TOKEN qo\u2018shing va qayta deploy qiling.' }, 503);
    }

    const limits = { post: [20, 300], delete: [20, 300], message: [200, 5000], updates: [30, 2000] };
    if (!limits[action]) return json({ error: 'Noma\u2019lum amal.' }, 400);
    if (!(await rateLimit(user.uid, 'tg-' + action, limits[action][0], limits[action][1]))) {
        return json({ error: 'Juda ko\u2018p so\u2018rov. Birozdan so\u2018ng urinib ko\u2018ring.' }, 429);
    }

    try {
        if (action === 'post') {
            const chat = envChannel || normalizeChat(body.channel);
            if (!chat) return json({ error: 'Kanal ko\u2018rsatilmagan: admin paneldagi \u201Ckanal username\u201D yoki TELEGRAM_CHANNEL ni kiriting.' }, 400);
            const html = typeof body.html === 'string' ? body.html : '';
            if (!html.trim() || html.length > 4096) return json({ error: 'Post matni bo\u2018sh yoki juda uzun.' }, 400);
            const photo = typeof body.photo === 'string' ? body.photo : '';

            let r;
            if (photo.startsWith('data:image/')) {
                const blob = dataUrlToBlob(photo);
                if (!blob) return json({ error: 'Rasm formati yoki hajmi yaroqsiz.' }, 400);
                const fd = new FormData();
                fd.append('chat_id', chat); fd.append('caption', html); fd.append('parse_mode', 'HTML');
                fd.append('photo', blob, 'photo.jpg');
                r = await tg(token, 'sendPhoto', fd, true);
            } else if (/^https:\/\/\S+$/i.test(photo)) {
                try { r = await tg(token, 'sendPhoto', { chat_id: chat, photo, caption: html, parse_mode: 'HTML' }); }
                catch { r = await tg(token, 'sendMessage', { chat_id: chat, text: html, parse_mode: 'HTML' }); }
            } else {
                r = await tg(token, 'sendMessage', { chat_id: chat, text: html, parse_mode: 'HTML' });
            }
            return json({ ok: true, message_id: r.message_id, chat });
        }

        if (action === 'delete') {
            const chat = normalizeChat(body.channel) || envChannel;
            const id = parseInt(body.messageId, 10);
            if (!chat || !id) return json({ error: 'Kanal yoki xabar ID si yo\u2018q.' }, 400);
            await tg(token, 'deleteMessage', { chat_id: chat, message_id: id });
            return json({ ok: true });
        }

        if (action === 'message') {
            const chat = normalizeChat(body.chatId);
            const text = typeof body.text === 'string' ? body.text : '';
            if (!chat) return json({ error: 'Chat ID noto\u2018g\u2018ri.' }, 400);
            if (!text.trim() || text.length > 4096) return json({ error: 'Xabar matni bo\u2018sh yoki juda uzun.' }, 400);
            // Keng tarqalgan xato: Chat ID o'rniga bot tokenidagi raqam kiritilishi
            if (chat === token.split(':')[0]) return json({ error: 'CHAT_ID_IS_BOT' }, 400);
            await tg(token, 'sendMessage', { chat_id: chat, text });
            return json({ ok: true });
        }

        if (action === 'updates') {
            const offset = Math.max(0, parseInt(body.offset, 10) || 0);
            const result = await tg(token, 'getUpdates', { offset, limit: 100, timeout: 0, allowed_updates: ['message'] });
            // Faqat kerakli maydonlar qaytariladi
            const updates = (result || []).map((u) => ({
                update_id: u.update_id,
                text: u.message && typeof u.message.text === 'string' ? u.message.text : null,
                chat_id: u.message && u.message.chat ? u.message.chat.id : null,
            }));
            return json({ ok: true, updates });
        }
    } catch (err) {
        if (err && err.tg) return json({ error: err.message }, 400);
        console.error('telegram api xatosi:', err && err.message);
        return json({ error: 'Telegramga ulanib bo\u2018lmadi.' }, 502);
    }
    return json({ error: 'Noma\u2019lum amal.' }, 400);
}
