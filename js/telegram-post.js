/* ZIYOMAP — Telegram kanalga post yuborish yordamchisi (admin sahifalari uchun).
   Bot tokeni va kanal "site-content/telegram-settings" hujjatidan olinadi (u faqat adminga ochiq). */
const SITE = 'https://www.ziyomap.uz';

export const tgEsc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Sozlamalardan yuborish manzilini aniqlaydi: avval kanal, bo'lmasa admin chat (Chat ID)
export function resolveTarget(s) {
    s = s || {};
    const token = String(s.botToken || '').trim();
    const ch = String(s.channelUsername || '').trim().replace(/^https?:\/\/t\.me\//i, '').replace(/^@/, '');
    let chat = '', label = '', fallback = false;
    if (ch) {
        const numeric = /^-?\d+$/.test(ch);
        chat = numeric ? ch : '@' + ch;
        label = numeric ? 'kanal (ID ' + ch + ')' : '@' + ch;
    } else if (String(s.chatId || '').trim()) {
        chat = String(s.chatId).trim();
        label = 'admin chat';
        fallback = true;
    }
    return { token, chat, label, fallback, channelName: ch };
}

async function call(token, method, payload, isForm) {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, isForm
        ? { method: 'POST', body: payload }
        : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => ({}));
    if (!data.ok) throw new Error(data.description || 'Telegram xatosi (' + res.status + ')');
    return data.result;
}

function dataUrlToBlob(u) {
    const [head, b64] = u.split(',');
    const mime = head.match(/data:([^;]+)/)[1];
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
}

// html — Telegram HTML (faqat <b>, <i>, <a>); photo — data:image/... yoki https havola (ixtiyoriy)
export async function sendPost({ token, chat, html, photo }) {
    if (!token || !chat) throw new Error('Telegram sozlanmagan (bot tokeni yoki kanal yo\'q).');
    photo = photo || '';
    if (photo.startsWith('data:image/')) {
        const fd = new FormData();
        fd.append('chat_id', chat);
        fd.append('caption', html);
        fd.append('parse_mode', 'HTML');
        fd.append('photo', dataUrlToBlob(photo), 'photo.jpg');
        return call(token, 'sendPhoto', fd, true);
    }
    if (/^https:\/\//i.test(photo)) {
        try { return await call(token, 'sendPhoto', { chat_id: chat, photo, caption: html, parse_mode: 'HTML' }); }
        catch (e) { /* rasmni Telegram ololmasa — oddiy xabar sifatida yuboramiz */ }
    }
    return call(token, 'sendMessage', { chat_id: chat, text: html, parse_mode: 'HTML' });
}

export function deletePost({ token, chat, messageId }) {
    return call(token, 'deleteMessage', { chat_id: chat, message_id: messageId });
}

// Yangilik uchun post matni: sarlavha + matn (sig'adigani) + "Batafsil" havolasi
export function buildNewsHtml(n, fallbackLink) {
    let link = String(n.link || '').trim() || fallbackLink || SITE + '/';
    if (!/^https?:\/\//i.test(link)) link = SITE + '/' + link.replace(/^\/+/, '');
    const limit = n.imageUrl ? 1000 : 4000; // rasmli postda izoh 1024 belgigacha
    const title = String(n.title || '').trim().slice(0, 150);
    let body = String(n.body || '').trim();
    const room = limit - title.length - 40;
    if (body.length > room) body = body.slice(0, Math.max(0, room - 1)).replace(/\s+\S*$/, '') + '…';
    return `<b>${tgEsc(title)}</b>\n\n${tgEsc(body)}\n\n<a href="${tgEsc(link)}">📖 Batafsil</a>`;
}
