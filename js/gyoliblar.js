import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js';
import { getFirestore, collection, getDocs, query, orderBy } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';

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

const selectWrap = document.getElementById('contest-select-wrap');
const selectEl = document.getElementById('lb-select');
const content = document.getElementById('lb-content');

function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str == null ? '' : String(str);
    return d.innerHTML;
}

function renderBoard(lb) {
    const entries = lb.entries || [];
    if (!entries.length) {
        content.innerHTML = '<div class="empty-box"><i class="fas fa-trophy"></i>Bu tanlov uchun natijalar hali e\u2018lon qilinmagan.</div>';
        return;
    }

    // Diqqat: tenglik (bir nechta kishi bir xil ball bilan bir o'rinda) bo'lishi mumkin,
    // shuning uchun massiv indeksi emas, balki haqiqiy "rank" qiymati bo'yicha ajratamiz.
    const top3 = entries.filter((e) => e.rank <= 3);
    const rest = entries.filter((e) => e.rank > 3 && e.rank <= 5);
    const medalByRank = { 1: '🥇', 2: '🥈', 3: '🥉' };
    const clsByRank = { 1: 'first', 2: 'second', 3: 'third' };

    let html = '<div class="podium">';
    top3.forEach((e) => {
        const breakdown = e.testScore != null || e.interviewScore != null
            ? `<div class="p-school" style="margin-top:2px">Test: ${escapeHtml(e.testScore ?? '\u2014')} \u00b7 Suhbat: ${escapeHtml(e.interviewScore ?? '\u2014')}</div>`
            : '';
        html += `<div class="p-item ${clsByRank[e.rank] || ''}">
            <div class="medal">${medalByRank[e.rank] || e.rank + '-o\u2018rin'}</div>
            <div class="p-name">${escapeHtml(e.fullName)}</div>
            <div class="p-score">${escapeHtml(e.score)} ball</div>
            <div class="p-school">${escapeHtml(e.maktab)}</div>
            ${breakdown}
        </div>`;
    });
    html += '</div>';

    if (rest.length) {
        html += '<div class="rest-list">';
        rest.forEach((e) => {
            const breakdown = e.testScore != null || e.interviewScore != null
                ? `<div class="n2">Test: ${escapeHtml(e.testScore ?? '\u2014')} \u00b7 Suhbat: ${escapeHtml(e.interviewScore ?? '\u2014')}</div>`
                : '';
            html += `<div class="rest-row">
                <div class="rk">${e.rank}</div>
                <div class="nm"><div class="n1">${escapeHtml(e.fullName)}</div><div class="n2">${escapeHtml(e.maktab)}</div>${breakdown}</div>
                <div class="sc">${escapeHtml(e.score)}</div>
            </div>`;
        });
        html += '</div>';
    }

    html += `<div style="text-align:center;margin-top:20px">
        <a href="https://t.me/Ziyomap" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:8px;background:#0088cc;color:#fff;padding:10px 20px;border-radius:10px;font-weight:700;text-decoration:none">
            <i class="fab fa-telegram"></i> Batafsil natijalar uchun Ziyomap Telegram kanaliga o\u2018ting
        </a>
    </div>`;

    content.innerHTML = html;
}

async function init() {
    try {
        const snap = await getDocs(query(collection(db, 'leaderboards'), orderBy('publishedAt', 'desc')));
        if (snap.empty) {
            content.innerHTML = '<div class="empty-box"><i class="fas fa-trophy"></i>Hali hech qanday tanlov natijasi e\u2018lon qilinmagan.</div>';
            return;
        }

        const boards = [];
        snap.forEach((d) => boards.push({ id: d.id, ...d.data() }));

        if (boards.length > 1) {
            selectWrap.style.display = 'block';
            selectEl.innerHTML = boards.map((b) => `<option value="${b.id}">${escapeHtml(b.contestTitle)}</option>`).join('');
            selectEl.addEventListener('change', () => {
                const b = boards.find((x) => x.id === selectEl.value);
                if (b) renderBoard(b);
            });
        }

        renderBoard(boards[0]);
    } catch (err) {
        console.error(err);
        content.innerHTML = '<div class="empty-box"><i class="fas fa-triangle-exclamation"></i>Yuklashda xatolik yuz berdi.</div>';
    }
}

init();
