/* ===================================================
   ZIYOMAP — Foydalanuvchini qayd etish + bosh sahifa
   kontentini Firestore'dan yuklash
   Eski fayllarga tegmaydi — faqat qo'shimcha kuzatuv.
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

    async function run() {
        try {
            const { initializeApp, getApps, getApp } = await import(
                'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js'
            );
            const { getAuth, onAuthStateChanged } = await import(
                'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js'
            );
            const { getFirestore, doc, getDoc, setDoc, serverTimestamp } = await import(
                'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js'
            );

            const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
            const db = getFirestore(app);
            const authInst = getAuth(app);

            /* ── Bosh sahifa kontenti (hammaga, login shart emas) ── */
            try {
                const snap = await getDoc(doc(db, 'site-content', 'homepage'));
                if (snap.exists()) {
                    const data = snap.data();
                    const photoEl = document.getElementById('hero-photo-img');
                    const bioEl = document.getElementById('hero-bio-text');
                    if (photoEl && data.heroPhotoUrl) photoEl.src = data.heroPhotoUrl;
                    if (bioEl && data.heroBio) bioEl.textContent = data.heroBio;
                }
            } catch (err) {
                console.error('Sayt kontentini yuklashda xatolik:', err);
            }

            /* ── Foydalanuvchini qayd etish (faqat kirgan bo'lsa) ── */
            await new Promise((resolve) => {
                const unsub = onAuthStateChanged(authInst, () => {
                    unsub();
                    resolve();
                });
            });

            const user = window.ZiyomapUsage && ZiyomapUsage.getUser();
            const uid = user && (user.uid || null);
            if (!uid) return; // haqiqiy Firebase sessiyasi bo'lmasa, hech narsa qilmaymiz

            const userRef = doc(db, 'users', uid);
            const existing = await getDoc(userRef);
            if (existing.exists() && existing.data().blocked) {
                // Bloklangan foydalanuvchi — sayt ochiladi, lekin belgi qo'yiladi (yozish amallari qoidalar orqali cheklanadi)
                window.ZiyomapUserBlocked = true;
            }

            await setDoc(
                userRef,
                {
                    email: user.email || null,
                    displayName: user.displayName || user.name || null,
                    photoURL: user.photoURL || null,
                    lastSeen: serverTimestamp(),
                    ...(existing.exists() ? {} : { firstSeen: serverTimestamp(), planId: 0 }),
                },
                { merge: true }
            );

            // Yangi ro'yxatdan o'tgan foydalanuvchiga bir martalik "Siz Bepul tarifidasiz" xabari
            if (!existing.exists() && !localStorage.getItem('zy_plan_intro_shown')) {
                localStorage.setItem('zy_plan_intro_shown', '1');
                setTimeout(() => {
                    if (window.ZiyomapLimits && ZiyomapLimits.showUpgradeNotice) {
                        ZiyomapLimits.showUpgradeNotice(
                            "Xush kelibsiz! Hozircha siz <b>\u2018Bepul\u2019</b> tarifidasiz \u2014 ba'zi AI vositalarida kunlik/oylik cheklovlar mavjud. Ko\u2018proq imkoniyat uchun \u2018Obuna\u2019 bo\u2018limiga tashrif buyuring."
                        );
                    } else {
                        alert("Xush kelibsiz! Hozircha siz \u2018Bepul\u2019 tarifidasiz. Ko\u2018proq imkoniyat uchun \u2018Obuna\u2019 bo\u2018limiga tashrif buyuring.");
                    }
                }, 1200);
            }
        } catch (err) {
            console.error('Foydalanuvchini qayd etishda xatolik:', err);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
})();
