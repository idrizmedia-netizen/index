/* ZIYOMAP — Blog (Firestore "articles" kolleksiyasi). Sanity o'rniga.
   Rejimlar (sahifadagi elementga qarab):
     #posts-container  → bosh sahifa: so'nggi maqolalar kartochkalari
     #articles-list    → maqolalar.html: barcha maqolalar + qidiruv/kategoriya
     #article-view     → maqola.html?id=...: bitta maqola */
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js';
import {
    getFirestore, collection, query, orderBy, limit, getDocs, doc, getDoc,
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: 'AIzaSyA2LiNy7o7l6kn1FTvOcXqBs14M3PVsjbI',
    authDomain: 'ziyomap.firebaseapp.com',
    projectId: 'ziyomap',
    storageBucket: 'ziyomap.firebasestorage.app',
    messagingSenderId: '982123868162',
    appId: '1:982123868162:web:6845723988c030fcd1f71b',
};
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const MD = window.ZiyomapMD;
const SITE = 'https://www.ziyomap.uz';
const PLACEHOLDER = 'images/nav-icon.png';

const esc = (s) => MD.esc(s);
const safeImg = (u) => (typeof u === 'string' && /^(https:\/\/|data:image\/(png|jpe?g|webp|gif);base64,)/i.test(u) ? u : PLACEHOLDER);

function toDate(ts) {
    if (!ts) return null;
    if (typeof ts.toDate === 'function') return ts.toDate();
    if (ts.seconds) return new Date(ts.seconds * 1000);
    return null;
}
function fmtDate(ts) {
    const d = toDate(ts);
    if (!d) return '';
    const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}
