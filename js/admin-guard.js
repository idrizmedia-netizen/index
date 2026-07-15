/* ===================================================
   ZIYOMAP — Admin Guard
   Eski auth fayllarga tegmaydi. Faqat:
   - ZiyomapUsage.getUser() dan emailni oladi
   - Firestore "admins" kolleksiyasidan tekshiradi
   - [data-admin-only] elementlarni ko'rsatadi/yashiradi
   =================================================== */
(function () {
    'use strict';

    /* ⚠️ SHU YERGA O'ZINGIZNING SHAXSIY EMAILINGIZNI YOZING.
       Bu email har doim, Firestore'ga qaramasdan ham, admin bo'ladi. */
    const OWNER_EMAIL = 'idrizmedia@gmail.com';

    const firebaseConfig = {
        apiKey: 'AIzaSyA2LiNy7o7l6kn1FTvOcXqBs14M3PVsjbI',
        authDomain: 'ziyomap.firebaseapp.com',
        projectId: 'ziyomap',
        storageBucket: 'ziyomap.firebasestorage.app',
        messagingSenderId: '982123868162',
        appId: '1:982123868162:web:6845723988c030fcd1f71b',
    };

    function reveal() {
        document.querySelectorAll('[data-admin-only]').forEach((el) => {
            el.style.display = '';
        });
    }

    function hide() {
        document.querySelectorAll('[data-admin-only]').forEach((el) => {
            el.style.display = 'none';
        });
    }

    async function checkAdmin() {
        const user = window.ZiyomapUsage && ZiyomapUsage.getUser();
        if (!user || !user.email) {
            window.ZiyomapIsAdmin = false;
            window.ZiyomapIsOwner = false;
            hide();
            document.dispatchEvent(new CustomEvent('ziyomap-admin-checked', { detail: false }));
            return false;
        }

        const email = user.email.toLowerCase();

        if (email === OWNER_EMAIL.toLowerCase()) {
            window.ZiyomapIsAdmin = true;
            window.ZiyomapIsOwner = true;
            reveal();
            document.dispatchEvent(new CustomEvent('ziyomap-admin-checked', { detail: true }));
            return true;
        }

        try {
            const { initializeApp, getApps, getApp } = await import(
                'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js'
            );
            const { getAuth, onAuthStateChanged } = await import(
                'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js'
            );
            const { getFirestore, doc, getDoc } = await import(
                'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js'
            );
            const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
            const authInst = getAuth(app);
            // Avvalgi sahifada (kirish.html) saqlangan Firebase sessiyasi
            // to'liq yuklanguncha kutamiz — aks holda so'rov "kirmagan" deb hisoblanadi.
            await new Promise((resolve) => {
                const unsub = onAuthStateChanged(authInst, () => {
                    unsub();
                    resolve();
                });
            });
            const db = getFirestore(app);
            const snap = await getDoc(doc(db, 'admins', email));
            const isAdmin = snap.exists();

            window.ZiyomapIsAdmin = isAdmin;
            window.ZiyomapIsOwner = false;
            if (isAdmin) reveal();
            else hide();
            document.dispatchEvent(new CustomEvent('ziyomap-admin-checked', { detail: isAdmin }));
            return isAdmin;
        } catch (err) {
            console.error('Admin tekshiruvida xatolik:', err);
            window.ZiyomapIsAdmin = false;
            hide();
            return false;
        }
    }

    window.ZiyomapAdminGuard = {
        checkAdmin,
        ownerEmail: OWNER_EMAIL,
        get isAdmin() {
            return !!window.ZiyomapIsAdmin;
        },
        get isOwner() {
            return !!window.ZiyomapIsOwner;
        },
    };

    function start() {
        hide(); // sahifa yuklanguncha admin tugmalarni yashirib turamiz
        checkAdmin();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
