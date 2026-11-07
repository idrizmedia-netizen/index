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
            'footer.tagline': "Fizika, kimyo, biologiya va matematika bo'yicha interaktiv ta'lim platformasi: virtual laboratoriyalar, o'yinlar, tanlovlar va metodlar.",
            'footer.verify_title': 'Hujjatni tekshirish',
            'footer.verify_ph': 'ZM-XXXXXXXX-2026',
            'footer.verify_btn': 'Tekshirish',
            'footer.physics': 'Fizika',
            'footer.chembio': 'Kimyo va biologiya',
            'footer.math': 'Matematika',
            'footer.games': "O'yinlar",
            'footer.platform': 'Platforma',
            'footer.contest': 'Tanlovlar',
            'footer.all_labs': 'Barcha laboratoriyalar',
            'footer.all_games': "Barcha o'yinlar",
            'footer.blog': 'Blog',
            'footer.methods': 'Interaktiv metodlar',
            'footer.board': 'Onlayn doska',
            'footer.groups': 'Guruhlar',
            'footer.subscribe': 'Obuna',
            'footer.register': 'Tanlovga yozilish',
            'footer.winners': "G'oliblar",
            'footer.cabinet': 'Shaxsiy kabinet',
            'footer.login': 'Kirish',
            'footer.contact': "Bog'lanish",
            'footer.privacy_account': 'Maxfiylik siyosati (hisob)',
            'footer.privacy_contest': 'Maxfiylik siyosati (tanlovlar)',
            'footer.top': 'Yuqoriga',
            'footer.rights': '\u00A9 2026 IdrizMedia. Barcha huquqlar himoyalangan. Ziyomap jamoasi.',
            'footer.news': 'Yangiliklar',
            'news.title': 'Yangiliklar',
            'news.more': "Davomini o'qish",
            'news.less': 'Yopish',
            'news.details': 'Batafsil',
            'news.pinned': 'Muhim',
            'news.all': 'Barcha yangiliklar',
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
            'footer.tagline': 'Интерактивная образовательная платформа по физике, химии, биологии и математике: виртуальные лаборатории, игры, конкурсы и методики.',
            'footer.verify_title': 'Проверить документ',
            'footer.verify_ph': 'ZM-XXXXXXXX-2026',
            'footer.verify_btn': 'Проверить',
            'footer.physics': 'Физика',
            'footer.chembio': 'Химия и биология',
            'footer.math': 'Математика',
            'footer.games': 'Игры',
            'footer.platform': 'Платформа',
            'footer.contest': 'Конкурсы',
            'footer.all_labs': 'Все лаборатории',
            'footer.all_games': 'Все игры',
            'footer.blog': 'Блог',
            'footer.methods': 'Интерактивные методики',
            'footer.board': 'Онлайн-доска',
            'footer.groups': 'Группы',
            'footer.subscribe': 'Подписка',
            'footer.register': 'Регистрация на конкурс',
            'footer.winners': 'Победители',
            'footer.cabinet': 'Личный кабинет',
            'footer.login': 'Войти',
            'footer.contact': 'Связаться с нами',
            'footer.privacy_account': 'Политика конфиденциальности (аккаунт)',
            'footer.privacy_contest': 'Политика конфиденциальности (конкурсы)',
            'footer.top': 'Наверх',
            'footer.rights': '\u00A9 2026 IdrizMedia. Все права защищены. Команда Ziyomap.',
            'footer.news': 'Новости',
            'news.title': 'Новости',
            'news.more': 'Читать далее',
            'news.less': 'Свернуть',
            'news.details': 'Подробнее',
            'news.pinned': 'Важно',
            'news.all': 'Все новости',
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
            'footer.tagline': 'An interactive learning platform for physics, chemistry, biology and mathematics: virtual labs, games, contests and teaching methods.',
            'footer.verify_title': 'Verify a document',
            'footer.verify_ph': 'ZM-XXXXXXXX-2026',
            'footer.verify_btn': 'Verify',
            'footer.physics': 'Physics',
            'footer.chembio': 'Chemistry & biology',
            'footer.math': 'Mathematics',
            'footer.games': 'Games',
            'footer.platform': 'Platform',
            'footer.contest': 'Contests',
            'footer.all_labs': 'All laboratories',
            'footer.all_games': 'All games',
            'footer.blog': 'Blog',
            'footer.methods': 'Interactive methods',
            'footer.board': 'Online whiteboard',
            'footer.groups': 'Groups',
            'footer.subscribe': 'Subscribe',
            'footer.register': 'Contest registration',
            'footer.winners': 'Winners',
            'footer.cabinet': 'My account',
            'footer.login': 'Log in',
            'footer.contact': 'Contact us',
            'footer.privacy_account': 'Privacy policy (account)',
            'footer.privacy_contest': 'Privacy policy (contests)',
            'footer.top': 'Back to top',
            'footer.rights': '\u00A9 2026 IdrizMedia. All rights reserved. The Ziyomap team.',
            'footer.news': 'News',
            'news.title': 'News',
            'news.more': 'Read more',
            'news.less': 'Show less',
            'news.details': 'Details',
            'news.pinned': 'Important',
            'news.all': 'All news',
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
