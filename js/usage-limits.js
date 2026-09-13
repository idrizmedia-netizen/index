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
                // AdBlock/VPN/ba'zi tarmoqlar Firestore'ning striming ulanishini to'sib qo'yishi
                // mumkin — avtomatik uzun-so'rov (long-polling) rejimini yoqamiz.
                let db;
                try {
                    db = fs.initializeFirestore(app, { experimentalAutoDetectLongPolling: true, useFetchStreams: false });
                } catch (e) {
                    db = fs.getFirestore(app); // boshqa skriptda allaqachon ishga tushirilgan bo'lsa
                }
                return { db, fs };
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

    window.ZiyomapLimits = { checkAndConsume, showUpgradeNotice };
})();

/* ── Limit tugaganda chiqadigan chiroyli bildirishnoma (oddiy alert() o'rniga) ── */
function showUpgradeNotice(message) {
    const existing = document.getElementById('zy-limit-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'zy-limit-modal';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,10,30,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;font-family:Inter,system-ui,sans-serif';
    overlay.innerHTML = `
        <div style="background:#fff;border-radius:20px;padding:28px 26px;max-width:380px;width:100%;box-shadow:0 20px 50px rgba(0,0,0,0.35);text-align:center">
            <div style="width:58px;height:58px;border-radius:16px;background:linear-gradient(135deg,#7c3aed,#d946ef);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.6rem;margin:0 auto 14px;box-shadow:0 12px 26px rgba(124,58,237,0.35)">
                <i class="fas fa-star"></i>
            </div>
            <h3 style="margin:0 0 10px;font-size:1.1rem;color:#1e293b">Limit tugadi</h3>
            <p style="margin:0 0 20px;font-size:0.9rem;color:#475569;line-height:1.6">${message}</p>
            <div style="display:flex;gap:10px">
                <button type="button" id="zy-limit-close" style="flex:1;padding:12px;border-radius:12px;border:1px solid #e2e8f0;background:transparent;color:#475569;font-weight:700;cursor:pointer">Yopish</button>
                <a href="obuna.html" style="flex:1;padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;font-weight:700;cursor:pointer;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:6px"><i class="fas fa-star"></i> Obunani faollashtirish</a>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#zy-limit-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}
