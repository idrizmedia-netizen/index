/* ZIYOMAP — Admin: maqola yozish (Firestore) + Telegram kanalga avtomatik yuborish.
   Haqiqiy himoya Firestore qoidalarida (articles / article-drafts — faqat admin yozadi).
   Telegram: bot tokeni brauzerda yo'q — /api/telegram orqali, Vercel'dagi TELEGRAM_BOT_TOKEN bilan. */
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';
import {
    getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
    writeBatch, query, orderBy, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';
import { resolveTarget, sendPost, deletePost } from './telegram-post.js';

const firebaseConfig = {
    apiKey: 'AIzaSyA2LiNy7o7l6kn1FTvOcXqBs14M3PVsjbI',
    authDomain: 'ziyomap.firebaseapp.com',
    projectId: 'ziyomap',
    storageBucket: 'ziyomap.firebasestorage.app',
    messagingSenderId: '982123868162',
    appId: '1:982123868162:web:6845723988c030fcd1f71b',
};
const SITE = 'https://www.ziyomap.uz';
const MD = window.ZiyomapMD;
const $ = (id) => document.getElementById(id);
const esc = (s) => MD.esc(s);

let db, auth;
let tg = { ready: false, chat: '', label: '', username: '' };
let items = [];            // [{id, status, ...data}]
let cur = null;            // joriy tahrirlanayotgan: {id, status, telegramMessageId, publishedAt}
let dirty = false;

// Firestore xatosini tushunarli qiladi (ruxsat xatosida sabab va yechimni ko'rsatadi)
function explain(e) {
    if (e && (e.code === 'permission-denied' || /insufficient permissions/i.test(e.message || ''))) {
        const uid = auth && auth.currentUser ? auth.currentUser.uid : '(aniqlanmadi)';
        return 'Firestore ruxsat bermadi. Ehtimoliy sabablar:' +
            '<br>1) <b>firestore.rules</b> Firebase konsolida hali <b>Publish</b> qilinmagan (<code>articles</code> va <code>article-drafts</code> qoidalari yo\'q).' +
            '<br>2) Hisobingiz admin emas. Sizning UID: <code>' + esc(uid) + '</code> — uni qoidalardagi <code>ownerUid()</code> ga yozing yoki Firestore\'da <code>admins</code> kolleksiyasiga shu nomli hujjat qo\'shing.';
    }
    return esc((e && e.message) || String(e));
}

/* ───────── Yordamchilar ───────── */
function notify(kind, html) {
    $('msg').innerHTML = html ? `<div class="notice ${kind}">${html}</div>` : '';
    if (html) window.scrollTo({ top: 0, behavior: 'smooth' });
}
function fmt(ts) {
    const d = ts && (ts.toDate ? ts.toDate() : ts.seconds ? new Date(ts.seconds * 1000) : null);
    return d ? d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
}
function busy(btn, on, text) {
    btn.disabled = on;
    if (text !== undefined) btn.dataset.t = btn.dataset.t || btn.innerHTML;
    if (on && text) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ' + text;
    if (!on && btn.dataset.t) { btn.innerHTML = btn.dataset.t; delete btn.dataset.t; }
}
const show = (id, on) => $(id).classList.toggle('hidden', !on);

/* ───────── Telegram ───────── */
async function loadTelegram() {
    const box = $('tg-status');
    let settings = {};
    try {
        const snap = await getDoc(doc(db, 'site-content', 'telegram-settings'));
        settings = snap.exists() ? snap.data() : {};
    } catch (e) { console.error(e); }
    tg = await resolveTarget(settings);

    if (tg.ready) {
        box.className = 'notice ok';
        box.innerHTML = `<i class="fa-brands fa-telegram"></i> Telegram ulangan: maqolalar <b>${esc(tg.label)}</b> ${tg.fallback ? 'chatiga' : 'kanaliga'} yuboriladi. Bot kanalda <b>administrator</b> bo'lishi shart.`;
        $('tg-note').textContent = '';
    } else {
        box.className = 'notice warn';
        box.innerHTML = tg.configured
            ? `Telegram kanal ko'rsatilmagan: <a href="admin.html">Admin panel → Telegram</a> bo'limida <b>kanal username</b>ni kiriting. Hozircha maqolalar faqat saytda chiqadi.`
            : `Bot tokeni hali sozlanmagan: Vercel → Settings → Environment Variables → <b>TELEGRAM_BOT_TOKEN</b> qo'shib, qayta deploy qiling.${tg.error ? ' <small>(' + esc(tg.error) + ')</small>' : ''} Hozircha maqolalar faqat saytda chiqadi.`;
        $('f-tg').checked = false;
        $('tg-note').textContent = 'Telegram sozlanmagani uchun yuborilmaydi.';
    }
}

function buildCaption(a, id) {
    const link = `${SITE}/maqola.html?id=${encodeURIComponent(id)}`;
    let excerpt = (a.excerpt || MD.plain(a.body || '')).trim();
    if (excerpt.length > 500) excerpt = excerpt.slice(0, 497).replace(/\s+\S*$/, '') + '…';
    const tag = (a.category || '').replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_+|_+$/g, '');
    return `<b>${esc(a.title)}</b>\n\n${esc(excerpt)}\n\n<a href="${esc(link)}">📖 To'liq o'qish</a>` + (tag ? `\n\n#${tag}` : '');
}

