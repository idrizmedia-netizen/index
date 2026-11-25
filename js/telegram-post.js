/* ZIYOMAP — Telegram bilan ishlash (admin sahifalari uchun).
   Bot tokeni brauzerda YO'Q: barcha so'rovlar serverdagi /api/telegram orqali ketadi,
   u tokenni Vercel muhit o'zgaruvchisidan (TELEGRAM_BOT_TOKEN) oladi va faqat adminlarga xizmat qiladi.
   Talab: sahifada js/api-auth.js ulangan bo'lishi kerak. */
const SITE = 'https://www.ziyomap.uz';

export const tgEsc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function api(action, payload) {
    if (!window.ZiyomapApiFetch) throw new Error('js/api-auth.js sahifaga ulanmagan.');
    const res = await window.ZiyomapApiFetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({ action }, payload || {})),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) throw new Error(data.error || ('Server xatosi (' + res.status + ')'));
    return data;
}

// Token sozlanganmi va (bo'lsa) TELEGRAM_CHANNEL nima — tokenning o'zi qaytarilmaydi
export const tgStatus = () => api('status');

// Admin paneldagi "kanal username" ni tekshiradi: { chat, label, username }
export function normalizeChannel(raw) {
    const v = String(raw || '').trim().replace(/^https?:\/\/t\.me\//i, '').replace(/^@/, '');
    if (!v) return { chat: '', label: '', username: '' };
    if (/^-?\d+$/.test(v)) return { chat: v, label: 'kanal (ID ' + v + ')', username: '' };
    return { chat: '@' + v, label: '@' + v, username: v };
}

// Yuborish manzilini aniqlaydi. Ustuvorlik: Vercel TELEGRAM_CHANNEL → admin paneldagi kanal → admin chat (Chat ID)
export async function resolveTarget(settings) {
    settings = settings || {};
    let st;
    try { st = await tgStatus(); }
    catch (e) { return { configured: false, ready: false, chat: '', label: '', fallback: false, username: '', error: e.message }; }
    const ch = normalizeChannel(settings.channelUsername);
    let chat = '', label = '', fallback = false, username = '';
    if (st.envChannel) {
        label = st.envChannel;
        username = st.envChannel.startsWith('@') ? st.envChannel.slice(1) : '';
    } else if (ch.chat) {
        ({ chat, label, username } = ch);
    } else if (String(settings.chatId || '').trim()) {
        chat = String(settings.chatId).trim(); label = 'admin chat'; fallback = true;
    }
    return { configured: !!st.configured, ready: !!st.configured && !!(st.envChannel || chat), chat, label, fallback, username, error: '' };
}

// Kanalga post: html — Telegram HTML (<b>, <i>, <a>); photo — data:image/... yoki https (ixtiyoriy)
export const sendPost = ({ html, photo, channel }) => api('post', { html, photo: photo || '', channel: channel || '' });
export const deletePost = ({ messageId, channel }) => api('delete', { messageId, channel: channel || '' });
// Shaxsiy xabar (foydalanuvchi yoki admin chat ID si)
export const sendMessage = (chatId, text) => api('message', { chatId: String(chatId), text });
// /start bosganlarni olish
export const getUpdates = async (offset) => (await api('updates', { offset })).updates || [];

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
