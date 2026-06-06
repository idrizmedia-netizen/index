/* ===== Ziyomap Notifications & Search ===== */
(function(){
  'use strict';

  // --- Notification System ---
  const container = document.createElement('div');
  container.className = 'zy-notif-container';
  document.body.appendChild(container);

  const icons = {
    info: 'fa-solid fa-circle-info',
    success: 'fa-solid fa-circle-check',
    error: 'fa-solid fa-circle-exclamation',
    loading: 'fa-solid fa-spinner',
    admin: 'fa-solid fa-bullhorn'
  };

  function showToast(text, type, duration) {
    type = type || 'info';
    duration = duration || 4000;
    if (type === 'loading') duration = 0;

    const el = document.createElement('div');
    el.className = 'zy-notif zy-notif--' + type;
    el.innerHTML =
      '<span class="zy-notif-icon"><i class="' + (icons[type] || icons.info) + '"></i></span>' +
      '<span class="zy-notif-text">' + text.replace(/</g,'&lt;') + '</span>' +
      '<button class="zy-notif-close" onclick="this.parentElement.classList.add(\'zy-notif--removing\');setTimeout(()=>this.parentElement.remove(),350)">&times;</button>';

    if (duration > 0) {
      const bar = document.createElement('div');
      bar.className = 'zy-notif-progress';
      bar.style.animationDuration = (duration/1000) + 's';
      el.appendChild(bar);
      setTimeout(() => {
        if (el.parentNode) {
          el.classList.add('zy-notif--removing');
          setTimeout(() => el.remove(), 350);
        }
      }, duration);
    }

    container.appendChild(el);
    return el;
  }

  function updateToast(el, text, type) {
    if (!el || !el.parentNode) return;
    if (type) {
      el.className = 'zy-notif zy-notif--' + type;
      const iconEl = el.querySelector('.zy-notif-icon i');
      if (iconEl) iconEl.className = icons[type] || icons.info;
    }
    const txtEl = el.querySelector('.zy-notif-text');
    if (txtEl) txtEl.textContent = text;
    if (type !== 'loading') {
      if (!el.querySelector('.zy-notif-progress')) {
        const bar = document.createElement('div');
        bar.className = 'zy-notif-progress';
        bar.style.animationDuration = '3s';
        el.appendChild(bar);
      }
      setTimeout(() => {
        if (el.parentNode) {
          el.classList.add('zy-notif--removing');
          setTimeout(() => el.remove(), 350);
        }
      }, 3000);
    }
  }

  // --- Admin Broadcast (localStorage mock) ---
  function loadAdminMessages() {
    try {
      return JSON.parse(localStorage.getItem('zy_admin_msgs') || '[]');
    } catch { return []; }
  }

  function checkAdminMessages() {
    const msgs = loadAdminMessages();
    const seen = JSON.parse(localStorage.getItem('zy_admin_seen') || '[]');
    msgs.forEach(msg => {
      if (!seen.includes(msg.id)) {
        showToast(msg.text, 'admin', 0);
        seen.push(msg.id);
      }
    });
    localStorage.setItem('zy_admin_seen', JSON.stringify(seen));
  }

  // --- Search System ---
  const searchIndex = [
    { title: 'Bosh sahifa', desc: 'Ziyomap portfolio — asosiy sahifa', url: '/', icon: 'fa-solid fa-house', iconBg: '#6366f1' },
    { title: 'Ziyo AI Studio', desc: 'AI yordamida dars rejalari, testlar, ma\'lumot topish', url: 'ai-tools.html', icon: 'fa-solid fa-wand-magic-sparkles', iconBg: '#0ea5e9' },
    { title: 'AI Chat', desc: 'Ziyomap AI bilan suhbat', url: 'ai-chat.html', icon: 'fa-solid fa-robot', iconBg: '#2563eb' },
    { title: 'Onlayn Doska', desc: 'Interaktiv doska — chizish, yozish, saqlash', url: 'doska.html', icon: 'fa-solid fa-pencil-alt', iconBg: '#3b82f6' },
    { title: 'O\'yinlar', desc: 'Testmasters — interaktiv o\'quv o\'yinlari', url: 'oyin/index.html', icon: 'fa-solid fa-gamepad', iconBg: '#10b981' },
    { title: 'Quiz', desc: '4 variantli testlar', url: 'oyin/quiz.html', icon: 'fa-solid fa-question-circle', iconBg: '#10b981' },
    { title: 'Flashcard', desc: 'Flashcard orqali o\'rganish', url: 'oyin/flashcard.html', icon: 'fa-solid fa-layer-group', iconBg: '#10b981' },
    { title: 'Tezkor', desc: '60 soniyada tezkor savol-javob', url: 'oyin/tezkor.html', icon: 'fa-solid fa-bolt', iconBg: '#10b981' },
    { title: 'Puzzle', desc: 'So\'zlar va harflardan puzzle yechish', url: 'oyin/puzzle.html', icon: 'fa-solid fa-puzzle-piece', iconBg: '#10b981' },
    { title: 'Memory', desc: 'Xotira o\'yini — juftliklarni toping', url: 'oyin/memory.html', icon: 'fa-solid fa-brain', iconBg: '#10b981' },
    { title: 'Arqon tortish', desc: '2 jamoa bilan arqon tortish o\'yini', url: 'oyin/arqon.html', icon: 'fa-solid fa-people-arrows', iconBg: '#10b981' },
    { title: 'Charx', desc: 'Charxni aylantirib savol olish', url: 'oyin/charx.html', icon: 'fa-solid fa-circle-notch', iconBg: '#10b981' },
    { title: 'Tartiblash', desc: 'Voqealarni to\'g\'ri tartibda joylashtiring', url: 'oyin/tartib.html', icon: 'fa-solid fa-list', iconBg: '#10b981' },
    { title: 'Ha/Yo\'q', desc: 'To\'g\'ri yoki noto\'g\'ri — tezkor test', url: 'oyin/ha-yo.html', icon: 'fa-solid fa-check-circle', iconBg: '#10b981' },
    { title: 'Sirli quti', desc: 'Sirli qutilardan savol va bonus yig\'ing', url: 'oyin/sirli-quti.html', icon: 'fa-solid fa-gift', iconBg: '#10b981' },
    { title: 'Virtual laboratoriya', desc: 'Fizika va kimyo virtual laboratoriyalari', url: 'labs/index.html', icon: 'fa-solid fa-flask', iconBg: '#f59e0b' },
    { title: 'Mayatnik', desc: 'Matematik mayatnik simulyatsiyasi', url: 'labs/lab-mayatnik.html', icon: 'fa-solid fa-clock', iconBg: '#f59e0b' },
    { title: 'Erkin tushish', desc: 'Erkin tushish simulyatsiyasi', url: 'labs/lab-erkin-tushish.html', icon: 'fa-solid fa-arrow-down', iconBg: '#f59e0b' },
    { title: 'Optika', desc: 'Yorug\'lik sinishi simulyatsiyasi', url: 'labs/lab-optika.html', icon: 'fa-solid fa-lightbulb', iconBg: '#f59e0b' },
    { title: 'Kimyo molekulalar', desc: 'Molekulyar harakat simulyatsiyasi', url: 'labs/lab-kimyo-molekulalar.html', icon: 'fa-solid fa-atom', iconBg: '#f59e0b' },
    { title: 'Metodlar', desc: 'O\'qitish metodlari to\'plami', url: 'metodlar/index.html', icon: 'fa-solid fa-book', iconBg: '#ec4899' },
    { title: 'Blog', desc: 'Ilmiy maqolalar va yangiliklar', url: '/#blog', icon: 'fa-solid fa-newspaper', iconBg: '#6366f1' },
    { title: 'Statistika', desc: 'O\'yin statistikasi va yutuqlar', url: 'oyin/statistika.html', icon: 'fa-solid fa-chart-simple', iconBg: '#10b981' },
  ];

  let searchOverlay = null;

  function createSearchOverlay() {
    if (searchOverlay) return;
    searchOverlay = document.createElement('div');
    searchOverlay.className = 'zy-search-overlay';
    searchOverlay.id = 'zySearchOverlay';
    searchOverlay.innerHTML =
      '<div class="zy-search-box">' +
        '<div class="zy-search-header">' +
          '<i class="fa-solid fa-magnifying-glass"></i>' +
          '<h3>Saytdan qidirish</h3>' +
          '<button class="zy-search-close" id="zySearchClose">&times;</button>' +
        '</div>' +
        '<div class="zy-search-input-wrap">' +
          '<i class="fa-solid fa-search"></i>' +
          '<input type="text" class="zy-search-input" id="zySearchInput" placeholder="Qidirish... Laboratoriya, o\'yin, metod..." autofocus>' +
        '</div>' +
        '<div class="zy-search-results" id="zySearchResults">' +
          '<div class="zy-search-empty">Qidirishni boshlash uchun matn kiriting</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(searchOverlay);

    const input = document.getElementById('zySearchInput');
    const results = document.getElementById('zySearchResults');
    const closeBtn = document.getElementById('zySearchClose');

    function doSearch(q) {
      q = q.toLowerCase().trim();
      if (!q) {
        results.innerHTML = '<div class="zy-search-empty">Qidirishni boshlash uchun matn kiriting</div>';
        return;
      }
      const matches = searchIndex.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q)
      );
      if (!matches.length) {
        results.innerHTML = '<div class="zy-search-empty">Hech narsa topilmadi</div>';
        return;
      }
      results.innerHTML = matches.map(m =>
        '<a class="zy-search-result" href="' + m.url + '" onclick="document.getElementById(\'zySearchOverlay\').classList.remove(\'open\')">' +
          '<i class="' + m.icon + '" style="background:' + m.iconBg + ';color:#fff"></i>' +
          '<div class="zy-search-result-info">' +
            '<div class="zy-search-result-title">' + m.title + '</div>' +
            '<div class="zy-search-result-desc">' + m.desc + '</div>' +
          '</div>' +
        '</a>'
      ).join('');
    }

    input.addEventListener('input', function(){ doSearch(this.value); });
    input.addEventListener('keydown', function(e){ if(e.key==='Escape') closeSearch(); });
    closeBtn.addEventListener('click', closeSearch);
    searchOverlay.addEventListener('click', function(e){ if(e.target===this) closeSearch(); });
  }

  function openSearch() {
    createSearchOverlay();
    searchOverlay.classList.add('open');
    setTimeout(() => document.getElementById('zySearchInput').focus(), 100);
  }

  function closeSearch() {
    if (searchOverlay) {
      searchOverlay.classList.remove('open');
      const input = document.getElementById('zySearchInput');
      if (input) input.value = '';
      const results = document.getElementById('zySearchResults');
      if (results) results.innerHTML = '<div class="zy-search-empty">Qidirishni boshlash uchun matn kiriting</div>';
    }
  }

  // --- Global API ---
  window.ZiyomapNotify = {
    show: showToast,
    info: (text, dur) => showToast(text, 'info', dur),
    success: (text, dur) => showToast(text, 'success', dur),
    error: (text, dur) => showToast(text, 'error', dur),
    loading: (text) => showToast(text, 'loading', 0),
    update: updateToast,
    admin: (text) => showToast(text, 'admin', 0),
    checkAdmin: checkAdminMessages
  };

  window.ZiyomapSearch = {
    open: openSearch,
    close: closeSearch
  };

  // --- Auto check admin messages on load ---
  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(checkAdminMessages, 2000);
  });

  // --- Demo: show welcome notification after page load ---
  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(function(){
      const hour = new Date().getHours();
      let greeting = 'Xayrli kun!';
      if (hour < 12) greeting = 'Xayrli tong!';
      else if (hour >= 18) greeting = 'Xayrli kech!';
      showToast(greeting + ' Ziyomapga xush kelibsiz \u{1F44B}', 'info', 4000);
    }, 3000);
  });

})();