// Maqolani Telegram kanalga yuboradi (server orqali) va message_id ni saqlaydi
async function sendAndRecord(a, id) {
    if (!tg.ready) throw new Error('Telegram sozlanmagan (bot tokeni yoki kanal yo\'q).');
    const r = await sendPost({ html: buildCaption(a, id), photo: a.coverUrl || '', channel: tg.chat });
    const patch = { telegramMessageId: r.message_id, telegramChat: r.chat || tg.chat || null, telegramPostedAt: serverTimestamp() };
    if (tg.username) patch.telegramLink = `https://t.me/${tg.username}/${r.message_id}`;
    await updateDoc(doc(db, 'articles', id), patch);
    return patch;
}

/* ───────── Ma'lumotlarni yuklash / ro'yxat ───────── */
async function loadAll() {
    $('list-box').textContent = 'Yuklanmoqda...';
    try {
        const [pub, dr] = await Promise.all([
            getDocs(query(collection(db, 'articles'), orderBy('publishedAt', 'desc'))),
            getDocs(query(collection(db, 'article-drafts'), orderBy('updatedAt', 'desc'))),
        ]);
        items = [
            ...dr.docs.map((d) => ({ id: d.id, status: 'draft', ...d.data() })),
            ...pub.docs.map((d) => ({ id: d.id, status: 'published', ...d.data() })),
        ];
        renderList();
        $('cats').innerHTML = [...new Set(['Fizika', 'Kimyo', 'Biologiya', 'Matematika', 'Ta\'lim', 'Yangiliklar',
            ...items.map((x) => x.category).filter(Boolean)])].map((c) => `<option value="${esc(c)}">`).join('');
    } catch (e) {
        console.error(e);
        $('list-box').innerHTML = `<div class="notice err">Yuklab bo'lmadi. ${explain(e)}</div>`;
    }
}

