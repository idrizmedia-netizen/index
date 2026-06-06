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

  let overlay = null;

  function getSuggestionsHTML() {
    const chips = suggestions.filter(s => s.type === 'chip').map(s =>
      '<a href="' + s.url + '" class="zy-sg-chip" data-close-search>' + s.label + '</a>'
    ).join('');
    const links = suggestions.filter(s => s.type === 'link').map(s =>
      '<a href="' + s.url + '" class="zy-sg-link" data-close-search>' +
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
        '<a class="zy-search-result" href="' + i.url + '" data-close-search>' +
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
})();
