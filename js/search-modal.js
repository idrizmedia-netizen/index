/* ===== Ziyomap Qidiruv Modali (Search Modal) ===== */
(function(){
  'use strict';

  const searchIndex = [
    { title: 'Bosh sahifa', desc: 'Ziyomap portfolio', url: '/', icon: 'fas fa-home', iconBg: '#6366f1' },
    { title: 'Ziyo AI Studio', desc: 'AI yordamida dars rejalari, testlar', url: 'ai-tools.html', icon: 'fas fa-wand-magic-sparkles', iconBg: '#0ea5e9' },
    { title: 'AI Chat', desc: 'Ziyomap AI bilan suhbat', url: 'ai-chat.html', icon: 'fas fa-robot', iconBg: '#2563eb' },
    { title: 'Onlayn Doska', desc: 'Interaktiv doska', url: 'doska.html', icon: 'fas fa-pencil-alt', iconBg: '#3b82f6' },
    { title: "O'yinlar", desc: "Testmasters o'quv o'yinlari", url: 'oyin/index.html', icon: 'fas fa-gamepad', iconBg: '#10b981' },
    { title: 'Quiz', desc: "4 variantli testlar", url: 'oyin/quiz.html', icon: 'fas fa-question-circle', iconBg: '#059669' },
    { title: 'Flashcard', desc: "Flashcard orqali o'rganish", url: 'oyin/flashcard.html', icon: 'fas fa-layer-group', iconBg: '#059669' },
    { title: 'Tezkor', desc: '60 soniyada tezkor savol-javob', url: 'oyin/tezkor.html', icon: 'fas fa-bolt', iconBg: '#059669' },
    { title: 'Puzzle', desc: "So'z va harflardan puzzle", url: 'oyin/puzzle.html', icon: 'fas fa-puzzle-piece', iconBg: '#059669' },
    { title: 'Memory', desc: "Xotira o'yini", url: 'oyin/memory.html', icon: 'fas fa-brain', iconBg: '#059669' },
    { title: 'Arqon tortish', desc: '2 jamoa arqon tortish', url: 'oyin/arqon.html', icon: 'fas fa-people-arrows', iconBg: '#059669' },
    { title: 'Charx', desc: 'Charx aylantirib savol olish', url: 'oyin/charx.html', icon: 'fas fa-circle-notch', iconBg: '#059669' },
    { title: 'Tartiblash', desc: "Voqealarni tartiblash", url: 'oyin/tartib.html', icon: 'fas fa-list', iconBg: '#059669' },
    { title: "Ha/Yo'q", desc: "Tezkor ha/yo'q testi", url: 'oyin/ha-yo.html', icon: 'fas fa-check-circle', iconBg: '#059669' },
    { title: 'Sirli quti', desc: "Sirli qutilardan savol va bonus", url: 'oyin/sirli-quti.html', icon: 'fas fa-gift', iconBg: '#059669' },
    { title: 'Virtual laboratoriya', desc: "Fizika va kimyo laboratoriyalari", url: 'labs/index.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Mayatnik', desc: 'Matematik mayatnik', url: 'labs/lab-mayatnik.html', icon: 'fas fa-clock', iconBg: '#f59e0b' },
    { title: 'Erkin tushish', desc: "Erkin tushish simulyatsiyasi", url: 'labs/lab-erkin-tushish.html', icon: 'fas fa-arrow-down', iconBg: '#f59e0b' },
    { title: 'Optika', desc: "Yorug'lik sinishi", url: 'labs/lab-optika.html', icon: 'fas fa-lightbulb', iconBg: '#f59e0b' },
    { title: 'Kimyo molekulalar', desc: 'Molekulyar harakat', url: 'labs/lab-kimyo-molekulalar.html', icon: 'fas fa-atom', iconBg: '#f59e0b' },
    { title: 'Metodlar', desc: "O'qitish metodlari", url: 'metodlar/index.html', icon: 'fas fa-book', iconBg: '#ec4899' },
    { title: 'Blog', desc: 'Ilmiy maqolalar va yangiliklar', url: '/#blog', icon: 'fas fa-newspaper', iconBg: '#6366f1' },
    { title: 'Statistika', desc: "O'yin statistikasi", url: 'oyin/statistika.html', icon: 'fas fa-chart-simple', iconBg: '#059669' },
    { title: 'Admin xabarlar', desc: 'Admin broadcast paneli', url: 'admin-xabarlar.html', icon: 'fas fa-bullhorn', iconBg: '#f97316' },
    { title: '3D Geometrik Jismlar', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-3d-geometriya.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'DNK Replikatsiyasi', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-biologiya-dna.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Ekosistem Modeli', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-biologiya-ekosistema.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Hujayra Bo\'linishi', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-biologiya-hujaira.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Davriy Jadval', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-davriy-jadval.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Doppler Effekti', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-doppler-effekti.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Ehtimollar Nazariyasi', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-ehtimollar.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Kondensator', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-elektr-kondensator.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Elektr Maydon', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-elektr-maydon.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Elektr Zanjiri', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-elektr-zanjir.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Elektroliz Laboratoriyasi', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-elektroliz.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Erkin Tushish Laboratoriyasi', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-erkin-tushish.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Fotosintez va Nafas Olish', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-fotosintez.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Fraktallar', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-fraktallar.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Genetika va Punnett Kvadrati', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-genetika-punnett.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Gravitatsiya', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-gravitatsiya.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Molekular Harakat', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-kimyo-molekulalar.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Reaksiya Kinetikasi', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-kimyo-reaksiya.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Kimyoviy Reaksiya Tenglashtirish', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-kimyo-tenglashtirish.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Kislota-Ishqor Titrimetria', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-kimyo-titrimetria.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Kristall Panjara', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-kristall-panjara.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Magnit Maydon', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-magnit-maydon.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Funksiya Grafigi Chizuvchi', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-matematika-grafik.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Vektor Maydon', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-matematika-vektor.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Matritsa Amallari', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-matritsa-amallar.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Mayatnik Laboratoriyasi', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-mayatnik.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Neyron va Asab Impulsi', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-neyron-impuls.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Optika — Yorug\'lik Sinishi', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-optika.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'pH va Bufer Eritmalar', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-ph-bufer.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Prujina Tebranishi', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-prujina-tebranishi.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Quyosh Sistemasi', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-quyosh-sistemasi.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Snaryad Harakati', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-snaryad-harakati.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Taylor va Fourier Qatorlari', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-taylor-fourier.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Termodinamika', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-termodinamika.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'To\'lqin Interferensiyasi', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-tolqin-interferensiya.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Radioaktiv Yemirilish', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-yadro-yemirilish.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Yurak va Qon Aylanishi', desc: 'Virtual laboratoriya ishi', url: 'labs/lab-yurak-qon.html', icon: 'fas fa-flask', iconBg: '#f59e0b' },
    { title: 'Peshqadamlar Reytingi', desc: 'Ta\'limiy o\'yinlar bo\'limi', url: 'oyin/reytin.html', icon: 'fas fa-trophy', iconBg: '#059669' },
    { title: 'O\'yin Statistikasi', desc: 'Ta\'limiy o\'yinlar bo\'limi', url: 'oyin/statistika.html', icon: 'fas fa-chart-simple', iconBg: '#059669' },
    { title: 'Interaktiv Metodlar', desc: 'O\'qitishning interaktiv metodlari', url: 'metodlar/index.html', icon: 'fas fa-book', iconBg: '#ec4899' },
    { title: 'Shaxsiy Kabinet', desc: 'Sizning natijalaringiz va profilingiz', url: 'dashboard.html', icon: 'fas fa-id-card', iconBg: '#6366f1' },
    { title: 'Kirish', desc: 'Tizimga kirish sahifasi', url: 'kirish.html', icon: 'fas fa-right-to-bracket', iconBg: '#6366f1' },
    { title: 'Tanlovga ro\'yxatdan o\'tish', desc: 'Tanlov uchun ro\'yxatdan o\'tish', url: 'tanlov-royxat.html', icon: 'fas fa-user-plus', iconBg: '#8b5cf6' },
    { title: 'G\'oliblar', desc: 'Tanlov g\'oliblari e\'loni', url: 'gyoliblar.html', icon: 'fas fa-medal', iconBg: '#f97316' },
    { title: 'Guruhlar', desc: 'Guruhlar va do\'stlar', url: 'guruhlar.html', icon: 'fas fa-users', iconBg: '#3b82f6' },
    { title: 'Test', desc: 'Onlayn test topshirish', url: 'test.html', icon: 'fas fa-file-pen', iconBg: '#dc2626' },
  ];

  const suggestions = [
    { type: 'chip', label: '🧪 Virtual Laboratoriya', url: 'labs/index.html' },
    { type: 'chip', label: '🎮 Ta\'limiy O\'yinlar', url: 'oyin/index.html' },
    { type: 'chip', label: '📚 Interaktiv Metodlar', url: 'metodlar/index.html' },
    { type: 'chip', label: '📐 Fizika', url: 'labs/lab-mayatnik.html' },
    { type: 'link', label: 'Yupqa linzalar laboratoriya ishi', icon: 'fas fa-microscope', url: 'labs/lab-optika.html' },
    { type: 'link', label: 'Nyuton qonunlari – interaktiv o\'yin', icon: 'fas fa-gamepad', url: 'oyin/quiz.html' },
    { type: 'link', label: 'AI yordamida dars rejasi tuzish', icon: 'fas fa-wand-magic-sparkles', url: 'ai-tools.html' },
    { type: 'link', label: 'Matematik mayatnik simulyatsiyasi', icon: 'fas fa-clock', url: 'labs/lab-mayatnik.html' },
  ];

  const rootPrefix = document.body.getAttribute('data-zy-root') || '';

  function resolveUrl(u) {
    if (u === '/' || u.startsWith('http') || u.startsWith('#') || u.startsWith('/#')) return rootPrefix ? (rootPrefix + '..' + u) : u;
    return rootPrefix + u;
  }

  let overlay = null;

  function getSuggestionsHTML() {
    const chips = suggestions.filter(s => s.type === 'chip').map(s =>
      '<a href="' + resolveUrl(s.url) + '" class="zy-sg-chip" data-close-search>' + s.label + '</a>'
    ).join('');
    const links = suggestions.filter(s => s.type === 'link').map(s =>
      '<a href="' + resolveUrl(s.url) + '" class="zy-sg-link" data-close-search>' +
        '<i class="' + s.icon + '" style="background:#2563eb;color:#fff"></i>' +
        '<span>' + s.label + '</span>' +
      '</a>'
    ).join('');
    return (
      '<div class="zy-sg">' +
        '<div class="zy-sg-label">Ommabop ruknlar:</div>' +
        '<div class="zy-sg-chips">' + chips + '</div>' +
        '<div class="zy-sg-label" style="margin-top:16px">Tavsiya etiladigan darsliklar:</div>' +
        '<div class="zy-sg-links">' + links + '</div>' +
      '</div>'
    );
  }

  function buildOverlay() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'zy-search-overlay';
    overlay.id = 'zySearchOverlay';
    overlay.innerHTML =
      '<div class="zy-search-box">' +
        '<div class="zy-search-header">' +
          '<i class="fas fa-search"></i>' +
          '<input type="text" class="zy-search-input" id="zySearchInput" placeholder="Qidirish..." autofocus>' +
          '<button class="zy-search-close" id="zySearchClose"><i class="fas fa-times"></i></button>' +
        '</div>' +
        '<div class="zy-search-body" id="zySearchBody"></div>' +
      '</div>';
    document.body.appendChild(overlay);

    const input = document.getElementById('zySearchInput');
    const body = document.getElementById('zySearchBody');
    const close = document.getElementById('zySearchClose');

    body.innerHTML = getSuggestionsHTML();

    input.addEventListener('input', function() {
      const q = this.value.toLowerCase().trim();
      if (!q) { body.innerHTML = getSuggestionsHTML(); return; }
      const m = searchIndex.filter(i => i.title.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q));
      if (!m.length) { body.innerHTML = '<div class="zy-sg-empty">Hech narsa topilmadi</div>'; return; }
      body.innerHTML = m.map(i =>
        '<a class="zy-search-result" href="' + resolveUrl(i.url) + '" data-close-search>' +
          '<i class="' + i.icon + '" style="background:' + i.iconBg + '"></i>' +
          '<div class="zy-search-result-info">' +
            '<div class="zy-search-result-title">' + i.title + '</div>' +
            '<div class="zy-search-result-desc">' + i.desc + '</div>' +
          '</div>' +
        '</a>'
      ).join('');
    });

    input.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeSearch();
      if (e.key === 'Enter') {
        const first = body.querySelector('[data-close-search]');
        if (first) { closeSearch(); window.location.href = first.getAttribute('href'); }
      }
    });

    close.addEventListener('click', closeSearch);
    overlay.addEventListener('click', function(e) { if (e.target === this) closeSearch(); });

    overlay.addEventListener('click', function(e) {
      const link = e.target.closest('[data-close-search]');
      if (link) setTimeout(closeSearch, 50);
    });
  }

  function openSearch() {
    buildOverlay();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('zySearchInput').focus(), 100);
  }

  function closeSearch() {
    if (overlay) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  window.ZiyomapSearch = { open: openSearch, close: closeSearch };

  document.addEventListener('DOMContentLoaded', function() {
    buildOverlay();
  });

  // Ctrl+K / Cmd+K bilan ham qidiruvni ochish (lupa tugmasi qaysi sahifada
  // bo'lsa, shu sahifada)
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openSearch();
    }
  });
})();
