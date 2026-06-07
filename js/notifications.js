/* ===== Ziyomap Bildirishnoma Tizimi & Qo'ng'iroqcha ===== */
(function(){
  'use strict';

  const container = document.createElement('div');
  container.className = 'zy-notif-container';
  document.body.appendChild(container);

  const icons = {
    info: 'fas fa-info-circle', success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle', loading: 'fas fa-spinner',
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
    notifHistory.unshift({ text, type, date: Date.now() });
    if (notifHistory.length > 20) notifHistory.length = 20;
    updateBellBadge();
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
        if (el.parentNode) { el.classList.add('zy-notif--removing'); setTimeout(() => el.remove(), 350); }
      }, 3000);
    }
    if (text) notifHistory.unshift({ text, type: type||'info', date: Date.now() });
    updateBellBadge();
  }

  // --- Bell ---
  function initBell() {
    const pairs = [
      { btn: 'zyBellBtn', dd: 'zyBellDropdown', list: 'zyBellList', badge: 'zyBellBadge' },
      { btn: 'zyBellBtnM', dd: 'zyBellDropdownM', list: 'zyBellListM', badge: 'zyBellBadgeM' },
    ];

    const siteNews = [
      { icon: 'fas fa-flask', text: 'Yangi virtual laboratoriya: Optika' },
      { icon: 'fas fa-gamepad', text: 'Arqon tortish o\'yini yangilandi' },
      { icon: 'fas fa-wand-magic-sparkles', text: 'AI Studio da yangi imkoniyatlar' },
      { icon: 'fas fa-book', text: 'Metodlar bo\'limiga 10+ yangi metod' },
      { icon: 'fas fa-brain', text: 'Memory o\'yiniga yangi darajalar' },
    ];

    pairs.forEach(p => {
      const btn = document.getElementById(p.btn);
      const dd = document.getElementById(p.dd);
      const list = document.getElementById(p.list);
      if (!btn || !dd || !list) return;
      const wrap = btn.closest('.zy-bell-wrap');

      list.innerHTML = siteNews.map(n =>
        '<div class="zy-bell-dd-item"><span class="zy-notif-icon"><i class="' + n.icon + '"></i></span><span>' + n.text + '</span></div>'
      ).join('');

      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        dd.classList.toggle('open');
      });
      document.addEventListener('click', function(e) {
        if (dd && wrap && !wrap.contains(e.target)) dd.classList.remove('open');
      });
    });
  }

  function updateBellBadge() {
    const ids = ['zyBellBadge','zyBellBadgeM'];
    ids.forEach(id => {
      const badge = document.getElementById(id);
      if (!badge) return;
      const unseen = notifHistory.length;
      if (unseen > 0) {
        badge.textContent = unseen > 99 ? '99+' : unseen;
        badge.classList.add('show');
      } else {
        badge.classList.remove('show');
      }
    });
  }

  // --- Admin ---
  function loadAdminMessages() {
    try { return JSON.parse(localStorage.getItem('zy_admin_msgs') || '[]'); } catch { return []; }
  }
  function checkAdminMessages() {
    const msgs = loadAdminMessages();
    const seen = JSON.parse(localStorage.getItem('zy_admin_seen') || '[]');
    let ns = false;
    msgs.forEach(msg => {
      if (!seen.includes(msg.id)) { showToast(msg.text, 'admin', 0); seen.push(msg.id); ns = true; }
    });
    if (ns) localStorage.setItem('zy_admin_seen', JSON.stringify(seen));
  }

  const tips = [
    "Ziyo AI Studio da dars rejalarini tayyorlang!",
    "O'yinlar bo'limida bilimingizni sinang!",
    "Virtual laboratoriyalarda tajriba o'tkazing!",
    "AI Chat orqali istalgan savolga javob oling!",
  ];
  let tipIndex = 0;
  function showRandomTip() { showToast(tips[tipIndex++ % tips.length], 'info', 6000); }

  function isMainPage() {
    const p = window.location.pathname.replace(/\/+$/, '');
    return p === '' || p === '/index.html';
  }

  window.ZiyomapNotify = {
    show: showToast, info: (t,d) => showToast(t,'info',d),
    success: (t,d) => showToast(t,'success',d), error: (t,d) => showToast(t,'error',d),
    loading: (t) => showToast(t,'loading',0), update: updateToast,
    admin: (t) => showToast(t,'admin',0), checkAdmin: checkAdminMessages,
  };

  document.addEventListener('DOMContentLoaded', function(){
    initBell();
    setTimeout(checkAdminMessages, 2000);
    if (isMainPage()) {
      const h = new Date().getHours();
      let g = 'Xayrli kun!';
      if (h < 12) g = 'Xayrli tong!';
      else if (h >= 18) g = 'Xayrli kech!';
      const seen = sessionStorage.getItem('zy_welcome_seen');
      if (!seen) {
        setTimeout(function(){ showToast(g + ' Ziyomapga xush kelibsiz 👋', 'info', 5000); }, 3000);
        sessionStorage.setItem('zy_welcome_seen', '1');
      } else {
        try {
          const ref = document.referrer ? new URL(document.referrer) : null;
          if (ref && ref.origin === window.location.origin) {
            setTimeout(function(){ showToast(g + ' Asosiy sahifaga qaytdingiz', 'info', 4000); }, 2000);
          }
        } catch(e) {}
      }
    }
    setTimeout(showRandomTip, 14000);
  });
})();