function renderList() {
    if (!items.length) { $('list-box').innerHTML = '<p class="sub" style="margin:0">Hali maqola yo\'q. «Yangi maqola» tugmasini bosing.</p>'; return; }
    $('list-box').innerHTML = items.map((a) => `
        <div class="item" data-id="${esc(a.id)}" data-st="${a.status}">
            ${a.coverUrl ? `<img src="${esc(a.coverUrl)}" alt="">` : '<img alt="">'}
            <div class="t"><b>${esc(a.title || '(sarlavhasiz)')}</b>
                <small>${esc(a.category || 'Kategoriyasiz')} · ${esc(fmt(a.status === 'published' ? a.publishedAt : a.updatedAt))}</small></div>
            <span class="badge ${a.status === 'published' ? 'pub' : 'dr'}">${a.status === 'published' ? 'Nashr etilgan' : 'Qoralama'}</span>
            ${a.telegramMessageId ? '<span class="badge tg"><i class="fa-brands fa-telegram"></i> Yuborilgan</span>' : ''}
            <div class="acts">
                <button class="btn sm" data-act="edit"><i class="fa-solid fa-pen"></i> Tahrirlash</button>
                ${a.status === 'published' ? `<a class="btn sm" href="maqola.html?id=${encodeURIComponent(a.id)}" target="_blank" rel="noopener"><i class="fa-solid fa-eye"></i></a>` : ''}
                <button class="btn sm danger" data-act="del"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>`).join('');
}

/* ───────── Muharrir ───────── */
function updatePreview() {
    $('prev').innerHTML = MD.render($('f-body').value) || '<p class="hint">Oldindan ko\'rish shu yerda chiqadi…</p>';
    const words = MD.plain($('f-body').value).split(/\s+/).filter(Boolean).length;
    $('body-count').textContent = words + ' ta so\'z · ≈' + MD.readMinutes($('f-body').value) + ' daqiqalik o\'qish';
    $('ex-count').textContent = $('f-excerpt').value.length + '/300';
    const c = $('f-cover').value.trim();
    const img = $('cover-prev');
    if (c) { img.src = c; show('cover-prev', true); } else show('cover-prev', false);
}

function openEditor(a) {
    cur = a ? { id: a.id, status: a.status, telegramMessageId: a.telegramMessageId || null, publishedAt: a.publishedAt || null }
            : { id: doc(collection(db, 'article-drafts')).id, status: 'new', telegramMessageId: null, publishedAt: null };
    $('f-title').value = a ? a.title || '' : '';
    $('f-cat').value = a ? a.category || '' : '';
    $('f-link').value = a ? a.externalLink || '' : '';
    $('f-excerpt').value = a ? a.excerpt || '' : '';
    $('f-cover').value = a ? a.coverUrl || '' : '';
    $('f-body').value = a ? a.body || '' : '';
    $('f-file').value = '';
    const isPub = cur.status === 'published';
    $('edit-title').textContent = a ? 'Maqolani tahrirlash' : 'Yangi maqola';
    $('pub-label').textContent = isPub ? 'Yangilash' : 'Nashr qilish';
    show('btn-draft', !isPub);
    show('btn-unpub', isPub);
    show('btn-resend', isPub);
    $('btn-resend').lastChild.textContent = cur.telegramMessageId ? ' Telegramga qayta yuborish' : ' Telegramga yuborish';
    // Telegram belgisi: yangi nashr uchun yoqilgan; allaqachon yuborilgan bo'lsa o'chiq
    $('f-tg').checked = tg.ready && !cur.telegramMessageId;
    $('f-tg').disabled = !tg.ready;
    show('view-list', false); show('view-edit', true);
    dirty = false; notify('', '');
    updatePreview();
    window.scrollTo({ top: 0 });
}

function closeEditor() {
    if (dirty && !confirm('Saqlanmagan o\'zgarishlar bor. Chiqib ketasizmi?')) return;
    dirty = false; cur = null;
    show('view-edit', false); show('view-list', true);
}

function collect() {
    const title = $('f-title').value.trim();
    const body = $('f-body').value.trim();
    const externalLink = $('f-link').value.trim();
    const coverUrl = $('f-cover').value.trim();
    const category = $('f-cat').value.trim();
    let excerpt = $('f-excerpt').value.trim();
    if (!excerpt && body) {
        excerpt = MD.plain(body).slice(0, 200);
        if (MD.plain(body).length > 200) excerpt = excerpt.replace(/\s+\S*$/, '') + '…';
    }
    return { title, body, externalLink, coverUrl, category, excerpt };
}

