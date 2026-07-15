/* ===================================================
   ZIYOMAP — Umumiy statistika vidjeti (ochiq, login shart emas)
   index.html ning body qismiga TEGMAYDI — o'zi <nav> dan
   keyin yangi bo'lim yaratib qo'shadi.
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

    function buildWidget() {
        const nav = document.querySelector('nav');
        if (!nav) return null;

        const section = document.createElement('div');
        section.id = 'zy-public-stats';
        section.style.cssText =
            'max-width:900px;margin:78px auto 0;padding:0 16px;display:grid;' +
            'grid-template-columns:repeat(3,1fr);gap:12px;';
        section.innerHTML = `
            <div style="background:var(--card-bg);border-radius:16px;padding:16px;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,0.04)">
                <div style="font-size:1.6rem;font-weight:800;color:var(--primary-color)" id="zyPubReg">—</div>
                <div style="font-size:11px;color:var(--text-color);opacity:.7;margin-top:2px">Ro'yxatdan o'tganlar</div>
            </div>
            <div style="background:var(--card-bg);border-radius:16px;padding:16px;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,0.04)">
                <div style="font-size:1.6rem;font-weight:800;color:var(--primary-color)" id="zyPubContests">—</div>
                <div style="font-size:11px;color:var(--text-color);opacity:.7;margin-top:2px">O'tkazilgan tanlovlar</div>
            </div>
            <div style="background:var(--card-bg);border-radius:16px;padding:16px;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,0.04)">
                <div style="font-size:1.6rem;font-weight:800;color:var(--primary-color)" id="zyPubOpen">—</div>
                <div style="font-size:11px;color:var(--text-color);opacity:.7;margin-top:2px">Hozir faol tanlov</div>
            </div>`;
        nav.insertAdjacentElement('afterend', section);
        return section;
    }

    async function load() {
        const section = buildWidget();
        if (!section) return;

        try {
            const { initializeApp, getApps, getApp } = await import(
                'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js'
            );
            const { getFirestore, doc, getDoc, collection, query, where, getCountFromServer } = await import(
                'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js'
            );
            const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
            const db = getFirestore(app);

            const [statsSnap, contestsCount, openCount] = await Promise.all([
                getDoc(doc(db, 'stats', 'public')),
                getCountFromServer(collection(db, 'contests')),
                getCountFromServer(query(collection(db, 'contests'), where('status', '==', 'open'))),
            ]);

            const totalReg = statsSnap.exists() ? statsSnap.data().totalRegistrations || 0 : 0;

            document.getElementById('zyPubReg').textContent = totalReg;
            document.getElementById('zyPubContests').textContent = contestsCount.data().count;
            document.getElementById('zyPubOpen').textContent = openCount.data().count;
        } catch (err) {
            console.error('Statistika yuklashda xatolik:', err);
            section.style.display = 'none';
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', load);
    } else {
        load();
    }
})();
