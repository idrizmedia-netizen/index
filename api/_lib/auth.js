// Umumiy xavfsizlik yordamchilari (Edge Runtime): Firebase ID token tekshiruvi,
// rate limit va origin tekshiruvi. "_lib" papkasi Vercel'da alohida endpoint bo'lmaydi.

const PROJECT_ID = 'ziyomap';
const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

export function json(obj, status = 200, extra = {}) {
    return new Response(JSON.stringify(obj), {
        status,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra },
    });
}

// ---------- Origin tekshiruvi (brauzerdan kelmagan so'rovlar ham rad etilmaydi, lekin token baribir shart) ----------
const BASE_ORIGINS = [
    'https://www.ziyomap.uz',
    'https://ziyomap.uz',
    'https://ziyomap.vercel.app',
];
export function originAllowed(req) {
    const origin = req.headers.get('origin');
    if (!origin) return true; // same-origin GET/server-to-server
    const extra = (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
    if (BASE_ORIGINS.includes(origin) || extra.includes(origin)) return true;
    if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return true;
    return false;
}

// ---------- Firebase ID token (RS256 JWT) tekshiruvi ----------
let jwksCache = { keys: null, exp: 0 };

async function getJwks() {
    const now = Date.now();
    if (jwksCache.keys && jwksCache.exp > now) return jwksCache.keys;
    const res = await fetch(JWKS_URL);
    if (!res.ok) throw new Error('JWKS yuklanmadi');
    const data = await res.json();
    const cc = res.headers.get('cache-control') || '';
    const m = cc.match(/max-age=(\d+)/);
    const ttl = (m ? parseInt(m[1], 10) : 3600) * 1000;
    jwksCache = { keys: data.keys || [], exp: now + Math.min(ttl, 6 * 3600 * 1000) };
    return jwksCache.keys;
}

function b64urlToBytes(str) {
    const pad = '='.repeat((4 - (str.length % 4)) % 4);
    const b64 = (str + pad).replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
}
function b64urlToJson(str) {
    return JSON.parse(new TextDecoder().decode(b64urlToBytes(str)));
}

// Muvaffaqiyatli bo'lsa { uid, email } qaytaradi, aks holda null.
export async function verifyFirebaseToken(req) {
    const auth = req.headers.get('authorization') || '';
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (!m) return null;
    const token = m[1].trim();
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    try {
        const header = b64urlToJson(parts[0]);
        const payload = b64urlToJson(parts[1]);
        if (header.alg !== 'RS256' || !header.kid) return null;

        const nowSec = Math.floor(Date.now() / 1000);
        if (payload.aud !== PROJECT_ID) return null;
        if (payload.iss !== `https://securetoken.google.com/${PROJECT_ID}`) return null;
        if (!payload.sub || typeof payload.sub !== 'string' || payload.sub.length > 128) return null;
        if (!payload.exp || payload.exp < nowSec - 5) return null;
        if (payload.iat && payload.iat > nowSec + 300) return null;

        let keys = await getJwks();
        let jwk = keys.find((k) => k.kid === header.kid);
        if (!jwk) { // kalitlar almashgan bo'lishi mumkin — keshni yangilab qayta urinamiz
            jwksCache.exp = 0;
            keys = await getJwks();
            jwk = keys.find((k) => k.kid === header.kid);
        }
        if (!jwk) return null;

        const key = await crypto.subtle.importKey(
            'jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']
        );
        const ok = await crypto.subtle.verify(
            'RSASSA-PKCS1-v1_5', key,
            b64urlToBytes(parts[2]),
            new TextEncoder().encode(parts[0] + '.' + parts[1])
        );
        if (!ok) return null;
        return { uid: payload.sub, email: payload.email || null };
    } catch {
        return null;
    }
}

// ---------- Admin tekshiruvi ----------
// js/admin-guard.js va firestore.rules dagi owner UID bilan bir xil bo'lishi shart
const OWNER_UID = 'PhFPRmGQdnVNu3dsepFLem5Xzmg2';

export function bearerToken(req) {
    const m = (req.headers.get('authorization') || '').match(/^Bearer\s+(.+)$/i);
    return m ? m[1].trim() : '';
}

// Foydalanuvchi owner yoki "admins" ro'yxatida ekanini tekshiradi.
// Firestore REST'ga FOYDALANUVCHINING O'Z tokeni bilan murojaat qilinadi, shuning uchun
// firestore.rules ("admins/{uid}" — faqat o'z hujjatini o'qiydi) ham qo'llanadi; servis kaliti kerak emas.
export async function isAdminUser(req, user) {
    if (!user || !user.uid) return false;
    if (user.uid === OWNER_UID) return true;
    try {
        const r = await fetch(
            `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/admins/${encodeURIComponent(user.uid)}`,
            { headers: { Authorization: 'Bearer ' + bearerToken(req) } }
        );
        return r.status === 200;
    } catch {
        return false;
    }
}

// ---------- Rate limit ----------
// Upstash Redis (UPSTASH_REDIS_REST_URL va UPSTASH_REDIS_REST_TOKEN) sozlangan bo'lsa — barcha
// instansiyalar uchun ishonchli hisoblagich. Aks holda — xotiradagi (har bir instansiya uchun alohida)
// taxminiy hisoblagich: bu zararli ommaviy hujumni sekinlashtiradi, lekin to'liq kafolat bermaydi.
const mem = new Map();

export async function rateLimit(uid, bucket, perMinute, perDay) {
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    const day = new Date(now).toISOString().slice(0, 10);
    const kMin = `rl:${bucket}:${uid}:m:${minute}`;
    const kDay = `rl:${bucket}:${uid}:d:${day}`;

    const url = process.env.UPSTASH_REDIS_REST_URL;
    const tok = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (url && tok) {
        try {
            const res = await fetch(`${url}/pipeline`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
                body: JSON.stringify([
                    ['INCR', kMin], ['EXPIRE', kMin, 90],
                    ['INCR', kDay], ['EXPIRE', kDay, 90000],
                ]),
            });
            const r = await res.json();
            const cMin = r[0] && r[0].result;
            const cDay = r[2] && r[2].result;
            if (typeof cMin === 'number' && typeof cDay === 'number') {
                return cMin <= perMinute && cDay <= perDay;
            }
        } catch { /* Upstash ishlamasa — xotiradagi variantga tushamiz */ }
    }

    // xotirada: eski yozuvlarni vaqti-vaqti bilan tozalaymiz
    if (mem.size > 5000) {
        for (const [k, v] of mem) if (v.exp < now) mem.delete(k);
    }
    function bump(k, ttlMs) {
        const e = mem.get(k);
        if (!e || e.exp < now) { mem.set(k, { n: 1, exp: now + ttlMs }); return 1; }
        e.n++;
        return e.n;
    }
    return bump(kMin, 90000) <= perMinute && bump(kDay, 90000000) <= perDay;
}
