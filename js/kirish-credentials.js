(function () {
    /* ===================================================
       ZIYOMAP — Login/parol (Firebase Auth "linking" asosida)
       Tashqi API (ZiyomapCredentials.*) o'zgarmagan —
       kirish-auth.js ga TEGILMAYDI.

       Endi login/parol Google hisobingizga HAQIQIY ravishda
       ulanadi (Firebase Auth account linking). Shuning uchun
       istalgan qurilmadan shu login/parol bilan kirsangiz,
       tizim buni aynan O'SHA Google hisobi deb taniydi —
       Cloud Function yoki Blaze tarif shart emas.

       Firestore faqat login/parolni ESLAB QOLISH uchun (ism,
       email, rasm ko'rsatish) ishlatiladi — xavfsizlikning
       o'zi to'liq Firebase Auth zimmasida.
       =================================================== */

    const firebaseConfig = {
        apiKey: 'AIzaSyA2LiNy7o7l6kn1FTvOcXqBs14M3PVsjbI',
        authDomain: 'ziyomap.firebaseapp.com',
        projectId: 'ziyomap',
        storageBucket: 'ziyomap.firebasestorage.app',
        messagingSenderId: '982123868162',
        appId: '1:982123868162:web:6845723988c030fcd1f71b',
    };
    const FAKE_DOMAIN = 'ziyomap-login.app'; // login'larni Firebase Auth email formatiga aylantirish uchun

    let appPromise = null;
    async function getApp() {
        if (!appPromise) {
            appPromise = (async () => {
                const { initializeApp, getApps, getApp: _getApp } = await import(
                    'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js'
                );
                return getApps().length ? _getApp() : initializeApp(firebaseConfig);
            })();
        }
        return appPromise;
    }

    async function authMod() {
        return import('https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js');
    }

    async function fsMod() {
        return import('https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js');
    }

    async function getAuthInst() {
        const { getAuth } = await authMod();
        return getAuth(await getApp());
    }

    async function getDb() {
        const { getFirestore } = await fsMod();
        return getFirestore(await getApp());
    }

    function normalizeLogin(raw) {
        return (raw || '').trim().toLowerCase();
    }

    function isValidLogin(login) {
        return /^[a-z0-9_]{3,24}$/.test(login);
    }

    function isValidPassword(password) {
        return typeof password === 'string' && password.length >= 6;
    }

    function loginEmail(login) {
        return `${normalizeLogin(login)}@${FAKE_DOMAIN}`;
    }

    /* Joriy Google sessiyasida login/parol allaqachon ulanganmi — tekshirish.
       Firebase Auth'ning o'zidan (providerData) o'qiydi, Firestore shart emas. */
    async function findByUid(uid) {
        if (!uid) return null;
        const auth = await getAuthInst();
        const user = auth.currentUser;
        if (!user || user.uid !== uid) return null;
        const pwProvider = user.providerData.find((p) => p.providerId === 'password');
        if (!pwProvider || !pwProvider.email || !pwProvider.email.endsWith('@' + FAKE_DOMAIN)) return null;
        return { login: pwProvider.email.split('@')[0], uid };
    }

    // Eski API bilan moslik uchun qoldirilgan — endi ishlatilmaydi
    async function findByLogin() {
        return null;
    }

    async function registerCredentials(user, login, password) {
        const normalized = normalizeLogin(login);
        if (!user?.uid) return { ok: false, error: 'Avval Google orqali kiring.' };
        if (!isValidLogin(normalized)) {
            return { ok: false, error: 'Login: 3\u201324 ta harf, raqam yoki _ (masalan: ali_2024)' };
        }
        if (!isValidPassword(password)) {
            return { ok: false, error: 'Parol kamida 6 ta belgidan iborat bo\u2018lsin.' };
        }

        try {
            const { EmailAuthProvider, linkWithCredential, unlink } = await authMod();
            const auth = await getAuthInst();
            const current = auth.currentUser;
            if (!current || current.uid !== user.uid) {
                return { ok: false, error: 'Sessiya topilmadi. Sahifani yangilab qayta urinib ko\u2018ring.' };
            }

            // Avval boshqa login ulangan bo'lsa — uni yechib, yangisini ulaymiz
            const existingPw = current.providerData.find((p) => p.providerId === 'password');
            if (existingPw) {
                try {
                    await unlink(current, 'password');
                } catch (e) {
                    /* e'tiborsiz qoldiriladi */
                }
            }

            const credential = EmailAuthProvider.credential(loginEmail(normalized), password);
            await linkWithCredential(current, credential);

            // Ko'rsatish uchun (email, ism, rasm) — Firestore'da eslab qolamiz
            try {
                const { doc, setDoc } = await fsMod();
                const db = await getDb();
                await setDoc(doc(db, 'local-accounts', normalized), {
                    uid: user.uid,
                    displayName: user.displayName || normalized,
                    email: user.email || null,
                    photoURL: user.photoURL || null,
                });
            } catch (e) {
                console.error('Ko\u2018rsatish ma\u2019lumotini saqlashda xatolik:', e);
            }

            return { ok: true, login: normalized };
        } catch (err) {
            console.error('Login/parol ulashda xatolik:', err);
            if (err.code === 'auth/email-already-in-use' || err.code === 'auth/credential-already-in-use') {
                return { ok: false, error: 'Bu login band. Boshqasini tanlang.' };
            }
            return { ok: false, error: 'Xatolik yuz berdi. Qayta urinib ko\u2018ring.' };
        }
    }

    async function loginWithCredentials(login, password) {
        const normalized = normalizeLogin(login);
        if (!isValidPassword(password)) return { ok: false, error: 'Login yoki parol noto\u2018g\u2018ri.' };

        try {
            const { signInWithEmailAndPassword } = await authMod();
            const auth = await getAuthInst();
            const result = await signInWithEmailAndPassword(auth, loginEmail(normalized), password);
            const u = result.user;

            // Haqiqiy ism/email/rasmni Firestore'dan olishga harakat qilamiz
            let displayName = u.displayName || normalized;
            let email = null;
            let photoURL = u.photoURL || null;
            try {
                const { doc, getDoc } = await fsMod();
                const db = await getDb();
                const snap = await getDoc(doc(db, 'local-accounts', normalized));
                if (snap.exists()) {
                    const d = snap.data();
                    displayName = d.displayName || displayName;
                    email = d.email || null;
                    photoURL = d.photoURL || photoURL;
                }
            } catch (e) {
                /* e'tiborsiz qoldiriladi — asosiy kirish baribir muvaffaqiyatli */
            }

            return {
                ok: true,
                user: {
                    uid: u.uid,
                    displayName,
                    email,
                    photoURL,
                    localLogin: normalized,
                    provider: 'local',
                },
            };
        } catch (err) {
            console.error('Kirishda xatolik:', err);
            return { ok: false, error: 'Login yoki parol noto\u2018g\u2018ri.' };
        }
    }

    window.ZiyomapCredentials = {
        findByUid,
        findByLogin,
        registerCredentials,
        loginWithCredentials,
        isValidLogin,
        isValidPassword,
    };
})();