function validate(d, forPublish) {
    if (d.title.length < 5) return 'Sarlavha kamida 5 ta belgidan iborat bo\'lsin.';
    if (forPublish && !d.externalLink && d.body.length < 30) return 'Matn juda qisqa (kamida 30 belgi) yoki tashqi havola kiriting.';
    if (d.body.length > 100000) return 'Matn juda uzun.';
    if (d.externalLink && !/^https?:\/\/\S+$/i.test(d.externalLink)) return 'Tashqi havola http:// yoki https:// bilan boshlansin.';
    if (d.coverUrl && !/^(https:\/\/\S+|data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+)$/i.test(d.coverUrl)) return 'Muqova rasmi https havola bo\'lishi kerak (yoki rasm yuklang).';
    if (d.coverUrl.length > 400000) return 'Muqova rasmi juda katta.';
    return null;
}

function baseData(d) {
    const u = auth.currentUser;
    return { ...d, authorUid: u ? u.uid : null, authorName: u ? (u.displayName || u.email || '') : '', updatedAt: serverTimestamp() };
}

async function saveDraft() {
    const d = collect(); const err = validate(d, false);
    if (err) return notify('err', esc(err));
    const btn = $('btn-draft'); busy(btn, true, 'Saqlanmoqda...');
    try {
        await setDoc(doc(db, 'article-drafts', cur.id), { ...baseData(d), status: 'draft' }, { merge: true });
        cur.status = 'draft'; dirty = false;
        notify('ok', 'Qoralama saqlandi ✓');
        await loadAll();
    } catch (e) { notify('err', 'Saqlab bo\'lmadi. ' + explain(e)); }
    busy(btn, false);
}

async function publish() {
    const d = collect(); const err = validate(d, true);
    if (err) return notify('err', esc(err));
    const wantTg = $('f-tg').checked && !$('f-tg').disabled;
    const btn = $('btn-publish'); busy(btn, true, 'Nashr qilinmoqda...');
    let id = cur.id;
    try {
        const wasPublished = cur.status === 'published';
        if (wasPublished) {
            await updateDoc(doc(db, 'articles', id), { ...baseData(d), status: 'published' });
        } else {
            const batch = writeBatch(db);
            batch.set(doc(db, 'articles', id), { ...baseData(d), status: 'published', publishedAt: serverTimestamp() });
            batch.delete(doc(db, 'article-drafts', id));
            await batch.commit();
            cur.status = 'published';
        }
        dirty = false;
    } catch (e) {
        busy(btn, false);
        return notify('err', 'Nashr qilib bo\'lmadi. ' + explain(e));
    }

    let tgMsg = '';
    if (wantTg && !cur.telegramMessageId) {
        busy(btn, true, 'Telegramga yuborilmoqda...');
        try {
            const patch = await sendAndRecord(d, id);
            cur.telegramMessageId = patch.telegramMessageId;
            tgMsg = ' va Telegram kanalga yuborildi ✓';
        } catch (e) {
            tgMsg = `<br><b>Telegramga yuborib bo'lmadi:</b> ${esc(e.message)}. Maqola saytda nashr etildi — «Telegramga yuborish» tugmasi bilan qayta urinib ko'ring.`;
        }
    }
    busy(btn, false);
    const url = `maqola.html?id=${encodeURIComponent(id)}`;
    const failed = tgMsg.includes('<b>');
    const text = `Maqola nashr etildi${failed ? '' : tgMsg} — <a href="${url}" target="_blank" rel="noopener">saytda ko'rish</a>.${failed ? tgMsg : ''}`;
    await loadAll();
    openEditor(items.find((x) => x.id === id));
    notify(failed ? 'warn' : 'ok', text); // openEditor xabarni tozalaydi — natijani oxirida ko'rsatamiz
}

