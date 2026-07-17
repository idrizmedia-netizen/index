/* ===================================================
   ZIYOMAP — Admin Guard
   Eski auth fayllarga tegmaydi. Faqat:
   - ZiyomapUsage.getUser() dan UID'ni oladi
   - Firestore "admins" kolleksiyasidan (UID bo'yicha) tekshiradi
   - [data-admin-only] elementlarni ko'rsatadi/yashiradi

   ⚠️ Email emas, UID ishlatiladi — chunki login/parol ulash
   (account linking) ba'zan email claim'ni ichki texnik
   manzilga almashtirib yuboradi, lekin UID hech qachon
   o'zgarmaydi.
   =================================================== */
(function () {
    'use strict';

    /* ⚠️ SHU YERGA O'ZINGIZNING FIREBASE UID'INGIZNI YOZING.
       Buni admin.html sahifasida konsolga chiqqan
       "currentUser.uid" qatoridan olishingiz mumkin.
       Bu UID har doim, Firestore'ga qaramasdan ham, admin bo'ladi. */
    const OWNER_UID = 'PhFPRmGQdnVNu3dsepFLem5Xzmg2';

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
        if (!user || !user.uid) {
            window.ZiyomapIsAdmin = false;
            window.ZiyomapIsOwner = false;
            hide();
            document.dispatchEvent(new CustomEvent('ziyomap-admin-checked', { detail: false }));
            return false;
        }

        if (user.uid === OWNER_UID) {
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
            const snap = await getDoc(doc(db, 'admins', user.uid));
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
        ownerUid: OWNER_UID,
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
