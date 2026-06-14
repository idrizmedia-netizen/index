/* ===================================================
   ZIYOMAP — Bildirishnoma Tizimi JS (Final v3)
   =================================================== */
(function(){
  'use strict';

  /* ---- Toast container ---- */
  const toastContainer = document.createElement('div');
  toastContainer.className = 'zy-notif-container';
  document.body.appendChild(toastContainer);

  const ICONS = {
    info:    'fas fa-info-circle',
    success: 'fas fa-check-circle',
    error:   'fas fa-exclamation-circle',
    loading: 'fas fa-spinner',
    admin:   'fas fa-bullhorn'
  };

  /* ===== TOAST ===== */
  function showToast(text, type, duration) {
    type = type || 'info';
    if (duration === undefined || duration === null) duration = 4000;
    if (type === 'loading') duration = 0;

    const el = document.createElement('div');
    el.className = 'zy-notif zy-notif--' + type;
    el.innerHTML =
      '<span class="zy-notif-icon"><i class="' + (ICONS[type]||ICONS.info) + '"></i></span>' +
      '<span class="zy-notif-text">' + String(text).replace(/</g,'&lt;') + '</span>' +
      '<button class="zy-notif-close" aria-label="Yopish">&times;</button>';

    el.querySelector('.zy-notif-close').onclick = () => removeToast(el);

    if (duration > 0) {
      const bar = document.createElement('div');
      bar.className = 'zy-notif-progress';
      bar.style.animationDuration = (duration/1000) + 's';
      el.appendChild(bar);
      setTimeout(() => removeToast(el), duration);
    }
    toastContainer.appendChild(el);
    return el;
  }

  function removeToast(el) {
    if (!el || !el.parentNode) return;
    el.classList.add('zy-notif--removing');
    setTimeout(() => el.remove(), 350);
  }

  function updateToast(el, text, type) {
    if (!el || !el.parentNode) return;
    if (type) {
      el.className = 'zy-notif zy-notif--' + type;
      const i = el.querySelector('.zy-notif-icon i');
      if (i) i.className = ICONS[type] || ICONS.info;
    }
    const t = el.querySelector('.zy-notif-text');
    if (t) t.textContent = text;
    if (type && type !== 'loading') {
      setTimeout(() => removeToast(el), 3000);
    }
  }

  /* ===== MA'LUMOTLAR ===== */
  const STATIC_NEWS = [
    { icon: 'fas fa-flask',               text: 'Yangi virtual laboratoriya: Optika' },
    { icon: 'fas fa-gamepad',             text: "Arqon tortish o'yini yangilandi" },
    { icon: 'fas fa-wand-magic-sparkles', text: 'AI Studio da yangi imkoniyatlar' },
    { icon: 'fas fa-book',                text: "Metodlar bo'limiga 10+ yangi metod" },
    { icon: 'fas fa-brain',               text: "Memory o'yiniga yangi darajalar" },
  ];

  function getAdminMsgs() {
    try { return JSON.parse(localStorage.getItem('zy_admin_msgs') || '[]'); }
    catch { return []; }
  }
  function getReadIds() {
    try { return JSON.parse(localStorage.getItem('zy_bell_read_ids') || '[]'); }
    catch { return []; }
  }
  function saveReadIds(ids) {
    try { localStorage.setItem('zy_bell_read_ids', JSON.stringify(ids)); }
    catch {}
  }
  function markRead(id) {
    const ids = getReadIds();
    if (!ids.includes(id)) { ids.push(id); saveReadIds(ids); }
  }
  function markAllRead() {
    saveReadIds(getAllItems().map(i => i.id));
  }

  function getAllItems() {
    const readIds = getReadIds();
    const admin = getAdminMsgs().map(m => ({
      id: 'admin_' + m.id, icon: 'fas fa-bullhorn',
      text: m.text, isAdmin: true,
      read: readIds.includes('admin_' + m.id)
    }));
    const statics = STATIC_NEWS.map((n,i) => ({
      id: 'static_' + i, icon: n.icon,
      text: n.text, isAdmin: false,
      read: readIds.includes('static_' + i)
    }));
    return [...admin, ...statics];
  }

  function getUnreadCount() {
    return getAllItems().filter(i => !i.read).length;
  }

  /* ===== BADGE YANGILASH ===== */
  function updateBadges() {
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

  /* ===== LIST RENDER ===== */
  function renderList(listEl) {
    if (!listEl) return;
    const items = getAllItems();

    if (!items.length) {
      listEl.innerHTML =
        '<div class="zy-bell-empty">' +
        '<i class="fas fa-bell-slash"></i>' +
        '<span>Hozircha bildirishnoma yo\'q</span>' +
        '</div>';
      return;
    }

    listEl.innerHTML = items.map(item =>
      `<div class="zy-bell-dd-item${item.read ? ' zy-bell-dd-read' : ''}" data-nid="${item.id}">` +
      `<i class="zy-dd-icon ${item.icon}${item.isAdmin ? ' admin' : ''}"></i>` +
      `<span class="zy-dd-text">${item.text}</span>` +
      (!item.read ? '<span class="zy-bell-unread-dot"></span>' : '') +
      '</div>'
    ).join('');

    // "Barchasini o'qish"
    const clearBtn = document.createElement('div');
    clearBtn.className = 'zy-bell-clear';
    clearBtn.innerHTML = '<i class="fas fa-check-double"></i> Barchasini o\'qilgan deb belgilash';
    clearBtn.addEventListener('click', e => {
      e.stopPropagation();
      markAllRead();
      updateBadges();
      refreshAll();
    });
    listEl.appendChild(clearBtn);

    // Item click
    listEl.querySelectorAll('.zy-bell-dd-item').forEach(el => {
      el.addEventListener('click', () => {
        markRead(el.dataset.nid);
        el.classList.add('zy-bell-dd-read');
        el.querySelector('.zy-bell-unread-dot')?.remove();
        updateBadges();
        refreshAll();
      });
    });
  }

  function refreshAll() {
    document.querySelectorAll('.zy-bell-dd-list').forEach(renderList);
  }

  /* ===== BACKDROP ===== */
  let bd = null;
  function getBackdrop() {
    if (!bd) {
      bd = document.createElement('div');
      bd.className = 'zy-bell-backdrop';
      bd.addEventListener('click', closeAll);
      document.body.appendChild(bd);
    }
    return bd;
  }

  function isMobile() { return window.innerWidth <= 768; }

  function openDd(dd) {
    closeAll();
    renderAll(dd);
    dd.classList.add('open');
    if (isMobile()) {
      getBackdrop().classList.add('show');
      document.body.style.overflow = 'hidden';
      /* Bell icon silkinish */
      const btn = dd.closest('.zy-bell-wrap')?.querySelector('.zy-bell-btn');
      if (btn) {
        btn.classList.add('zy-bell-shake');
        setTimeout(() => btn.classList.remove('zy-bell-shake'), 700);
      }
    }
  }

  function closeDd(dd) {
    if (!dd) return;
    dd.classList.remove('open');
    if (bd) bd.classList.remove('show');
    document.body.style.overflow = '';
  }

  function closeAll() {
    document.querySelectorAll('.zy-bell-dropdown').forEach(closeDd);
  }

  function renderAll(dd) {
    const list = dd.querySelector('.zy-bell-dd-list');
    if (list) renderList(list);
  }

  /* ===== SWIPE DOWN (mobil) ===== */
  function addSwipe(dd) {
    let startY = 0, startScroll = 0;
    dd.addEventListener('touchstart', e => {
      startY = e.touches[0].clientY;
      startScroll = dd.querySelector('.zy-bell-dd-list')?.scrollTop || 0;
    }, { passive: true });
    dd.addEventListener('touchend', e => {
      const diff = e.changedTouches[0].clientY - startY;
      if (diff > 90 && startScroll <= 5) closeDd(dd);
    }, { passive: true });
  }

  /* ===== BELL INIT ===== */
  function initBells() {
    document.querySelectorAll('.zy-bell-wrap').forEach(wrap => {
      const btn  = wrap.querySelector('.zy-bell-btn');
      const dd   = wrap.querySelector('.zy-bell-dropdown');
      const list = wrap.querySelector('.zy-bell-dd-list');
      if (!btn || !dd || !list) return;

      /* Handle chiziqcha qo'shish (mobil uchun) */
      if (!dd.querySelector('.zy-bell-dd-handle')) {
        const handle = document.createElement('div');
        handle.className = 'zy-bell-dd-handle';
        dd.insertBefore(handle, dd.firstChild);
      }

      renderList(list);
      addSwipe(dd);

      btn.addEventListener('click', e => {
        e.stopPropagation();
        dd.classList.contains('open') ? closeDd(dd) : openDd(dd);
      });

      dd.addEventListener('click', e => e.stopPropagation());
    });

    /* Desktop: tashqarida bosib yopish */
    document.addEventListener('click', () => { if (!isMobile()) closeAll(); });

    /* Escape */
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

    updateBadges();
  }

  /* ===== ADMIN XABARLAR ===== */
  function checkAdmin() {
    const msgs = getAdminMsgs();
    const seen = (() => {
      try { return JSON.parse(localStorage.getItem('zy_admin_seen') || '[]'); }
      catch { return []; }
    })();
    let changed = false;
    msgs.forEach(msg => {
      if (!seen.includes(msg.id)) {
        showToast(msg.text, 'admin', 0);
        seen.push(msg.id);
        changed = true;
      }
    });
    if (changed) {
      try { localStorage.setItem('zy_admin_seen', JSON.stringify(seen)); } catch {}
      updateBadges(); refreshAll();
    }
  }

  /* ===== REAL-TIME SINXRON ===== */
  window.addEventListener('storage', e => {
    if (['zy_admin_msgs','zy_bell_read_ids'].includes(e.key)) {
      updateBadges(); refreshAll();
    }
  });
  setInterval(() => { updateBadges(); checkAdmin(); }, 10000);

  /* ===== GLOBAL API ===== */
  window.ZiyomapNotify = {
    show:       showToast,
    info:       (t,d) => showToast(t,'info',d),
    success:    (t,d) => showToast(t,'success',d),
    error:      (t,d) => showToast(t,'error',d),
    loading:    t     => showToast(t,'loading',0),
    update:     updateToast,
    admin:      t     => showToast(t,'admin',0),
    checkAdmin,
    refresh:    refreshAll,
    close:      closeAll,
    shake: () => {
      document.querySelectorAll('.zy-bell-btn').forEach(b => {
        b.classList.add('zy-bell-shake');
        setTimeout(() => b.classList.remove('zy-bell-shake'), 700);
      });
    }
  };

  /* ===== TIPS ===== */
  const TIPS = [
    'Ziyo AI Studio da dars rejalarini tayyorlang! 🤖',
    "O'yinlar bo'limida bilimingizni sinang! 🎮",
    'Virtual laboratoriyalarda tajriba o\'tkazing! 🔬',
    'AI Chat orqali istalgan savolga javob oling! 💬',
  ];
  let tipIdx = 0;

  /* ===== DOMContentLoaded ===== */
  document.addEventListener('DOMContentLoaded', () => {
    initBells();
    setTimeout(checkAdmin, 1500);

    const path = window.location.pathname.replace(/\/+$/,'');
    if (path === '' || path === '/index.html' || path === '/index') {
      const h = new Date().getHours();
      const greet = h < 12 ? 'Xayrli tong! ☀️' : h < 18 ? 'Xayrli kun! 👋' : 'Xayrli kech! 🌙';
      if (!sessionStorage.getItem('zy_ws')) {
        setTimeout(() => showToast(greet + ' Ziyomapga xush kelibsiz!', 'info', 5000), 3000);
        sessionStorage.setItem('zy_ws', '1');
      } else {
        try {
          const ref = document.referrer ? new URL(document.referrer) : null;
          if (ref && ref.origin === location.origin) {
            setTimeout(() => showToast(greet + ' Asosiy sahifaga qaytdingiz', 'info', 4000), 1500);
          }
        } catch {}
      }
    }
    setTimeout(() => showToast(TIPS[tipIdx++ % TIPS.length], 'info', 6000), 14000);
  });
})();
