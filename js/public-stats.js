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
        const anchor = document.getElementById('home') || document.querySelector('nav');
        if (!anchor) return null;

        const section = document.createElement('div');
        section.id = 'zy-public-stats';
        section.style.cssText =
            'max-width:720px;margin:14px auto 14px;padding:0 16px;display:grid;' +
            'grid-template-columns:repeat(3,1fr);gap:8px;position:relative;z-index:1;';
        section.innerHTML = `
            <div class="zy-pub-card" id="zyPubCardReg" style="background:var(--card-bg);border-radius:12px;padding:9px 10px;display:flex;align-items:center;gap:8px;box-shadow:0 4px 14px rgba(37,99,235,0.08);border:1px solid rgba(37,99,235,0.12);transition:transform .2s;">
                <div style="width:26px;height:26px;flex-shrink:0;border-radius:8px;background:linear-gradient(135deg,#6366f1,#4f46e5);display:flex;align-items:center;justify-content:center">
                    <i class="fas fa-users" style="color:#fff;font-size:0.7rem"></i>
                </div>
                <div style="min-width:0">
                    <div style="font-size:1rem;font-weight:800;color:#4f46e5;line-height:1.1" id="zyPubReg">—</div>
                    <div style="font-size:9px;color:var(--text-color);opacity:.7;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Ro'yxatdan o'tgan</div>
                </div>
            </div>
            <div class="zy-pub-card" id="zyPubCardContests" style="background:var(--card-bg);border-radius:12px;padding:9px 10px;display:flex;align-items:center;gap:8px;box-shadow:0 4px 14px rgba(14,165,233,0.08);border:1px solid rgba(14,165,233,0.12);transition:transform .2s;">
                <div style="width:26px;height:26px;flex-shrink:0;border-radius:8px;background:linear-gradient(135deg,#0ea5e9,#0284c7);display:flex;align-items:center;justify-content:center">
                    <i class="fas fa-trophy" style="color:#fff;font-size:0.7rem"></i>
                </div>
                <div style="min-width:0">
                    <div style="font-size:1rem;font-weight:800;color:#0284c7;line-height:1.1" id="zyPubContests">—</div>
                    <div style="font-size:9px;color:var(--text-color);opacity:.7;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">O'tkazilgan tanlov</div>
                </div>
            </div>
            <div class="zy-pub-card" id="zyPubCardOpen" style="background:var(--card-bg);border-radius:12px;padding:9px 10px;display:flex;align-items:center;gap:8px;box-shadow:0 4px 14px rgba(5,150,105,0.08);border:1px solid rgba(5,150,105,0.12);transition:transform .2s;">
                <div style="width:26px;height:26px;flex-shrink:0;border-radius:8px;background:linear-gradient(135deg,#94a3b8,#64748b);display:flex;align-items:center;justify-content:center" id="zyPubOpenIconWrap">
                    <i class="fas fa-bolt" style="color:#fff;font-size:0.7rem"></i>
                </div>
                <div style="min-width:0">
                    <div style="font-size:1rem;font-weight:800;color:#64748b;line-height:1.1" id="zyPubOpen">—</div>
                    <div style="font-size:9px;color:var(--text-color);opacity:.7;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Faol tanlov</div>
                </div>
            </div>`;
        anchor.insertAdjacentElement('beforebegin', section);

        section.querySelectorAll('.zy-pub-card').forEach((c) => {
            c.addEventListener('mouseenter', () => { c.style.transform = 'translateY(-2px)'; });
            c.addEventListener('mouseleave', () => { c.style.transform = ''; });
        });

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
            const openN = openCount.data().count;

            document.getElementById('zyPubReg').textContent = totalReg;
            document.getElementById('zyPubContests').textContent = contestsCount.data().count;
            document.getElementById('zyPubOpen').textContent = openN;

            if (openN > 0) {
                const card = document.getElementById('zyPubCardOpen');
                const iconWrap = document.getElementById('zyPubOpenIconWrap');
                const numEl = document.getElementById('zyPubOpen');
                card.style.border = '1px solid rgba(5,150,105,0.35)';
                card.style.boxShadow = '0 4px 16px rgba(5,150,105,0.2)';
                card.style.animation = 'zyPubPulse 2.4s ease-in-out infinite';
                iconWrap.style.background = 'linear-gradient(135deg,#10b981,#059669)';
                numEl.style.color = '#059669';
                const style = document.createElement('style');
                style.textContent = '@keyframes zyPubPulse{0%,100%{box-shadow:0 4px 16px rgba(5,150,105,0.2)}50%{box-shadow:0 4px 22px rgba(5,150,105,0.4)}}';
                document.head.appendChild(style);
            }
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
