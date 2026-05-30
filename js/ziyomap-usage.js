(function () {
    const USER_KEY = 'user';
    const HISTORY_PREFIX = 'ziyomap_usage_';
    const MAX_ITEMS = 50;

    function getUser() {
        try {
            const raw = localStorage.getItem(USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function getUserId() {
        const u = getUser();
        if (!u) return null;
        return u.uid || u.email || u.phoneNumber || (u.telegramId ? 'tg_' + u.telegramId : null);
    }

    function isLoggedIn() {
        return !!getUser();
    }

    function setUser(data) {
        localStorage.setItem(USER_KEY, JSON.stringify(data));
    }

    function historyKey() {
        const id = getUserId();
        return id ? HISTORY_PREFIX + id : null;
    }

    function getUsageHistory() {
        const key = historyKey();
        if (!key) return [];
        try {
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch {
            return [];
        }
    }

    function logUsage(featureId, label) {
        const key = historyKey();
        if (!key) return;
        const list = getUsageHistory();
        list.unshift({
            id: featureId,
            label: label || featureId,
            at: new Date().toISOString(),
        });
        localStorage.setItem(key, JSON.stringify(list.slice(0, MAX_ITEMS)));
    }

    function clearUsageHistory() {
        const key = historyKey();
        if (key) localStorage.removeItem(key);
    }

    function clearSession() {
        clearUsageHistory();
        localStorage.removeItem(USER_KEY);
    }

    function formatWhen(iso) {
        try {
            return new Date(iso).toLocaleString('uz-UZ', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return '';
        }
    }

    window.ZiyomapUsage = {
        getUser,
        getUserId,
        isLoggedIn,
        setUser,
        getUsageHistory,
        logUsage,
        clearUsageHistory,
        clearSession,
        formatWhen,
    };
})();
