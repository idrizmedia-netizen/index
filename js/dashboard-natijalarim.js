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
            const { getFirestore, collection, query, where, getDocs } = await import(
                'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js'
            );
            const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
            const db = getFirestore(app);

            const snap = await getDocs(query(collection(db, 'registrations'), where('uid', '==', user.uid)));

            if (snap.empty) {
                target.innerHTML =
                    '<div style="color:var(--muted);text-align:center;padding:20px;font-size:13px">' +
                    'Hali tanlovda ishtirok etmagansiz. <a href="tanlov-royxat.html" style="color:var(--primary);font-weight:700">Ro\u2018yxatdan o\u2018ting →</a></div>';
                return;
            }

            let html = '';
            snap.forEach((d) => {
                const r = d.data();
                const hasScore = r.score !== null && r.score !== undefined;
                html += `<div class="activity-row">
                    <div class="act-icon" style="background:#fdf2f8">🏆</div>
                    <div style="flex:1">
                        <div class="act-label">${esc(r.contestTitle)}</div>
                        <div class="act-time">ID: ${esc(r.customId)}</div>
                    </div>
                    <div style="font-weight:800;color:${hasScore ? 'var(--primary)' : 'var(--muted)'}">
                        ${hasScore ? esc(r.score) + ' ball' : 'Kutilmoqda'}
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
