/* ===== Ziyomap Bildirishnoma Tizimi ===== */
(function(){
  'use strict';

  /* Toast container */
  const container = document.createElement('div');
  container.className = 'zy-notif-container';
  document.body.appendChild(container);

  /* Mobil overlay — body ga birinchi bolada qo'shiladi */
  const overlay = document.createElement('div');
  overlay.className = 'zy-bell-overlay';
  overlay.id = 'zyBellOverlayGlobal';
  document.body.appendChild(overlay);

  const icons = {
    info:'fas fa-info-circle', success:'fas fa-check-circle',
    error:'fas fa-exclamation-circle', loading:'fas fa-spinner', admin:'fas fa-bullhorn'
  };

  /* ===== TOAST ===== */
  function showToast(text, type, duration) {
    type = type || 'info';
    duration = (type === 'loading') ? 0 : (duration || 4000);
    const el = document.createElement('div');
    el.className = 'zy-notif zy-notif--' + type;
    el.innerHTML =
      '<span class="zy-notif-icon"><i class="' + (icons[type]||icons.info) + '"></i></span>' +
      '<span class="zy-notif-text">' + text.replace(/</g,'&lt;') + '</span>' +
      '<button class="zy-notif-close">&times;</button>';
    el.querySelector('.zy-notif-close').onclick = () => {
      el.classList.add('zy-notif--removing');
      setTimeout(() => el.remove(), 350);
    };
    if (duration > 0) {
      const bar = document.createElement('div');
      bar.className = 'zy-notif-progress';
      bar.style.animationDuration = (duration/1000) + 's';
      el.appendChild(bar);
      setTimeout(() => {
        if (el.parentNode) { el.classList.add('zy-notif--removing'); setTimeout(() => el.remove(), 350); }
      }, duration);
    }
    container.appendChild(el);
    updateAllBadges();
    return el;
  }

  function updateToast(el, text, type) {
    if (!el || !el.parentNode) return;
    if (type) {
      el.className = 'zy-notif zy-notif--' + type;
      const ic = el.querySelector('.zy-notif-icon i'); if (ic) ic.className = icons[type]||icons.info;
    }
    const t = el.querySelector('.zy-notif-text'); if (t) t.textContent = text;
    if (type !== 'loading') {
      const bar = document.createElement('div');
      bar.className = 'zy-notif-progress'; bar.style.animationDuration = '3s';
      el.appendChild(bar);
      setTimeout(() => {
        if (el.parentNode) { el.classList.add('zy-notif--removing'); setTimeout(() => el.remove(), 350); }
      }, 3000);
    }
    updateAllBadges();
  }

  /* ===== BELL MA'LUMOTLARI ===== */
  const siteNews = [
    { icon:'fas fa-flask',              text:'Yangi virtual laboratoriya: Optika' },
    { icon:'fas fa-gamepad',            text:"Arqon tortish o'yini yangilandi" },
    { icon:'fas fa-wand-magic-sparkles',text:'AI Studio da yangi imkoniyatlar' },
    { icon:'fas fa-book',               text:"Metodlar bo'limiga 10+ yangi metod" },
    { icon:'fas fa-brain',              text:"Memory o'yiniga yangi darajalar" },
  ];

  function loadAdmin() { try { return JSON.parse(localStorage.getItem('zy_admin_msgs')||'[]'); } catch { return []; } }
  function getReadIds() { try { return JSON.parse(localStorage.getItem('zy_bell_read_ids')||'[]'); } catch { return []; } }
  function saveReadIds(ids) { localStorage.setItem('zy_bell_read_ids', JSON.stringify(ids)); }

  function getAllItems() {
    const r = getReadIds();
    const admin = loadAdmin().map(m => ({
      id: 'admin_'+m.id, icon:'fas fa-bullhorn', text:m.text, isAdmin:true, read:r.includes('admin_'+m.id)
    }));
    const stat = siteNews.map((n,i) => ({
      id: 'static_'+i, icon:n.icon, text:n.text, isAdmin:false, read:r.includes('static_'+i)
    }));
    return [...admin, ...stat];
  }

  function updateAllBadges() {
    const count = getAllItems().filter(x=>!x.read).length;
    document.querySelectorAll('.zy-bell-badge').forEach(b => {
      b.textContent = count > 99 ? '99+' : count;
      b.classList.toggle('show', count > 0);
    });
  }

  function renderList(listEl) {
    if (!listEl) return;
    const items = getAllItems();
    if (!items.length) {
      listEl.innerHTML = '<div style="padding:14px;text-align:center;color:#9ca3af;font-size:13px">Bildirishnoma yo\'q</div>';
      return;
    }
    listEl.innerHTML = items.map(it =>
      '<div class="zy-bell-dd-item' + (it.read?' zy-bell-dd-read':'') + '" data-id="'+it.id+'">' +
        '<span class="zy-notif-icon' + (it.isAdmin?' zy-admin-icon':'') + '"><i class="'+it.icon+'"></i></span>' +
        '<span style="flex:1">'+it.text+'</span>' +
        (!it.read ? '<span class="zy-bell-unread-dot"></span>' : '') +
      '</div>'
    ).join('') +
    '<div class="zy-bell-clear" data-markall="'+listEl.id+'">✓ Barchasini o\'qilgan</div>';

    listEl.querySelectorAll('.zy-bell-dd-item').forEach(row => {
      row.addEventListener('click', () => {
        const r = getReadIds();
        if (!r.includes(row.dataset.id)) { r.push(row.dataset.id); saveReadIds(r); }
        updateAllBadges(); refreshAll();
      });
    });
    const ma = listEl.querySelector('[data-markall]');
    if (ma) ma.addEventListener('click', () => {
      saveReadIds(getAllItems().map(x=>x.id)); updateAllBadges(); refreshAll();
    });
  }

  function refreshAll() {
    document.querySelectorAll('.zy-bell-list').forEach(el => renderList(el));
  }

  /* ===== OVERLAY YOPISH ===== */
  function closeAll() {
    document.querySelectorAll('.zy-bell-dropdown').forEach(d => d.classList.remove('open'));
    overlay.classList.remove('open');
  }
  overlay.addEventListener('click', closeAll);

  /* ===== BELL INIT ===== */
  /* index.html va boshqa sahifalarda .zy-bell-wrap ichidagi
     har qanday .zy-bell-btn + .zy-bell-dropdown juftini topadi */
  function initAllBells() {
    /* ID asosida juftlar */
    const pairs = [
      { btn:'zyBellBtn',  dd:'zyBellDropdown',  list:'zyBellList'  },
      { btn:'zyBellBtnM', dd:'zyBellDropdownM', list:'zyBellListM' },
    ];
    pairs.forEach(p => {
      const btn  = document.getElementById(p.btn);
      const dd   = document.getElementById(p.dd);
      const list = document.getElementById(p.list);
      if (!btn || !dd || !list) return;

      /* list ID ni belgi sifatida saqlash */
      list.classList.add('zy-bell-list');
      renderList(list);

      btn.addEventListener('click', e => {
        e.stopPropagation();
        const wasOpen = dd.classList.contains('open');
        closeAll();
        if (!wasOpen) {
          dd.classList.add('open');
          overlay.classList.add('open');
          renderList(list);
        }
      });
    });

    /* Tashqariga bosish — desktop */
    document.addEventListener('click', e => {
      if (!e.target.closest('.zy-bell-wrap') && !e.target.closest('.zy-bell-dropdown')) {
        closeAll();
      }
    });

    updateAllBadges();
  }

  /* ===== ADMIN XABARLAR ===== */
  function checkAdmin() {
    const msgs = loadAdmin();
    const seen = JSON.parse(localStorage.getItem('zy_admin_seen')||'[]');
    let changed = false;
    msgs.forEach(msg => {
      if (!seen.includes(msg.id)) {
        showToast(msg.text, 'admin', 0);
        seen.push(msg.id); changed = true;
      }
    });
    if (changed) { localStorage.setItem('zy_admin_seen', JSON.stringify(seen)); updateAllBadges(); refreshAll(); }
  }

  window.addEventListener('storage', e => {
    if (e.key === 'zy_admin_msgs' || e.key === 'zy_bell_read_ids') {
      updateAllBadges(); refreshAll();
    }
  });
  setInterval(() => { updateAllBadges(); refreshAll(); }, 10000);

  /* ===== API ===== */
  window.ZiyomapNotify = {
    show: showToast,
    info:    (t,d) => showToast(t,'info',d),
    success: (t,d) => showToast(t,'success',d),
    error:   (t,d) => showToast(t,'error',d),
    loading:  t    => showToast(t,'loading',0),
    update: updateToast,
    admin:   t     => showToast(t,'admin',0),
    checkAdmin, refresh: refreshAll,
  };

  /* ===== DOM TAYYOR ===== */
  document.addEventListener('DOMContentLoaded', () => {
    initAllBells();
    setTimeout(checkAdmin, 1500);

    /* Faqat bosh sahifada salom */
    const path = window.location.pathname.replace(/\/+$/,'');
    const isHome = path==='' || path==='/index.html';
    if (isHome) {
      const h = new Date().getHours();
      const g = h<12 ? 'Xayrli tong!' : h>=18 ? 'Xayrli kech!' : 'Xayrli kun!';
      if (!sessionStorage.getItem('zy_hi')) {
        setTimeout(() => showToast(g+' Ziyomapga xush kelibsiz 👋','info',5000), 3000);
        sessionStorage.setItem('zy_hi','1');
      }
    }
    const tips = [
      "Ziyo AI Studio da dars rejalarini tayyorlang!",
      "O'yinlar bo'limida bilimingizni sinang!",
      "Virtual laboratoriyalarda tajriba o'tkazing!",
      "AI Chat orqali istalgan savolga javob oling!",
    ];
    let ti = 0;
    setTimeout(() => showToast(tips[ti++ % tips.length],'info',6000), 14000);
  });
})();
