/* ============================================================
   ZIYOMAP I18N — sodda, mustaqil (kutubxonasiz) til almashtirish tizimi.

   Ishlatilishi:
   1. Tarjima qilinishi kerak bo'lgan matnga data-i18n="kalit" qo'ying:
        <a data-i18n="nav.lab">Laboratoriya</a>
      (elementning boshlang'ich matni — o'zbekcha versiyasi, backup sifatida ishlatiladi)
   2. Kalitni pastdagi TRANSLATIONS lug'atiga uch tilda ham qo'shing.
   3. Til almashtirish tugmasi uchun: onclick="ZiyomapI18n.setLang('ru')"

   Placeholder matnlar uchun: data-i18n-placeholder="kalit"
   title/tooltip uchun: data-i18n-title="kalit"
   ============================================================ */
(function () {
    const TRANSLATIONS = {
        uz: {
            'nav.lab': 'Laboratoriya',
            'nav.blog': 'Blog',
            'nav.games': "O'yinlar",
            'nav.contest': 'Tanlov',
            'nav.winners': "G'oliblar",
            'nav.methods': '✨ Metodlar',
            'nav.subscribe': 'Obuna',
            'nav.login': 'Kirish',
            'onboard.welcome_title': 'Ziyomap\u2018ga xush kelibsiz! 👋',
            'onboard.skip': "O'tkazib yuborish",
            'onboard.next': 'Keyingi',
            'onboard.start': 'Boshladik!',
        },
        ru: {
            'nav.lab': 'Лаборатория',
            'nav.blog': 'Блог',
            'nav.games': 'Игры',
            'nav.contest': 'Конкурс',
            'nav.winners': 'Победители',
            'nav.methods': '✨ Методики',
            'nav.subscribe': 'Подписка',
            'nav.login': 'Войти',
            'onboard.welcome_title': 'Добро пожаловать в Ziyomap! 👋',
            'onboard.skip': 'Пропустить',
            'onboard.next': 'Далее',
            'onboard.start': 'Начать!',
        },
        en: {
            'nav.lab': 'Laboratory',
            'nav.blog': 'Blog',
            'nav.games': 'Games',
            'nav.contest': 'Contest',
            'nav.winners': 'Winners',
            'nav.methods': '✨ Methods',
            'nav.subscribe': 'Subscribe',
            'nav.login': 'Log in',
            'onboard.welcome_title': 'Welcome to Ziyomap! 👋',
            'onboard.skip': 'Skip',
            'onboard.next': 'Next',
            'onboard.start': "Let's start!",
        },
    };

    const SUPPORTED = Object.keys(TRANSLATIONS);
    const STORAGE_KEY = 'zy_lang';

    function getLang() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && SUPPORTED.includes(saved)) return saved;
        return 'uz';
    }

    function t(key, lang) {
        lang = lang || getLang();
        return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || (TRANSLATIONS.uz[key]) || null;
    }

    function apply(lang) {
        lang = lang || getLang();
        document.documentElement.setAttribute('lang', lang);

        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            const val = t(key, lang);
            if (val != null) el.textContent = val;
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
            const key = el.getAttribute('data-i18n-placeholder');
            const val = t(key, lang);
            if (val != null) el.setAttribute('placeholder', val);
        });
        document.querySelectorAll('[data-i18n-title]').forEach((el) => {
            const key = el.getAttribute('data-i18n-title');
            const val = t(key, lang);
            if (val != null) el.setAttribute('title', val);
        });

        document.querySelectorAll('.zy-lang-btn').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
    }

    function setLang(lang) {
        if (!SUPPORTED.includes(lang)) return;
        localStorage.setItem(STORAGE_KEY, lang);
        apply(lang);
    }

    document.addEventListener('DOMContentLoaded', () => apply());

    window.ZiyomapI18n = { setLang, getLang, t, apply, SUPPORTED };
})();
