/* ===================================================
   ZIYOMAP — Bildirishnoma JS (v5 — Mukammal)
   Kompyuter + Telefon uchun to'liq qayta yozilgan
   =================================================== */
(function(){
  'use strict';

  /* ─── TOAST TIZIMI ─────────────────────────────── */
  const toastBox = document.createElement('div');
  toastBox.className = 'zy-notif-container';
  document.body.appendChild(toastBox);

  const ICO = {
    info:'fas fa-info-circle',
    success:'fas fa-check-circle',
    error:'fas fa-exclamation-circle',
    loading:'fas fa-spinner',
    admin:'fas fa-bullhorn'
  };

  function showToast(txt, type, ms) {
    type = type || 'info';
    if (ms === undefined || ms === null) ms = 4000;
    if (type === 'loading') ms = 0;

    const el = document.createElement('div');
    el.className = 'zy-notif zy-notif--' + type;
    el.innerHTML =
      '<span class="zy-notif-icon"><i class="' + (ICO[type]||ICO.info) + '"></i></span>' +
      '<span class="zy-notif-text">' + String(txt).replace(/</g,'&lt;') + '</span>' +
      '<button class="zy-notif-close" aria-label="Yopish">&times;</button>';

    el.querySelector('.zy-notif-close').addEventListener('click', function(){ removeToast(el); });

    if (ms > 0) {
      const bar = document.createElement('div');
      bar.className = 'zy-notif-progress';
      bar.style.animationDuration = (ms / 1000) + 's';
      el.appendChild(bar);
      setTimeout(function(){ removeToast(el); }, ms);
    }

    toastBox.appendChild(el);
    return el;
  }

  function removeToast(el) {
    if (!el || !el.parentNode) return;
    el.classList.add('zy-notif--removing');
    setTimeout(function(){ if(el.parentNode) el.remove(); }, 300);
  }

  function updateToast(el, txt, type) {
    if (!el || !el.parentNode) return;
    if (type) {
      el.className = 'zy-notif zy-notif--' + type;
      const ico = el.querySelector('.zy-notif-icon i');
      if (ico) ico.className = ICO[type] || ICO.info;
    }
    const textEl = el.querySelector('.zy-notif-text');
    if (textEl) textEl.textContent = txt;
    if (type && type !== 'loading') setTimeout(function(){ removeToast(el); }, 3000);
  }

  /* ─── MA'LUMOTLAR ──────────────────────────────── */
  const STATIC_NEWS = [
    {icon:'fas fa-flask',               txt:'Yangi virtual laboratoriya: Optika'},
    {icon:'fas fa-gamepad',             txt:"Arqon tortish o'yini yangilandi"},
    {icon:'fas fa-wand-magic-sparkles', txt:'AI Studio da yangi imkoniyatlar'},
    {icon:'fas fa-book',                txt:"Metodlar bo'limiga 10+ yangi metod"},
    {icon:'fas fa-brain',               txt:"Memory o'yiniga yangi darajalar"},
  ];

  function getAdminMsgs() {
    try { return JSON.parse(localStorage.getItem('zy_admin_msgs') || '[]'); } catch{ return []; }
  }
  function getReadIds() {
    try { return JSON.parse(localStorage.getItem('zy_bell_read_ids') || '[]'); } catch { return []; }
  }
  function saveReadIds(ids) {
    try { localStorage.setItem('zy_bell_read_ids', JSON.stringify(ids)); } catch {}
  }

  function getAllItems() {
    const rids = getReadIds();
    const admin = getAdminMsgs().map(function(m){
      return { id:'adm_'+m.id, icon:'fas fa-bullhorn', txt:m.text, isAdmin:true, read:rids.includes('adm_'+m.id) };
    });
    const stat = STATIC_NEWS.map(function(n,i){
      return { id:'st_'+i, icon:n.icon, txt:n.txt, isAdmin:false, read:rids.includes('st_'+i) };
    });
    return [].concat(admin, stat);
  }

  function getUnread() {
    return getAllItems().filter(function(i){ return !i.read; }).length;
  }

  /* ─── BADGE YANGILASH ───────────────────────────── */
  function updateBadges() {
    var n = getUnread();
    document.querySelectorAll('.zy-bell-badge').forEach(function(b){
      if (n > 0) {
        b.textContent = n > 99 ? '99+' : n;
        b.classList.add('show');
      } else {
        b.classList.remove('show');
        b.textContent = '';
      }
    });
  }

  /* ─── RO'YXAT RENDER ────────────────────────────── */
  function renderList(listEl) {
    if (!listEl) return;
    var items = getAllItems();
    var rids  = getReadIds();

    if (!items.length) {
      listEl.innerHTML =
        '<div class="zy-bell-empty">' +
          '<i class="fas fa-bell-slash"></i>' +
          '<span>Bildirishnoma yo\'q</span>' +
        '</div>';
      return;
    }

    var frag = document.createDocumentFragment();
    items.forEach(function(item) {
      var d = document.createElement('div');
      d.className = 'zy-bell-dd-item' + (item.read ? ' zy-bell-dd-read' : '');
      d.setAttribute('role', 'button');
      d.setAttribute('tabindex', '0');
      d.innerHTML =
        '<i class="zy-dd-icon ' + item.icon + (item.isAdmin?' admin':'') + '" aria-hidden="true"></i>' +
        '<span class="zy-dd-text">' + String(item.txt).replace(/</g,'&lt;') + '</span>' +
        (!item.read ? '<span class="zy-bell-unread-dot" aria-hidden="true"></span>' : '');

      function markRead() {
        var ids = getReadIds();
        if (!ids.includes(item.id)) { ids.push(item.id); saveReadIds(ids); }
        d.classList.add('zy-bell-dd-read');
        var dot = d.querySelector('.zy-bell-unread-dot');
        if (dot) dot.remove();
        updateBadges();
      }
      d.addEventListener('click', markRead);
      d.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); markRead(); } });
      frag.appendChild(d);
    });

    /* "Barchasini o'qish" tugmasi */
    var clr = document.createElement('div');
    clr.className = 'zy-bell-clear';
    clr.setAttribute('role', 'button');
    clr.setAttribute('tabindex', '0');
    clr.innerHTML = '<i class="fas fa-check-double" aria-hidden="true"></i> Barchasini o\'qilgan belgilash';
    clr.addEventListener('click', function(e){
      e.stopPropagation();
      saveReadIds(getAllItems().map(function(i){ return i.id; }));
      updateBadges();
      document.querySelectorAll('.zy-bell-dd-list').forEach(renderList);
    });
    clr.addEventListener('keydown', function(e){ if(e.key==='Enter') clr.click(); });
    frag.appendChild(clr);

    listEl.innerHTML = '';
    listEl.appendChild(frag);
  }

  /* ─── BACKDROP ─────────────────────────────────── */
  var backdropEl = null;

  function getBackdrop() {
    if (!backdropEl) {
      backdropEl = document.createElement('div');
      backdropEl.className = 'zy-bell-backdrop';
      backdropEl.addEventListener('click', closeAll);
      document.body.appendChild(backdropEl);
    }
    return backdropEl;
  }

  function isMobile() { return window.innerWidth <= 768; }

  /* ─── OPEN / CLOSE ─────────────────────────────── */
  var openDropdown = null; /* Hozir ochiq dropdown */

  function openDd(dd) {
    /* Avval boshqa ochiq dropdown'larni yopamiz */
    if (openDropdown && openDropdown !== dd) closeDd(openDropdown);
    openDropdown = dd;

    /* Ro'yxatni yangilash */
    var list = dd.querySelector('.zy-bell-dd-list');
    if (list) renderList(list);

    /* Backdrop */
    var bd = getBackdrop();
    bd.classList.add('show');

    /* Mobilda body scroll o'chirish */
    if (isMobile()) document.body.style.overflow = 'hidden';

    /* Dropdown ochish */
    dd.classList.add('open');

    /* Bell silkinishi */
    var wrap = dd.closest('.zy-bell-wrap');
    var btn = wrap ? wrap.querySelector('.zy-bell-btn') : null;
    if (btn) {
      btn.classList.add('ringing');
      setTimeout(function(){ btn.classList.remove('ringing'); }, 700);
    }
  }

  function closeDd(dd) {
    if (!dd) return;
    dd.classList.remove('open');
    if (openDropdown === dd) openDropdown = null;

    /* Backdrop yashirish */
    var bd = backdropEl;
    if (bd) bd.classList.remove('show');

    /* Scroll qaytarish */
    document.body.style.overflow = '';
  }

  function closeAll() {
    document.querySelectorAll('.zy-bell-dropdown').forEach(closeDd);
  }

  /* ─── SWIPE DOWN (mobil) ───────────────────────── */
  function addSwipe(dd) {
    var startY = 0;
    var startScrollTop = 0;

    dd.addEventListener('touchstart', function(e){
      startY = e.touches[0].clientY;
      var list = dd.querySelector('.zy-bell-dd-list');
      startScrollTop = list ? list.scrollTop : 0;
    }, { passive: true });

    dd.addEventListener('touchend', function(e){
      var delta = e.changedTouches[0].clientY - startY;
      /* Faqat ro'yxat yuqorida bo'lganda swipe ishlasin */
      if (delta > 70 && startScrollTop <= 2) {
        closeDd(dd);
      }
    }, { passive: true });
  }

  /* ─── BELL INIT ────────────────────────────────── */
  function initBells() {
    document.querySelectorAll('.zy-bell-wrap').forEach(function(wrap){
      var btn  = wrap.querySelector('.zy-bell-btn');
      var dd   = wrap.querySelector('.zy-bell-dropdown');
      var list = wrap.querySelector('.zy-bell-dd-list');
      if (!btn || !dd || !list) return;

      /* Handle chiziqchasini qo'shish */
      if (!dd.querySelector('.zy-bell-handle')) {
        var h = document.createElement('div');
        h.className = 'zy-bell-handle';
        h.setAttribute('aria-hidden','true');
        dd.insertBefore(h, dd.firstChild);
      }

      /* Boshlang'ich render */
      renderList(list);

      /* Swipe */
      addSwipe(dd);

      /* Bell tugma click */
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        if (dd.classList.contains('open')) {
          closeDd(dd);
        } else {
          openDd(dd);
        }
      });

      /* Dropdown ichini bossam — yopilmasin */
      dd.addEventListener('click', function(e){ e.stopPropagation(); });
    });

    /* Tashqariga bosish — faqat kompyuterda */
    document.addEventListener('click', function(e){
      if (!isMobile()) closeAll();
    });

    /* Escape tugmasi */
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape') closeAll();
    });

    updateBadges();
  }

  /* ─── ADMIN XABARLAR ───────────────────────────── */
  function checkAdmin() {
    var msgs = getAdminMsgs();
    var seen;
    try { seen = JSON.parse(localStorage.getItem('zy_admin_seen') || '[]'); } catch { seen = []; }

    var changed = false;
    msgs.forEach(function(m){
      if (!seen.includes(m.id)) {
        showToast(m.text, 'admin', 0);
        seen.push(m.id);
        changed = true;
      }
    });

    if (changed) {
      try { localStorage.setItem('zy_admin_seen', JSON.stringify(seen)); } catch {}
      updateBadges();
      document.querySelectorAll('.zy-bell-dd-list').forEach(renderList);
    }
  }

  /* ─── REAL-TIME (localStorage voqealari) ────────── */
  window.addEventListener('storage', function(e){
    if (e.key === 'zy_admin_msgs' || e.key === 'zy_bell_read_ids') {
      updateBadges();
      document.querySelectorAll('.zy-bell-dd-list').forEach(renderList);
    }
  });

  /* Har 10 soniyada yangilash */
  setInterval(function(){ updateBadges(); checkAdmin(); }, 10000);

  /* ─── GLOBAL API ────────────────────────────────── */
  window.ZiyomapNotify = {
    show:    showToast,
    update:  updateToast,
    info:    function(t,d){ return showToast(t,'info',d); },
    success: function(t,d){ return showToast(t,'success',d); },
    error:   function(t,d){ return showToast(t,'error',d); },
    loading: function(t){   return showToast(t,'loading',0); },
    admin:   function(t){   return showToast(t,'admin',0); },
    close:   closeAll,
    checkAdmin: checkAdmin,
    refresh: function(){ document.querySelectorAll('.zy-bell-dd-list').forEach(renderList); },
    ring: function(){
      document.querySelectorAll('.zy-bell-btn').forEach(function(b){
        b.classList.add('ringing');
        setTimeout(function(){ b.classList.remove('ringing'); }, 700);
      });
    }
  };

  /* ─── SANA & MASLAHITLAR ────────────────────────── */
  var TIPS = [
    'Ziyo AI Studio da dars rejalarini tayyorlang! 🤖',
    "O'yinlar bo'limida bilimingizni sinang! 🎮",
    "Virtual laboratoriyalarda tajriba o'tkazing! 🔬",
    'AI Chat orqali istalgan savolga javob oling! 💬',
  ];
  var tipIdx = 0;

  /* ─── DOM TAYYOR BO'LGANDA ─────────────────────── */
  function onDOMReady() {
    initBells();
    setTimeout(checkAdmin, 1500);

    var path = location.pathname.replace(/\/+$/, '');
    var isHome = path === '' || path === '/index.html' || path === '/index';

    if (isHome) {
      var h = new Date().getHours();
      var greet = h < 12 ? 'Xayrli tong! ☀️' : h < 18 ? 'Xayrli kun! 👋' : 'Xayrli kech! 🌙';
      if (!sessionStorage.getItem('zy_ws')) {
        setTimeout(function(){ showToast(greet + ' Ziyomapga xush kelibsiz!', 'info', 5000); }, 3000);
        sessionStorage.setItem('zy_ws', '1');
      } else {
        try {
          var ref = document.referrer ? new URL(document.referrer) : null;
          if (ref && ref.origin === location.origin) {
            setTimeout(function(){ showToast(greet + ' Asosiy sahifaga qaytdingiz', 'info', 4000); }, 1500);
          }
        } catch {}
      }
    }

    setTimeout(function(){ showToast(TIPS[tipIdx++ % TIPS.length], 'info', 6000); }, 14000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onDOMReady);
  } else {
    onDOMReady();
  }

})();
