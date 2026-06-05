(function () {
    function getSaved() {
        const t = localStorage.getItem('zy_theme') || localStorage.getItem('theme') || 'dark';
        return t === 'light' ? 'light' : 'dark';
    }

    function applyTheme(theme) {
        const t = theme === 'light' ? 'light' : 'dark';
        const root = document.documentElement;
        root.setAttribute('data-theme', t);
        root.classList.toggle('metod-light', t === 'light');
        root.classList.toggle('metod-dark', t === 'dark');
        localStorage.setItem('zy_theme', t);
        localStorage.setItem('theme', t);

        document.querySelectorAll('[data-metod-theme-icon]').forEach((el) => {
            el.textContent = t === 'dark' ? '☀️' : '🌙';
        });
        document.querySelectorAll('[data-metod-theme-label]').forEach((el) => {
            el.textContent = t === 'dark' ? 'Kun rejimi' : 'Tun rejimi';
        });
    }

    function toggleTheme() {
        const cur = document.documentElement.getAttribute('data-theme') || 'dark';
        applyTheme(cur === 'dark' ? 'light' : 'dark');
    }

    window.MetodlarTheme = { applyTheme, toggleTheme };

    applyTheme(getSaved());
})();
