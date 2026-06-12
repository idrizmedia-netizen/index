/* ===== Ziyomap Bildirishnoma Tizimi & Qo'ng'iroqcha ===== */
(function(){
  'use strict';

  const container = document.createElement('div');
  container.className = 'zy-notif-container';
  document.body.appendChild(container);

  // Mobil overlay element
  const overlay = document.createElement('div');
  overlay.className = 'zy-bell-overlay';
  document.body.appendChild(overlay);

  const icons = {
    info: 'fas fa-info-circle',
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    loading: 'fas fa-spinner',
    admin: 'fas fa-bullhorn'
  };

  let notifHistory = [];

  function showToast(text, type, duration) {
    type = type || 'info';
    duration = duration || 4000;
    if (type === 'loading') duration = 0;
    const el = document.createElement('div');
    el.className = 'zy-notif zy-notif--' + type;
    el.innerHTML =
      '<span class="zy-notif-icon"><i class="' + (icons[type] || icons.info) + '"></i></span>' +
      '<span class="zy-notif-text">' + text.replace(/</g,'&lt;') + '</span>' +
      '<button class="zy-notif-close">&times;</button>';
    el.querySelector('.zy-notif-close').onclick = function(){
      el.classList.add('zy-notif--removing');
      setTimeout(() => el.remove(), 350);
    };
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
    notifHistory.unshift({ text, type, date: Date.now(), read: false });
    if (notifHistory.length > 20) notifHistory.length = 20;
    updateAllBadges();
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
    if (text) notifHistory.unshift({ text, type: type||'info', date: Date.now(), read: false });
    updateAllBadges();
  }

  // ===== SAYT YANGILIKLARI =====
  const siteNews = [
    { icon: 'fas fa-flask', text: 'Yangi virtual laboratoriya: Optika' },
    { icon: 'fas fa-gamepad', text: 'Arqon tortish o\'yini yangilandi' },
    { icon: 'fas fa-wand-magic-sparkles', text: 'AI Studio da yangi imkoniyatlar' },
    { icon: 'fas fa-book', text: 'Metodlar bo\'limiga 10+ yangi metod' },
    { icon: 'fas fa-brain', text: 'Memory o\'yiniga yangi darajalar' },
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
    const readIds = getReadIds();
    const adminItems = adminMsgs.map(m => ({
      id: 'admin_' + m.id,
      icon: 'fas fa-bullhorn',
      text: m.text,
      isAdmin: true,
      read: readIds.includes('admin_' + m.id)
    }));
    const staticItems = siteNews.map((n, i) => ({
      id: 'static_' + i,
      icon: n.icon,
      text: n.text,
      isAdmin: false,
      read: readIds.includes('static_' + i)
    }));
    return [...adminItems, ...staticItems];
  }

  function getUnreadCount() {
    return getAllBellItems().filter(item => !item.read).length;
  }

  function updateAllBadges() {
    const count = getUnreadCount();
    ['zyBellBadge', 'zyBellBadgeM'].forEach(id => {
      const badge = document.getElementById(id);
      if (!badge) return;
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
    const items = getAllBellItems();
    const readIds = getReadIds();

    if (!items.length) {
      listEl.innerHTML = '<div style="padding:14px;color:var(--muted,#6b7280);font-size:13px;text-align:center">Bildirishnoma yo\'q</div>';
      return;
    }

    listEl.innerHTML = items.map(item => `
      <div class="zy-bell-dd-item${item.read ? ' zy-bell-dd-read' : ''}" data-id="${item.id}" style="cursor:pointer">
        <span class="zy-notif-icon${item.isAdmin ? ' zy-admin-icon' : ''}"><i class="${item.icon}"></i></span>
        <span>${item.text}</span>
        ${!item.read ? '<span class="zy-bell-unread-dot"></span>' : ''}
      </div>
    `).join('') + `
      <div class="zy-bell-clear" id="markAllRead_${listEl.id}">✓ Barchasini o'qilgan deb belgilash</div>
    `;

    listEl.querySelectorAll('.zy-bell-dd-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.id;
        const rids = getReadIds();
        if (!rids.includes(id)) {
          rids.push(id);
          saveReadIds(rids);
          el.classList.add('zy-bell-dd-read');
          el.querySelector('.zy-bell-unread-dot')?.remove();
          updateAllBadges();
          refreshAllDropdowns();
        }
      });
    });

    const markAllBtn = listEl.querySelector(`#markAllRead_${listEl.id}`);
    if (markAllBtn) {
      markAllBtn.addEventListener('click', () => {
        const allIds = getAllBellItems().map(i => i.id);
        saveReadIds(allIds);
        updateAllBadges();
        refreshAllDropdowns();
      });
    }
  }

  function refreshAllDropdowns() {
    ['zyBellList', 'zyBellListM'].forEach(id => {
      const listEl = document.getElementById(id);
      if (listEl) renderBellList(listEl);
    });
  }

  window.addEventListener('storage', (e) => {
    if (e.key === 'zy_admin_msgs' || e.key === 'zy_bell_read_ids') {
      updateAllBadges();
      refreshAllDropdowns();
    }
  });

  setInterval(() => {
    updateAllBadges();
    refreshAllDropdowns();
  }, 10000);

  // ===== OVERLAY YOPISH =====
  function closeAllDropdowns() {
    document.querySelectorAll('.zy-bell-dropdown').forEach(d => d.classList.remove('open'));
    overlay.classList.remove('open');
  }

  overlay.addEventListener('click', closeAllDropdowns);

  // ===== BELL INIT =====
  function initBell() {
    const pairs = [
      { btn: 'zyBellBtn',  dd: 'zyBellDropdown',  list: 'zyBellList' },
      { btn: 'zyBellBtnM', dd: 'zyBellDropdownM', list: 'zyBellListM' },
    ];

    pairs.forEach(p => {
      const btn  = document.getElementById(p.btn);
      const dd   = document.getElementById(p.dd);
      const list = document.getElementById(p.list);
      if (!btn || !dd || !list) return;

      list.id = p.list;
      renderBellList(list);

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dd.classList.contains('open');
        closeAllDropdowns();
        if (!isOpen) {
          dd.classList.add('open');
          overlay.classList.add('open'); // mobil overlay
          renderBellList(list);
        }
      });

      // Desktop: tashqariga bosilsa yopilsin
      document.addEventListener('click', (e) => {
        const wrap = btn.closest('.zy-bell-wrap');
        if (dd && wrap && !wrap.contains(e.target)) {
          dd.classList.remove('open');
          overlay.classList.remove('open');
        }
      });
    });

    updateAllBadges();
  }

  // ===== ADMIN XABARLARNI TEKSHIRISH =====
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

  window.ZiyomapNotify = {
    show: showToast,
    info:    (t,d) => showToast(t,'info',d),
    success: (t,d) => showToast(t,'success',d),
    error:   (t,d) => showToast(t,'error',d),
    loading: (t)   => showToast(t,'loading',0),
    update:  updateToast,
    admin:   (t)   => showToast(t,'admin',0),
    checkAdmin: checkAdminMessages,
    refresh: refreshAllDropdowns,
  };

  document.addEventListener('DOMContentLoaded', () => {
    initBell();
    setTimeout(checkAdminMessages, 2000);

    if (isMainPage()) {
      const h = new Date().getHours();
      let g = 'Xayrli kun!';
      if (h < 12) g = 'Xayrli tong!';
      else if (h >= 18) g = 'Xayrli kech!';
      const seen = sessionStorage.getItem('zy_welcome_seen');
      if (!seen) {
        setTimeout(() => { showToast(g + ' Ziyomapga xush kelibsiz 👋', 'info', 5000); }, 3000);
        sessionStorage.setItem('zy_welcome_seen', '1');
      } else {
        try {
          const ref = document.referrer ? new URL(document.referrer) : null;
          if (ref && ref.origin === window.location.origin) {
            setTimeout(() => { showToast(g + ' Asosiy sahifaga qaytdingiz', 'info', 4000); }, 2000);
          }
        } catch(e) {}
      }
    }
    setTimeout(showRandomTip, 14000);
  });
})();
