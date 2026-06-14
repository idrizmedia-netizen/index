/* ===== Ziyomap Bildirishnoma Tizimi & Qo'ng'iroqcha v2.1 ===== */
(function(){
  'use strict';

  /* ---- Toast container ---- */
  const container = document.createElement('div');
  container.className = 'zy-notif-container';
  document.body.appendChild(container);

  const icons = {
    info: 'fas fa-info-circle',
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    loading: 'fas fa-spinner',
    admin: 'fas fa-bullhorn'
  };

  /* ===== TOAST ===== */
  function showToast(text, type, duration) {
    type = type || 'info';
    duration = (duration === undefined || duration === null) ? 4000 : duration;
    if (type === 'loading') duration = 0;

    const el = document.createElement('div');
    el.className = 'zy-notif zy-notif--' + type;
    el.innerHTML =
      '<span class="zy-notif-icon"><i class="' + (icons[type] || icons.info) + '"></i></span>' +
      '<span class="zy-notif-text">' + String(text).replace(/</g,'&lt;') + '</span>' +
      '<button class="zy-notif-close" aria-label="Yopish">&times;</button>';

    el.querySelector('.zy-notif-close').onclick = function(){
      closeToast(el);
    };

    if (duration > 0) {
      const bar = document.createElement('div');
      bar.className = 'zy-notif-progress';
      bar.style.animationDuration = (duration / 1000) + 's';
      el.appendChild(bar);
      setTimeout(() => closeToast(el), duration);
    }

    container.appendChild(el);
    return el;
  }

  function closeToast(el) {
    if (!el || !el.parentNode) return;
    el.classList.add('zy-notif--removing');
    setTimeout(() => el.remove(), 350);
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
    if (type && type !== 'loading') {
      if (!el.querySelector('.zy-notif-progress')) {
        const bar = document.createElement('div');
        bar.className = 'zy-notif-progress';
        bar.style.animationDuration = '3s';
        el.appendChild(bar);
      }
      setTimeout(() => closeToast(el), 3000);
    }
  }

  /* ===== SAYT YANGILIKLARI ===== */
  const siteNews = [
    { icon: 'fas fa-flask',              text: "Yangi virtual laboratoriya: Optika" },
    { icon: 'fas fa-gamepad',            text: "Arqon tortish o'yini yangilandi" },
    { icon: 'fas fa-wand-magic-sparkles',text: "AI Studio da yangi imkoniyatlar" },
    { icon: 'fas fa-book',               text: "Metodlar bo'limiga 10+ yangi metod" },
    { icon: 'fas fa-brain',              text: "Memory o'yiniga yangi darajalar" },
  ];

  function loadAdminMessages() {
    try { return JSON.parse(localStorage.getItem('zy_admin_msgs') || '[]'); }
    catch { return []; }
  }

  function getReadIds() {
    try { return JSON.parse(localStorage.getItem('zy_bell_read_ids') || '[]'); }
    catch { return []; }
  }
  function saveReadIds(ids) {
    localStorage.setItem('zy_bell_read_ids', JSON.stringify(ids));
  }

  function getAllBellItems() {
    const adminMsgs = loadAdminMessages();
    const readIds   = getReadIds();
    const adminItems = adminMsgs.map(m => ({
      id: 'admin_' + m.id, icon: 'fas fa-bullhorn',
      text: m.text, isAdmin: true,
      read: readIds.includes('admin_' + m.id)
    }));
    const staticItems = siteNews.map((n, i) => ({
      id: 'static_' + i, icon: n.icon,
      text: n.text, isAdmin: false,
      read: readIds.includes('static_' + i)
    }));
    return [...adminItems, ...staticItems];
  }

  function getUnreadCount() {
    return getAllBellItems().filter(item => !item.read).length;
  }

  function updateAllBadges() {
    const count = getUnreadCount();
    document.querySelectorAll('.zy-bell-badge').forEach(badge => {
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.classList.add('show');
      } else {
        badge.classList.remove('show');
      }
    });
  }

  function renderBellList(listEl) {
    if (!listEl) return;
    const items   = getAllBellItems();
    const readIds = getReadIds();
    const listId  = listEl.id || 'zyBellList';

    if (!items.length) {
      listEl.innerHTML =
        '<div class="zy-bell-empty">' +
        '<i class="fas fa-bell-slash"></i>' +
        "<span>Bildirishnoma yo'q</span></div>";
      return;
    }

    listEl.innerHTML =
      items.map(item =>
        `<div class="zy-bell-dd-item${item.read ? ' zy-bell-dd-read' : ''}" data-id="${item.id}">` +
        `<span class="zy-notif-icon${item.isAdmin ? ' zy-admin-icon' : ''}"><i class="${item.icon}"></i></span>` +
        `<span style="flex:1">${item.text}</span>` +
        (!item.read ? '<span class="zy-bell-unread-dot"></span>' : '') +
        '</div>'
      ).join('') +
      `<div class="zy-bell-clear" data-action="markall">✓ Barchasini o'qilgan deb belgilash</div>`;

    /* Item bosilganda o'qilgan qilish */
    listEl.querySelectorAll('.zy-bell-dd-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.id;
        const ids = getReadIds();
        if (!ids.includes(id)) {
          ids.push(id);
          saveReadIds(ids);
        }
        el.classList.add('zy-bell-dd-read');
        el.querySelector('.zy-bell-unread-dot')?.remove();
        updateAllBadges();
        refreshAllDropdowns();
      });
    });

    /* "Barchasini o'qish" */
    const markAll = listEl.querySelector('[data-action="markall"]');
    if (markAll) {
      markAll.addEventListener('click', (e) => {
        e.stopPropagation();
        saveReadIds(getAllBellItems().map(i => i.id));
        updateAllBadges();
        refreshAllDropdowns();
      });
    }
  }

  function refreshAllDropdowns() {
    document.querySelectorAll('.zy-bell-dd-list').forEach(listEl => {
      renderBellList(listEl);
    });
  }

  /* ===== BACKDROP (faqat mobil uchun) ===== */
  let backdrop = null;
  function getBackdrop() {
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'zy-bell-backdrop';
      backdrop.addEventListener('click', closeAllDropdowns);
      document.body.appendChild(backdrop);
    }
    return backdrop;
  }

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function openDropdown(dd) {
    /* Barcha boshqalarni yopish */
    closeAllDropdowns();
    dd.classList.add('open');
    if (isMobile()) {
      getBackdrop().classList.add('show');
      /* Body scroll ni to'xtatish */
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDropdown(dd) {
    if (!dd) return;
    dd.classList.remove('open');
    if (isMobile()) {
      if (backdrop) backdrop.classList.remove('show');
      document.body.style.overflow = '';
    }
  }

  function closeAllDropdowns() {
    document.querySelectorAll('.zy-bell-dropdown').forEach(d => closeDropdown(d));
  }

  /* ===== BELL INIT ===== */
  function initBell() {
    /* Barcha bell wrap larini topish */
    document.querySelectorAll('.zy-bell-wrap').forEach(wrap => {
      const btn  = wrap.querySelector('.zy-bell-btn');
      const dd   = wrap.querySelector('.zy-bell-dropdown');
      const list = wrap.querySelector('.zy-bell-dd-list');

      if (!btn || !dd || !list) return;

      /* Dastlab ro'yxatni render qilish */
      renderBellList(list);

      /* Bell tugmasini bosish */
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (dd.classList.contains('open')) {
          closeDropdown(dd);
        } else {
          renderBellList(list);
          openDropdown(dd);
        }
      });

      /* Dropdown ichini bosish — yopilmasin */
      dd.addEventListener('click', (e) => e.stopPropagation());

      /* Mobilda swipe down bilan yopish */
      let startY = 0;
      dd.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
      }, { passive: true });
      dd.addEventListener('touchend', (e) => {
        const diff = e.changedTouches[0].clientY - startY;
        if (diff > 80) closeDropdown(dd); /* 80px pastga suring */
      }, { passive: true });
    });

    /* Desktop: tashqariga bossanda yopish */
    document.addEventListener('click', () => {
      if (!isMobile()) closeAllDropdowns();
    });

    /* Escape tugmasi */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllDropdowns();
    });

    updateAllBadges();
  }

  /* ===== ADMIN XABARLARNI TEKSHIRISH ===== */
  function checkAdminMessages() {
    const msgs = loadAdminMessages();
    const seen = JSON.parse(localStorage.getItem('zy_admin_seen') || '[]');
    let hasNew = false;
    msgs.forEach(msg => {
      if (!seen.includes(msg.id)) {
        showToast(msg.text, 'admin', 0);
        seen.push(msg.id);
        hasNew = true;
      }
    });
    if (hasNew) {
      localStorage.setItem('zy_admin_seen', JSON.stringify(seen));
      updateAllBadges();
      refreshAllDropdowns();
    }
  }

  /* ===== REAL-TIME SINXRON ===== */
  window.addEventListener('storage', (e) => {
    if (e.key === 'zy_admin_msgs' || e.key === 'zy_bell_read_ids') {
      updateAllBadges();
      refreshAllDropdowns();
    }
  });

  setInterval(() => {
    updateAllBadges();
    checkAdminMessages();
  }, 10000);

  /* ===== TIPS ===== */
  const tips = [
    "Ziyo AI Studio da dars rejalarini tayyorlang!",
    "O'yinlar bo'limida bilimingizni sinang!",
    "Virtual laboratoriyalarda tajriba o'tkazing!",
    "AI Chat orqali istalgan savolga javob oling!",
  ];
  let tipIndex = 0;
  function showRandomTip() {
    showToast(tips[tipIndex++ % tips.length], 'info', 6000);
  }

  function isMainPage() {
    const p = window.location.pathname.replace(/\/+$/, '');
    return p === '' || p === '/index.html';
  }

  /* ===== GLOBAL API ===== */
  window.ZiyomapNotify = {
    show:       showToast,
    info:       (t,d) => showToast(t,'info',d),
    success:    (t,d) => showToast(t,'success',d),
    error:      (t,d) => showToast(t,'error',d),
    loading:    (t)   => showToast(t,'loading',0),
    update:     updateToast,
    admin:      (t)   => showToast(t,'admin',0),
    checkAdmin: checkAdminMessages,
    refresh:    refreshAllDropdowns,
    close:      closeAllDropdowns,
  };

  /* ===== DOM READY ===== */
  document.addEventListener('DOMContentLoaded', () => {
    initBell();
    setTimeout(checkAdminMessages, 1500);

    if (isMainPage()) {
      const h = new Date().getHours();
      let g = 'Xayrli kun!';
      if (h < 12) g = 'Xayrli tong!';
      else if (h >= 18) g = 'Xayrli kech!';
      const seen = sessionStorage.getItem('zy_welcome_seen');
      if (!seen) {
        setTimeout(() => showToast(g + " Ziyomapga xush kelibsiz 👋", 'info', 5000), 3000);
        sessionStorage.setItem('zy_welcome_seen', '1');
      } else {
        try {
          const ref = document.referrer ? new URL(document.referrer) : null;
          if (ref && ref.origin === window.location.origin) {
            setTimeout(() => showToast(g + " Asosiy sahifaga qaytdingiz", 'info', 4000), 2000);
          }
        } catch(e){}
      }
    }
    setTimeout(showRandomTip, 14000);
  });
})();