async function resend() {
    if (!cur || cur.status !== 'published') return;
    if (cur.telegramMessageId && !confirm('Bu maqola Telegramga allaqachon yuborilgan. Yana bir marta yuborilsinmi (takroriy post chiqadi)?')) return;
    const d = collect(); const err = validate(d, true);
    if (err) return notify('err', esc(err));
    const btn = $('btn-resend'); busy(btn, true, 'Yuborilmoqda...');
    try {
        const patch = await sendAndRecord(d, cur.id);
        cur.telegramMessageId = patch.telegramMessageId;
        notify('ok', 'Telegram kanalga yuborildi ✓');
        await loadAll();
    } catch (e) { notify('err', 'Telegramga yuborib bo\'lmadi: ' + esc(e.message)); }
    busy(btn, false);
}

async function unpublish() {
    if (!cur || cur.status !== 'published') return;
    if (!confirm('Maqola saytdan olib tashlanib, qoralamaga qaytariladi. Davom etamizmi?\n(Telegramdagi post o\'zgarmaydi.)')) return;
    const d = collect();
    try {
        const batch = writeBatch(db);
        batch.set(doc(db, 'article-drafts', cur.id), { ...baseData(d), status: 'draft', telegramMessageId: cur.telegramMessageId || null });
        batch.delete(doc(db, 'articles', cur.id));
        await batch.commit();
        dirty = false; cur = null;
        show('view-edit', false); show('view-list', true);
        notify('ok', 'Maqola qoralamaga qaytarildi.');
        await loadAll();
    } catch (e) { notify('err', 'Bajarib bo\'lmadi. ' + explain(e)); }
}

async function removeItem(id, status) {
    const a = items.find((x) => x.id === id);
    if (!confirm(`«${a ? a.title : id}» o'chirilsinmi? Bu amalni qaytarib bo'lmaydi.`)) return;
    try {
        await deleteDoc(doc(db, status === 'published' ? 'articles' : 'article-drafts', id));
        if (a && a.telegramMessageId && tg.ready && confirm('Telegram kanaldagi postni ham o\'chiraymi?')) {
            try { await deletePost({ messageId: a.telegramMessageId, channel: a.telegramChat || tg.chat }); }
            catch (e) { notify('warn', 'Maqola o\'chirildi, lekin Telegram postini o\'chirib bo\'lmadi: ' + esc(e.message)); await loadAll(); return; }
        }
        notify('ok', 'O\'chirildi.');
        await loadAll();
    } catch (e) { notify('err', 'O\'chirib bo\'lmadi. ' + explain(e)); }
}

/* ───────── Rasm yuklash (brauzerda kichraytirish) ───────── */
function resizeImage(file, maxW = 1000) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            const k = Math.min(1, maxW / img.width);
            const c = document.createElement('canvas');
            c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
            const ctx = c.getContext('2d');
            ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
            ctx.drawImage(img, 0, 0, c.width, c.height);
            let q = 0.82, out = c.toDataURL('image/jpeg', q);
            while (out.length > 280000 && q > 0.4) { q -= 0.08; out = c.toDataURL('image/jpeg', q); }
            out.length > 380000 ? reject(new Error('Rasm juda murakkab/katta. Kichikroq rasm tanlang.')) : resolve(out);
        };
        img.onerror = () => reject(new Error('Rasmni o\'qib bo\'lmadi.'));
        img.src = url;
    });
}

