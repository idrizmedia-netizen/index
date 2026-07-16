/* ===================================================
   ZIYOMAP — Bo'lim ishlatilishi statistikasi
   ziyomap-usage.js ga TEGMAYDI — uning logUsage
   funksiyasini "o'rab", Firestore'ga ham yozadi.
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

    let dbPromise = null;
    async function getDb() {
        if (!dbPromise) {
            dbPromise = (async () => {
                const { initializeApp, getApps, getApp } = await import(
                    'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js'
                );
                const { getFirestore } = await import(
                    'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js'
                );
                const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
                return getFirestore(app);
            })();
        }
        return dbPromise;
    }

    async function bumpFeature(featureId, label) {
        try {
            const { doc, setDoc, increment } = await import(
                'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js'
            );
            const db = await getDb();
            await setDoc(
                doc(db, 'usage-stats', featureId),
                { label: label || featureId, count: increment(1) },
                { merge: true }
            );
        } catch (err) {
            /* jim tursin — statistika ixtiyoriy, saytni to'xtatmasin */
        }
    }

    function wrap() {
        const U = window.ZiyomapUsage;
        if (!U || U.__statsWrapped) return;
        const originalLog = U.logUsage;
        U.logUsage = function (featureId, label) {
            try {
                bumpFeature(featureId, label);
            } catch (err) {
                /* ignore */
            }
            return originalLog.apply(U, arguments);
        };
        U.__statsWrapped = true;
    }

    if (window.ZiyomapUsage) wrap();
    else document.addEventListener('DOMContentLoaded', wrap);
})();
