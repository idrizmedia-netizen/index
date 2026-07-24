/* ===================================================
   ZIYOMAP — "Mening test natijalarim" paneli
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
            '<div class="panel-title">\ud83d\udcdd Mening test natijalarim</div>' +
            '<div id="myTestResults"><div style="color:var(--muted);text-align:center;padding:20px;font-size:13px">Yuklanmoqda...</div></div>';
        wrap.appendChild(panel);
        return panel.querySelector('#myTestResults');
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
            const { getFirestore, collection, query, where, getDocs } = await import(
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

            const snap = await getDocs(query(collection(db, 'test-attempts'), where('uid', '==', queryUid)));

            if (snap.empty) {
                target.innerHTML =
                    '<div style="color:var(--muted);text-align:center;padding:20px;font-size:13px">Hali test topshirmagansiz.</div>';
                return;
            }

            let html = '';
            snap.forEach((d) => {
                const a = d.data();
                const isSubmitted = a.status === 'submitted';
                const hasOpen = a.openScoreAuto !== null && a.openScoreAuto !== undefined;
                const total = isSubmitted ? +(((a.score || 0) + (hasOpen ? a.openScoreAuto : 0))).toFixed(2) : null;
                html += `<div class="activity-row">
                    <div class="act-icon" style="background:#eff6ff">${isSubmitted ? '\ud83d\udcdd' : '\u23f3'}</div>
                    <div style="flex:1">
                        <div class="act-label">Test natijasi</div>
                        <div class="act-time">${isSubmitted ? `Yopiq: ${esc(a.score)} ball${hasOpen ? ` \u00b7 Ochiq: ${esc(a.openScoreAuto)} ball (avto)` : ''}` : 'Jarayonda'}</div>
                    </div>
                    <div style="font-weight:800;color:${isSubmitted ? 'var(--primary)' : 'var(--muted)'}">
                        ${isSubmitted ? esc(total) + ' ball' : '\u2014'}
                    </div>
                </div>`;
            });
            target.innerHTML = html;
        } catch (err) {
            console.error('Test natijalarini yuklashda xatolik:', err);
            target.innerHTML = '<div style="color:var(--muted);text-align:center;padding:20px;font-size:13px">Yuklashda xatolik yuz berdi.</div>';
        }
    }

    window.addEventListener('load', () => setTimeout(load, 500));
})();
