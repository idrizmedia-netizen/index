/* ZIYOMAP — /api/* so'rovlariga Firebase ID token qo'shuvchi yordamchi.
   Foydalanish: const res = await ZiyomapApiFetch('/api/chat', { method:'POST', headers:{...}, body:... }); */
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

    let authPromise = null;
    function getAuthInstance() {
        if (!authPromise) {
            authPromise = (async () => {
                const { initializeApp, getApps, getApp } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js');
                const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js');
                const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
                const auth = getAuth(app);
                // Saqlangan sessiya to'liq tiklanguncha kutamiz
                await new Promise((resolve) => {
                    const unsub = onAuthStateChanged(auth, () => { unsub(); resolve(); });
                });
                return auth;
            })();
        }
        return authPromise;
    }

    async function getIdToken() {
        try {
            const auth = await getAuthInstance();
            return auth.currentUser ? await auth.currentUser.getIdToken() : null;
        } catch (e) {
            console.error('ID token olinmadi:', e);
            return null;
        }
    }

    async function apiFetch(url, opts) {
        opts = opts || {};
        const token = await getIdToken();
        if (!token) {
            return new Response(
                JSON.stringify({ error: 'Sessiya topilmadi. Iltimos, tizimga qaytadan kiring.' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }
        const headers = new Headers(opts.headers || {});
        headers.set('Authorization', 'Bearer ' + token);
        return fetch(url, Object.assign({}, opts, { headers }));
    }

    window.ZiyomapApiFetch = apiFetch;
    window.ZiyomapGetIdToken = getIdToken;
})();
