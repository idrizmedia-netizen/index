/* ===================================================
   ZIYOMAP — "Mening tanlov natijalarim" paneli
   dashboard.html ning body qismiga TEGMAYDI — o'zi
   yangi panel yaratib, .dash-wrap ichiga qo'shadi.
   =================================================== */
(function () {
    'use strict';

    const firebaseConfig = {
        apiKey: 'AIzaSyA2LiNy7o7l6kn1FTvOcXqBs14M3PVsjbI',
        authDomain: 'ziyomap.firebaseapp.com',
        projectId: 'ziyomap',
        storageBucket: 'ziyomap.firebasestorage.app',
        messagingSenderId: '982123868162',
        appId: '1:982123868162:web:6845723988c030fcd1f71b',
    };

    function esc(str) {
        const d = document.createElement('div');
        d.textContent = str == null ? '' : String(str);
        return d.innerHTML;
    }

    function buildPanel() {
        const wrap = document.querySelector('.dash-wrap');
        if (!wrap) return null;
        const panel = document.createElement('div');
        panel.className = 'panel';
        panel.style.marginBottom = '28px';
        panel.innerHTML =
            '<div class="panel-title">🏆 Mening tanlov natijalarim</div>' +
            '<div id="myContestResults"><div style="color:var(--muted);text-align:center;padding:20px;font-size:13px">Yuklanmoqda...</div></div>';
        wrap.appendChild(panel);
        return panel.querySelector('#myContestResults');
    }

    async function load() {
        const user = window.ZiyomapUsage && ZiyomapUsage.getUser();
        if (!user || !user.uid) return;

        const target = buildPanel();
        if (!target) return;

        try {
            const { initializeApp, getApps, getApp } = await import(
                'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js'
            );
            const { getAuth, onAuthStateChanged } = await import(
                'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js'
            );
            const { getFirestore, collection, query, where, getDocs, doc, getDoc } = await import(
                'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js'
            );
            const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
            const authInst = getAuth(app);
            await new Promise((resolve) => {
                const unsub = onAuthStateChanged(authInst, () => {
                    unsub();
                    resolve();
                });
            });
            const db = getFirestore(app);
            const queryUid = (authInst.currentUser && authInst.currentUser.uid) || user.uid;

            const snap = await getDocs(query(collection(db, 'registrations'), where('uid', '==', queryUid)));

            if (snap.empty) {
                target.innerHTML =
                    '<div style="color:var(--muted);text-align:center;padding:20px;font-size:13px">' +
                    'Hali tanlovda ishtirok etmagansiz. <a href="tanlov-royxat.html" style="color:var(--primary);font-weight:700">Ro\u2018yxatdan o\u2018ting →</a></div>';
                return;
            }

            const regs = [];
            snap.forEach((d) => regs.push(d.data()));

            // Har bir tanlovning test/suhbat sanalarini olish uchun kontestlarni bitta marta yuklaymiz
            const contestIds = [...new Set(regs.map((r) => r.contestId).filter(Boolean))];
            const contestDates = {};
            await Promise.all(
                contestIds.map(async (cid) => {
                    try {
                        const cSnap = await getDoc(doc(db, 'contests', cid));
                        if (cSnap.exists()) contestDates[cid] = cSnap.data();
                    } catch (err) {
                        console.error('Tanlov ma\u2019lumotini yuklashda xatolik:', err);
                    }
                })
            );

            function fmtDate(iso) {
                if (!iso) return null;
                const d2 = new Date(iso);
                if (isNaN(d2.getTime())) return iso;
                return d2.toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            }

            let html = '';
            regs.forEach((r) => {
                const hasScore = r.score !== null && r.score !== undefined;
                const hasInterview = r.interviewScore !== null && r.interviewScore !== undefined;
                const hasRank = r.rank !== null && r.rank !== undefined;
                const medal = r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : '🏆';
                const total = (r.score ?? 0) + (r.interviewScore ?? 0);
                const c = contestDates[r.contestId] || {};

                // Shaxsiy (avtomatik taqsimlangan) vaqt bo'lsa o'shani, bo'lmasa tanlovning umumiy oynasini olamiz
                const effTestStart = r.assignedTestStart || c.testWindowStart || null;
                const effTestEnd = r.assignedTestEnd || c.testWindowEnd || null;
                const effInterviewStart = r.assignedInterviewStart || c.interviewWindowStart || null;
                const effInterviewEnd = r.assignedInterviewEnd || c.interviewWindowEnd || null;

                // Ketma-ketlik: test hali tugamagan yoki topshirilmagan bo'lsa — test vaqti ko'rsatiladi;
                // test oynasi tugagandan keyin — suhbat vaqti ko'rsatiladi.
                const now = new Date();
                const testEnded = effTestEnd ? now > new Date(effTestEnd) : false;
                const dateBits = [];
                if (!testEnded && (effTestStart || effTestEnd)) {
                    dateBits.push(`Test vaqti: ${effTestStart ? fmtDate(effTestStart) : '\u2014'}${effTestEnd ? ' \u2013 ' + fmtDate(effTestEnd) : ''}`);
                } else if (effInterviewStart || effInterviewEnd) {
                    dateBits.push(`Suhbat vaqti: ${effInterviewStart ? fmtDate(effInterviewStart) : '\u2014'}${effInterviewEnd ? ' \u2013 ' + fmtDate(effInterviewEnd) : ''}`);
                } else if (effTestStart || effTestEnd) {
                    dateBits.push(`Test vaqti: ${effTestStart ? fmtDate(effTestStart) : '\u2014'}${effTestEnd ? ' \u2013 ' + fmtDate(effTestEnd) : ''}`);
                }

                html += `<div class="activity-row">
                    <div class="act-icon" style="background:#fdf2f8;font-size:16px">${medal}</div>
                    <div style="flex:1">
                        <div class="act-label">${esc(r.contestTitle)}</div>
                        <div class="act-time">ID: ${esc(r.customId)}${hasScore ? ' \u00b7 Test: ' + esc(r.score) : ''}${hasInterview ? ' \u00b7 Suhbat: ' + esc(r.interviewScore) : ''}</div>
                        ${dateBits.length ? `<div class="act-time" style="color:var(--primary)">${esc(dateBits.join(' \u00b7 '))}</div>` : ''}
                        ${hasRank ? `<div style="display:inline-block;margin-top:4px;padding:2px 10px;border-radius:20px;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#fff;font-size:11px;font-weight:800">${esc(r.rank)}-o\u2018rin</div>` : ''}
                    </div>
                    <div style="font-weight:800;color:${hasScore || hasInterview ? 'var(--primary)' : 'var(--muted)'};text-align:right">
                        ${hasScore || hasInterview ? esc(total) + ' ball<br><span style=\'font-size:11px;font-weight:600;color:var(--muted)\'>jami</span>' : 'Kutilmoqda'}
                    </div>
                </div>`;
            });
            target.innerHTML = html;
        } catch (err) {
            console.error('Natijalarni yuklashda xatolik:', err);
            target.innerHTML = '<div style="color:var(--muted);text-align:center;padding:20px;font-size:13px">Yuklashda xatolik yuz berdi.</div>';
        }
    }

    window.addEventListener('load', () => setTimeout(load, 400));
})();
