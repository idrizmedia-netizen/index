(function () {
    const STORAGE_KEY = 'ziyomap_local_accounts';

    function loadAccounts() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch {
            return [];
        }
    }

    function saveAccounts(list) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
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

    async function hashPassword(password, salt) {
        const data = new TextEncoder().encode(salt + password);
        const buf = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(buf))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
    }

    function findByLogin(login) {
        const key = normalizeLogin(login);
        return loadAccounts().find((a) => a.login === key) || null;
    }

    function findByUid(uid) {
        return loadAccounts().find((a) => a.uid === uid) || null;
    }

    async function registerCredentials(user, login, password) {
        const normalized = normalizeLogin(login);
        if (!user?.uid) return { ok: false, error: 'Avval Google orqali kiring.' };
        if (!isValidLogin(normalized)) {
            return { ok: false, error: 'Login: 3–24 ta harf, raqam yoki _ (masalan: ali_2024)' };
        }
        if (!isValidPassword(password)) {
            return { ok: false, error: 'Parol kamida 6 ta belgidan iborat bo‘lsin.' };
        }

        const accounts = loadAccounts();
        if (accounts.some((a) => a.login === normalized && a.uid !== user.uid)) {
            return { ok: false, error: 'Bu login band. Boshqasini tanlang.' };
        }

        const salt = crypto.randomUUID();
        const hash = await hashPassword(password, salt);
        const next = accounts.filter((a) => a.uid !== user.uid);
        next.push({
            login: normalized,
            salt,
            hash,
            uid: user.uid,
            displayName: user.displayName || normalized,
            email: user.email || null,
            photoURL: user.photoURL || null,
        });
        saveAccounts(next);
        return { ok: true, login: normalized };
    }

    async function loginWithCredentials(login, password) {
        const normalized = normalizeLogin(login);
        const acc = findByLogin(normalized);
        if (!acc) return { ok: false, error: 'Login yoki parol noto‘g‘ri.' };
        if (!isValidPassword(password)) return { ok: false, error: 'Login yoki parol noto‘g‘ri.' };

        const hash = await hashPassword(password, acc.salt);
        if (hash !== acc.hash) return { ok: false, error: 'Login yoki parol noto‘g‘ri.' };

        return {
            ok: true,
            user: {
                uid: acc.uid,
                displayName: acc.displayName || acc.login,
                email: acc.email || null,
                photoURL: acc.photoURL || null,
                localLogin: acc.login,
                provider: 'local',
            },
        };
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
