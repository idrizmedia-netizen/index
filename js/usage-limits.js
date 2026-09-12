/* ============================================================
   ZIYOMAP LIMITS — obuna rejasiga bog'liq kunlik/oylik cheklovlarni
   tekshiradi va (ruxsat berilsa) darhol sarflaydi (increment qiladi).

   Foydalanish:
     const res = await ZiyomapLimits.checkAndConsume('lesson');
     if (!res.allowed) { alert(res.message); return; }
     // ... aks holda davom eting, limit allaqachon sarflandi
   ============================================================ */
(function () {
    const FEATURE_LABELS = {
        lesson: 'Dars ishlanmasi',
        quiz: 'AI test generator',
        info: "Ma'lumot topish",
        chatphoto: "AI Chat'ga rasm yuborish",
    };

    let firestorePromise = null;
    function getFirestore() {
        if (!firestorePromise) {
            firestorePromise = (async () => {
                const { initializeApp, getApps, getApp } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js');
                const fs = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js');
                const firebaseConfig = {
                    apiKey: 'AIzaSyA2LiNy7o7l6kn1FTvOcXqBs14M3PVsjbI',
                    authDomain: 'ziyomap.firebaseapp.com',
                    projectId: 'ziyomap',
                    storageBucket: 'ziyomap.firebasestorage.app',
                    messagingSenderId: '982123868162',
                    appId: '1:982123868162:web:6845723988c030fcd1f71b',
                };
                const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
                return { db: fs.getFirestore(app), fs };
            })();
        }
        return firestorePromise;
    }

    function todayKey() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    function monthKey() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }

    async function getUserPlan(db, fs, uid) {
        try {
            const userSnap = await fs.getDoc(fs.doc(db, 'users', uid));
            const u = userSnap.exists() ? userSnap.data() : {};
            let planId = typeof u.planId === 'number' ? u.planId : 0;
            const expiresAt = u.planExpiresAt;
            if (expiresAt) {
                const expiresMs = expiresAt.toMillis ? expiresAt.toMillis() : new Date(expiresAt).getTime();
                if (expiresMs < Date.now()) planId = 0; // muddati o'tgan bo'lsa — Bepul rejaga tushadi
            }
            const settingsSnap = await fs.getDoc(fs.doc(db, 'site-content', 'obuna-settings'));
            const plans = settingsSnap.exists() ? (settingsSnap.data().plans || []) : [];
            return plans[planId] || plans[0] || null;
        } catch (err) {
            console.error('Reja ma\u2019lumotini olishda xatolik:', err);
            return null;
        }
    }

    // feature: 'lesson' | 'quiz' | 'info' | 'chatphoto'
    async function checkAndConsume(feature) {
        const uid = window.ZiyomapUsage ? ZiyomapUsage.getUserId() : null;
        if (!uid) {
            return { allowed: false, message: 'Davom etish uchun avval tizimga kiring.' };
        }

        let db, fs;
        try {
            ({ db, fs } = await getFirestore());
        } catch (err) {
            console.error('Firestore ulanishida xatolik:', err);
            return { allowed: true }; // ulanib bo'lmasa, foydalanuvchini bloklamaymiz
        }

        const plan = await getUserPlan(db, fs, uid);
        const limits = (plan && plan.limits) || {};
        const dailyLimit = limits[`${feature}Daily`];
        const monthlyLimit = limits[`${feature}Monthly`];

        if (dailyLimit == null && monthlyLimit == null) {
            return { allowed: true }; // bu reja uchun cheklov qo'yilmagan
        }

        const dayRef = fs.doc(db, 'users', uid, 'usage', todayKey());
        const monthRef = fs.doc(db, 'users', uid, 'usage', monthKey());

        try {
            const [daySnap, monthSnap] = await Promise.all([fs.getDoc(dayRef), fs.getDoc(monthRef)]);
            const dayCount = (daySnap.exists() ? daySnap.data()[feature] : 0) || 0;
            const monthCount = (monthSnap.exists() ? monthSnap.data()[feature] : 0) || 0;

            const label = FEATURE_LABELS[feature] || feature;
            const planName = plan ? plan.name : 'Bepul';

            if (dailyLimit != null && dayCount >= dailyLimit) {
                return {
                    allowed: false,
                    message: `"${planName}" rejangizda "${label}" uchun kunlik limit (${dailyLimit} ta) tugadi. Ertaga qayta urinib ko\u2018ring yoki rejangizni yangilang.`,
                };
            }
            if (monthlyLimit != null && monthCount >= monthlyLimit) {
                return {
                    allowed: false,
                    message: `"${planName}" rejangizda "${label}" uchun oylik limit (${monthlyLimit} ta) tugadi. Keyingi oyda qayta urinib ko\u2018ring yoki rejangizni yangilang.`,
                };
            }

            // Ruxsat berildi — darhol sarflaymiz (increment)
            await Promise.all([
                fs.setDoc(dayRef, { [feature]: fs.increment(1) }, { merge: true }),
                fs.setDoc(monthRef, { [feature]: fs.increment(1) }, { merge: true }),
            ]);
            return { allowed: true };
        } catch (err) {
            console.error('Limitni tekshirishda xatolik:', err);
            return { allowed: true }; // texnik xatolikda foydalanuvchini bloklamaymiz
        }
    }

    window.ZiyomapLimits = { checkAndConsume };
})();
