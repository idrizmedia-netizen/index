/* ===================================================
   ZIYOMAP — Firestore → Bell ko'prigi
   notifications.js ga TEGMAYDI. Faqat Firestore'dagi
   "notifications" kolleksiyasini o'qib, mavjud
   localStorage("zy_admin_msgs") formatiga yozadi —
   notifications.js buni avtomatik o'qiydi va
   qo'ng'iroqda/toast'da ko'rsatadi.
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

    async function sync() {
        try {
            const { initializeApp, getApps, getApp } = await import(
                'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js'
            );
            const { getFirestore, collection, query, orderBy, limit, getDocs } = await import(
                'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js'
            );
            const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
            const db = getFirestore(app);

            const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(30));
            const snap = await getDocs(q);

            const items = [];
            snap.forEach((d) => {
                const v = d.data();
                items.push({ id: d.id, text: v.text || '' });
            });

            localStorage.setItem('zy_admin_msgs', JSON.stringify(items));

            if (window.ZiyomapNotify && ZiyomapNotify.refresh) ZiyomapNotify.refresh();
            if (window.ZiyomapNotify && ZiyomapNotify.checkAdmin) ZiyomapNotify.checkAdmin();
        } catch (err) {
            console.error('Bildirishnomalarni Firestore’dan yuklashda xatolik:', err);
        }
    }

    sync();
    setInterval(sync, 60000); // har 1 daqiqada yangilanadi

    window.ZiyomapFirestoreNotify = { sync };
})();
