(function () {
    function isLoggedIn() {
        return !!(window.ZiyomapUsage && ZiyomapUsage.getUser());
    }

    function safeReturnUrl(url) {
        if (!url) return null;
        try {
            const u = new URL(url, window.location.origin);
            if (u.origin === window.location.origin) return u.href;
            if (u.hostname === 'ziyomap.streamlit.app') return u.href;
        } catch {
            /* ignore */
        }
        return null;
    }

    function loginUrl(returnTo) {
        const base = 'kirish.html';
        const safe = safeReturnUrl(returnTo);
        if (safe) return `${base}?return=${encodeURIComponent(safe)}`;
        if (returnTo && returnTo.startsWith('/')) {
            return `${base}?return=${encodeURIComponent(new URL(returnTo, window.location.origin).href)}`;
        }
        return base;
    }

    function handleAuthClick(e, el) {
        if (isLoggedIn()) return true;
        e.preventDefault();
        e.stopPropagation();

        const href = el.getAttribute('href') || el.dataset.authHref || '';
        const returnTo = el.dataset.authReturn || href || window.location.href;
        const dest = loginUrl(returnTo);

        const msg =
            "Davom etish uchun avval tizimga kiring.\n\nKirish sahifasiga o'tasizmi?";
        if (confirm(msg)) {
            window.location.href = dest;
        }
        return false;
    }

    function initAuthGuards() {
        document.querySelectorAll('[data-require-auth]').forEach((el) => {
            el.addEventListener('click', (e) => handleAuthClick(e, el));
        });
    }

    function protectPage() {
        if (isLoggedIn()) return;
        const returnTo = window.location.pathname + window.location.search;
        window.location.replace(loginUrl(new URL(returnTo, window.location.origin).href));
    }

    window.ZiyomapAuthGuard = {
        isLoggedIn,
        loginUrl,
        initAuthGuards,
        protectPage,
        safeReturnUrl,
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAuthGuards);
    } else {
        initAuthGuards();
    }
})();