/* ───────── Toolbar ───────── */
function wrapSel(ta, before, after, placeholder) {
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = ta.value.slice(s, e) || placeholder || '';
    ta.setRangeText(before + sel + after, s, e, 'end');
    ta.focus();
}
function prefixLines(ta, fn) {
    const s = ta.selectionStart, e = ta.selectionEnd;
    const from = ta.value.lastIndexOf('\n', s - 1) + 1;
    let to = ta.value.indexOf('\n', e); if (to === -1) to = ta.value.length;
    const lines = ta.value.slice(from, to).split('\n').map(fn).join('\n');
    ta.setRangeText(lines, from, to, 'end'); ta.focus();
}
function toolbar(a) {
    const ta = $('f-body');
    if (a === 'b') wrapSel(ta, '**', '**', 'qalin matn');
    else if (a === 'i') wrapSel(ta, '*', '*', 'kursiv matn');
    else if (a === 'h2') prefixLines(ta, (l) => '## ' + l.replace(/^#{1,3}\s+/, ''));
    else if (a === 'h3') prefixLines(ta, (l) => '### ' + l.replace(/^#{1,3}\s+/, ''));
    else if (a === 'ul') prefixLines(ta, (l) => '- ' + l.replace(/^\s*[-*•]\s+/, ''));
    else if (a === 'ol') { let n = 0; prefixLines(ta, (l) => (++n) + '. ' + l.replace(/^\s*\d+[.)]\s+/, '')); }
    else if (a === 'q') prefixLines(ta, (l) => '> ' + l.replace(/^>\s?/, ''));
    else if (a === 'hr') wrapSel(ta, '\n\n---\n\n', '', '');
    else if (a === 'link') {
        const url = prompt('Havola manzili (https://...):', 'https://');
        if (url && /^https?:\/\//i.test(url)) wrapSel(ta, '[', `](${url})`, 'havola matni');
    } else if (a === 'img') {
        const url = prompt('Rasm manzili (https://...):', 'https://');
        if (url && /^https?:\/\//i.test(url)) wrapSel(ta, '\n\n![', `](${url})\n\n`, 'rasm tavsifi');
    }
    dirty = true; updatePreview();
}

/* ───────── Ishga tushirish ───────── */
async function init() {
    // Kun/tun
    const applyTheme = (d) => { document.body.classList.toggle('dark-theme', d); const i = document.querySelector('#theme-btn i'); i.classList.toggle('fa-sun', d); i.classList.toggle('fa-moon', !d); };
    applyTheme(localStorage.getItem('theme') === 'dark');
    $('theme-btn').addEventListener('click', () => { const d = !document.body.classList.contains('dark-theme'); applyTheme(d); localStorage.setItem('theme', d ? 'dark' : 'light'); });

    const isAdmin = window.ZiyomapAdminGuard ? await window.ZiyomapAdminGuard.checkAdmin() : false;
    if (!isAdmin) { $('deny').style.display = 'block'; return; }

    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    await new Promise((r) => { const u = onAuthStateChanged(auth, () => { u(); r(); }); });
    if (!auth.currentUser) { $('deny').style.display = 'block'; return; }
    db = getFirestore(app);

    show('app', true);
    await loadTelegram();
    await loadAll();

    $('btn-new').addEventListener('click', () => openEditor(null));
    $('btn-back').addEventListener('click', closeEditor);
    $('btn-draft').addEventListener('click', saveDraft);
    $('btn-publish').addEventListener('click', publish);
    $('btn-resend').addEventListener('click', resend);
    $('btn-unpub').addEventListener('click', unpublish);
    $('toolbar').addEventListener('click', (e) => { const b = e.target.closest('button[data-a]'); if (b) toolbar(b.dataset.a); });
    ['f-title', 'f-cat', 'f-link', 'f-excerpt', 'f-body', 'f-cover'].forEach((id) =>
        $(id).addEventListener('input', () => { dirty = true; updatePreview(); }));
    $('f-file').addEventListener('change', async (e) => {
        const f = e.target.files[0]; if (!f) return;
        try { $('f-cover').value = await resizeImage(f); dirty = true; updatePreview(); notify('', ''); }
        catch (err) { notify('err', esc(err.message)); }
    });
    $('btn-cover-clear').addEventListener('click', () => { $('f-cover').value = ''; $('f-file').value = ''; dirty = true; updatePreview(); });
    $('list-box').addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-act]'); if (!btn) return;
        const row = btn.closest('.item'); const id = row.dataset.id, st = row.dataset.st;
        if (btn.dataset.act === 'edit') openEditor(items.find((x) => x.id === id));
        else if (btn.dataset.act === 'del') removeItem(id, st);
    });
    window.addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
}
init();
