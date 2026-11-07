/* ══════════════════════════════════════════════════════════════
   ZIYOMAP — BOSH SAHIFA YANGILIKLARI
   Admin paneldagi "Yangiliklar" bo'limida yozilgan yangiliklar
   (Firestore: site-content, type == 'news') bosh sahifada
   kartochka ko'rinishida chiqadi. Yangilik bo'lmasa — bo'lim yashirin.
   ══════════════════════════════════════════════════════════════ */
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js';
import { getFirestore, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: 'AIzaSyA2LiNy7o7l6kn1FTvOcXqBs14M3PVsjbI',
    authDomain: 'ziyomap.firebaseapp.com',
    projectId: 'ziyomap',
    storageBucket: 'ziyomap.firebasestorage.app',
    messagingSenderId: '982123868162',
    appId: '1:982123868162:web:6845723988c030fcd1f71b',
};

const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
const FIRST_BATCH = 6;

function fmtDate(iso) {
    const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return '';
    return `${parseInt(m[3], 10)}-${MONTHS[parseInt(m[2], 10) - 1]}, ${m[1]}`;
}

// Faqat https:// yoki sayt ichidagi .html havolalarga ruxsat (javascript: va boshqalar o'tmaydi)
function safeHref(v) {
    const t = String(v || '').trim();
    if (/^https?:\/\//i.test(t)) return t;
    if (/^[\w\-./]+\.html(\?[\w=&\-]*)?(#[\w\-]*)?$/.test(t)) return t;
    return '';
}

function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
}

function buildCard(n) {
    const card = el('article', 'zn-card');
    if (typeof n.imageUrl === 'string' && n.imageUrl.indexOf('data:image/') === 0) {
        const wrap = el('div', 'zn-img');
        const img = document.createElement('img');
        img.src = n.imageUrl;
        img.alt = '';
        img.loading = 'lazy';
        wrap.appendChild(img);
        card.appendChild(wrap);
    }
    const body = el('div', 'zn-body');

    const meta = el('div', 'zn-meta');
    meta.appendChild(el('span', 'zn-date', fmtDate(n.date)));
    if (n.pinned) {
        const pin = el('span', 'zn-pin');
        pin.innerHTML = '<i class="fas fa-thumbtack"></i> ';
        const t = el('span', null, 'Muhim');
        t.setAttribute('data-i18n', 'news.pinned');
        pin.appendChild(t);
        meta.appendChild(pin);
    }
    body.appendChild(meta);
    body.appendChild(el('h3', 'zn-title', n.title || ''));

    const text = el('p', 'zn-text', n.body || '');
    body.appendChild(text);

    if (String(n.body || '').length > 170 || String(n.body || '').split('\n').length > 4) {
        const more = el('button', 'zn-more');
        more.type = 'button';
        const label = el('span', null, 'Davomini o\u2018qish');
        label.setAttribute('data-i18n', 'news.more');
        more.appendChild(label);
        more.addEventListener('click', () => {
            const open = card.classList.toggle('open');
            label.setAttribute('data-i18n', open ? 'news.less' : 'news.more');
            label.textContent = open ? 'Yopish' : 'Davomini o\u2018qish';
            if (window.ZiyomapI18n) window.ZiyomapI18n.apply();
        });
        body.appendChild(more);
    }

    const href = safeHref(n.link);
    if (href) {
        const a = el('a', 'zn-link');
        a.href = href;
        if (/^https?:/i.test(href)) { a.target = '_blank'; a.rel = 'noopener'; }
        const t = el('span', null, 'Batafsil');
        t.setAttribute('data-i18n', 'news.details');
        a.appendChild(t);
        a.appendChild(document.createTextNode(' \u2192'));
        body.appendChild(a);
    }
    card.appendChild(body);
    return card;
}

async function init() {
    const section = document.getElementById('news');
    const grid = document.getElementById('news-grid');
    if (!section || !grid) return;
    try {
        const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const snap = await getDocs(query(collection(db, 'site-content'), where('type', '==', 'news')));
        const items = [];
        snap.forEach((d) => {
            const x = d.data();
            if (x.published !== false && x.title) items.push({ id: d.id, ...x });
        });
        items.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || String(b.date || '').localeCompare(String(a.date || '')));
        if (!items.length) return;

        items.slice(0, FIRST_BATCH).forEach((n) => grid.appendChild(buildCard(n)));
        const rest = items.slice(FIRST_BATCH);
        if (rest.length) {
            const wrap = el('div', 'zn-all-wrap');
            const btn = el('button', 'zn-all');
            btn.type = 'button';
            const label = el('span', null, 'Barcha yangiliklar');
            label.setAttribute('data-i18n', 'news.all');
            btn.appendChild(label);
            btn.addEventListener('click', () => {
                rest.forEach((n) => grid.appendChild(buildCard(n)));
                wrap.remove();
                if (window.ZiyomapI18n) window.ZiyomapI18n.apply();
            });
            wrap.appendChild(btn);
            section.querySelector('.zn-inner').appendChild(wrap);
        }
        section.hidden = false;
        document.querySelectorAll('a[href="#news"]').forEach((a) => { const li = a.closest('li'); if (li) li.hidden = false; });
        if (window.ZiyomapI18n) window.ZiyomapI18n.apply();
    } catch (err) {
        console.error('Yangiliklarni yuklashda xatolik:', err);
    }
}

init();