function articleHref(a) {
    return a.externalLink && /^https?:\/\//i.test(a.externalLink) && !a.body
        ? a.externalLink
        : 'maqola.html?id=' + encodeURIComponent(a.id);
}
function isExternal(a) { return /^https?:\/\//i.test(articleHref(a)); }

async function fetchArticles(n) {
    const snap = await getDocs(query(collection(db, 'articles'), orderBy('publishedAt', 'desc'), limit(n)));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

function cardHtml(a, i) {
    const excerpt = a.excerpt || MD.plain(a.body || '').slice(0, 150);
    const ext = isExternal(a);
    return `
    <div class="card" data-aos="fade-up" data-aos-delay="${(i % 3) * 120}">
        <div class="card-image" style="width:100%;height:200px;overflow:hidden;border-radius:8px;margin-bottom:15px;">
            <img src="${esc(safeImg(a.coverUrl))}" alt="${esc(a.title)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">
        </div>
        <span style="color:var(--primary-color);font-size:.85rem;font-weight:bold;text-transform:uppercase;margin-bottom:10px;display:block;">${esc(a.category || 'Maqola')}</span>
        <h3 style="margin-top:0;margin-bottom:12px;font-size:1.4rem;">${esc(a.title)}</h3>
        <p style="font-size:.95rem;line-height:1.6;opacity:.9;margin-bottom:25px;">${esc(excerpt.length > 150 ? excerpt.slice(0, 150) + '...' : excerpt)}</p>
        <a href="${esc(articleHref(a))}" ${ext ? 'target="_blank" rel="noopener noreferrer"' : ''} class="btn" style="padding:10px 25px;font-size:14px;margin:0;display:inline-block;">O'qish</a>
    </div>`;
}

/* ───────── Bosh sahifa ───────── */
async function initHome(box) {
    try {
        const list = await fetchArticles(6);
        if (!list.length) {
            box.innerHTML = '<p style="text-align:center;grid-column:1/-1;">Hozircha maqolalar mavjud emas.</p>';
            return;
        }
        box.innerHTML = list.map(cardHtml).join('');
        const more = document.createElement('div');
        more.style.cssText = 'text-align:center;margin-top:30px;grid-column:1/-1;';
        more.innerHTML = '<a href="maqolalar.html" class="btn" style="display:inline-block;padding:12px 30px;">Barcha maqolalar →</a>';
        box.parentElement.appendChild(more);
        if (typeof AOS !== 'undefined') AOS.refresh();
    } catch (err) {
        console.error('Maqolalarni yuklashda xatolik:', err);
        box.innerHTML = '<p style="text-align:center;grid-column:1/-1;">Maqolalarni yuklab bo\'lmadi.</p>';
    }
}

/* ───────── Ro'yxat sahifasi ───────── */
async function initList(box) {
    const search = document.getElementById('article-search');
    const chips = document.getElementById('article-cats');
    let all = [];
    let cat = '';

    function draw() {
        const q = (search && search.value || '').trim().toLowerCase();
        const list = all.filter((a) =>
            (!cat || a.category === cat) &&
            (!q || (a.title + ' ' + (a.excerpt || '')).toLowerCase().includes(q)));
        box.innerHTML = list.length
            ? list.map((a) => `
            <a class="al-card" href="${esc(articleHref(a))}" ${isExternal(a) ? 'target="_blank" rel="noopener noreferrer"' : ''}>
                <img src="${esc(safeImg(a.coverUrl))}" alt="" loading="lazy">
                <div class="al-body">
                    <span class="al-cat">${esc(a.category || 'Maqola')}</span>
                    <h3>${esc(a.title)}</h3>
                    <p>${esc((a.excerpt || MD.plain(a.body || '')).slice(0, 140))}</p>
                    <small>${esc(fmtDate(a.publishedAt))}${a.body ? ' · ' + MD.readMinutes(a.body) + ' daqiqa' : ''}</small>
                </div>
            </a>`).join('')
            : '<p class="al-empty">Hech narsa topilmadi.</p>';
    }

    try {
        all = await fetchArticles(100);
        if (chips) {
            const cats = [...new Set(all.map((a) => a.category).filter(Boolean))];
            chips.innerHTML = ['Hammasi', ...cats].map((c, i) =>
                `<button type="button" class="chip${i === 0 ? ' on' : ''}" data-cat="${i === 0 ? '' : esc(c)}">${esc(c)}</button>`).join('');
            chips.addEventListener('click', (e) => {
                const b = e.target.closest('.chip');
                if (!b) return;
                chips.querySelectorAll('.chip').forEach((x) => x.classList.toggle('on', x === b));
                cat = b.dataset.cat;
                draw();
            });
        }
        if (search) search.addEventListener('input', draw);
        draw();
    } catch (err) {
        console.error(err);
        box.innerHTML = '<p class="al-empty">Maqolalarni yuklab bo\'lmadi.</p>';
    }
}

/* ───────── Bitta maqola ───────── */
function setMeta(sel, attr, val) {
    let el = document.head.querySelector(sel);
    if (!el) {
        el = document.createElement('meta');
        const m = sel.match(/\[(name|property)="([^"]+)"\]/);
        if (m) el.setAttribute(m[1], m[2]);
        document.head.appendChild(el);
    }
    el.setAttribute(attr, val);
}

async function initArticle(box) {
    const id = new URLSearchParams(location.search).get('id');
    if (!id) { box.innerHTML = '<p class="al-empty">Maqola topilmadi.</p>'; return; }
    try {
        const snap = await getDoc(doc(db, 'articles', id));
        if (!snap.exists()) { box.innerHTML = '<p class="al-empty">Bunday maqola mavjud emas yoki o\'chirilgan.</p>'; return; }
        const a = { id: snap.id, ...snap.data() };
        const url = SITE + '/maqola.html?id=' + encodeURIComponent(a.id);
        const desc = (a.excerpt || MD.plain(a.body || '')).slice(0, 160);

        document.title = a.title + ' | Ziyomap';
        setMeta('meta[name="description"]', 'content', desc);
        setMeta('meta[property="og:title"]', 'content', a.title);
        setMeta('meta[property="og:description"]', 'content', desc);
        setMeta('meta[property="og:type"]', 'content', 'article');
        setMeta('meta[property="og:url"]', 'content', url);
        if (a.coverUrl && /^https:\/\//i.test(a.coverUrl)) setMeta('meta[property="og:image"]', 'content', a.coverUrl);
        const canon = document.querySelector('link[rel="canonical"]');
        if (canon) canon.setAttribute('href', url);

        const ld = document.createElement('script');
        ld.type = 'application/ld+json';
        ld.textContent = JSON.stringify({
            '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: desc,
            datePublished: toDate(a.publishedAt) ? toDate(a.publishedAt).toISOString() : undefined,
            author: { '@type': 'Organization', name: 'Ziyomap' },
            publisher: { '@type': 'Organization', name: 'Ziyomap', logo: { '@type': 'ImageObject', url: SITE + '/icon-512x512.png' } },
            mainEntityOfPage: url,
        });
        document.head.appendChild(ld);

        const share = 'https://t.me/share/url?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(a.title);
        box.innerHTML = `
            <span class="av-cat">${esc(a.category || 'Maqola')}</span>
            <h1>${esc(a.title)}</h1>
            <div class="av-meta">${esc(fmtDate(a.publishedAt))}${a.body ? ' · ' + MD.readMinutes(a.body) + ' daqiqalik o\'qish' : ''}</div>
            ${a.coverUrl ? `<img class="av-cover" src="${esc(safeImg(a.coverUrl))}" alt="${esc(a.title)}">` : ''}
            <div class="av-body">${MD.render(a.body || '')}</div>
            ${a.externalLink && /^https?:\/\//i.test(a.externalLink) ? `<p><a class="av-btn" href="${esc(a.externalLink)}" target="_blank" rel="noopener noreferrer">Manba / davomi →</a></p>` : ''}
            <div class="av-share">
                <a class="av-btn" href="${esc(share)}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-telegram"></i> Telegramda ulashish</a>
                <button class="av-btn alt" id="av-copy" type="button"><i class="fa-solid fa-link"></i> Havolani nusxalash</button>
            </div>`;
        document.getElementById('av-copy').addEventListener('click', async (e) => {
            try { await navigator.clipboard.writeText(url); e.currentTarget.textContent = 'Nusxalandi ✓'; } catch { prompt('Havola:', url); }
        });

        // Boshqa maqolalar
        const rel = document.getElementById('related');
        if (rel) {
            const others = (await fetchArticles(5)).filter((x) => x.id !== a.id).slice(0, 3);
            if (others.length) {
                rel.innerHTML = '<h2>Yana o\'qing</h2><div class="rel-grid">' + others.map((x) => `
                    <a class="al-card" href="${esc(articleHref(x))}"><img src="${esc(safeImg(x.coverUrl))}" alt="" loading="lazy">
                    <div class="al-body"><span class="al-cat">${esc(x.category || 'Maqola')}</span><h3>${esc(x.title)}</h3></div></a>`).join('') + '</div>';
            }
        }
    } catch (err) {
        console.error(err);
        box.innerHTML = '<p class="al-empty">Maqolani yuklab bo\'lmadi.</p>';
    }
}

const home = document.getElementById('posts-container');
const list = document.getElementById('articles-list');
const view = document.getElementById('article-view');
if (home) initHome(home);
if (list) initList(list);
if (view) initArticle(view);
