/* ===================================================
   ZIYOMAP — Bildirishnoma JS (v6 — Final Fix)
   =================================================== */
(function(){
  'use strict';

  /* ─── TOAST ─────────────────────────────────────── */
  var toastBox = document.createElement('div');
  toastBox.className = 'zy-notif-container';
  document.body.appendChild(toastBox);

  var ICO = {
    info:'fas fa-info-circle', success:'fas fa-check-circle',
    error:'fas fa-exclamation-circle', loading:'fas fa-spinner fa-spin', admin:'fas fa-bullhorn'
  };

  function showToast(txt, type, ms) {
    type = type || 'info';
    if (ms === undefined || ms === null) ms = 4000;
    if (type === 'loading') ms = 0;
    var el = document.createElement('div');
    el.className = 'zy-notif zy-notif--' + type;
    el.innerHTML =
      '<span class="zy-notif-icon"><i class="' + (ICO[type]||ICO.info) + '"></i></span>' +
      '<span class="zy-notif-text">' + String(txt).replace(/</g,'&lt;') + '</span>' +
      '<button class="zy-notif-close" aria-label="Yopish">&times;</button>';
    el.querySelector('.zy-notif-close').onclick = function(){ removeToast(el); };
    if (ms > 0) {
      var bar = document.createElement('div');
      bar.className = 'zy-notif-progress';
      bar.style.animationDuration = (ms/1000) + 's';
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
      var ico = el.querySelector('.zy-notif-icon i');
      if (ico) ico.className = ICO[type] || ICO.info;
    }
    var t = el.querySelector('.zy-notif-text');
    if (t) t.textContent = txt;
    if (type && type !== 'loading') setTimeout(function(){ removeToast(el); }, 3000);
  }

  /* ─── MA'LUMOTLAR ───────────────────────────────── */
  var NEWS = [
    {icon:'fas fa-flask',               txt:'Yangi virtual laboratoriya: Optika'},
    {icon:'fas fa-gamepad',             txt:"Arqon tortish o'yini yangilandi"},
    {icon:'fas fa-wand-magic-sparkles', txt:'AI Studio da yangi imkoniyatlar'},
    {icon:'fas fa-book',                txt:"Metodlar bo'limiga 10+ yangi metod"},
    {icon:'fas fa-brain',               txt:"Memory o'yiniga yangi darajalar"},
  ];

  function getAdminMsgs(){ try{return JSON.parse(localStorage.getItem('zy_admin_msgs')||'[]')}catch{return[]} }
  function getReadIds(){   try{return JSON.parse(localStorage.getItem('zy_bell_read_ids')||'[]')}catch{return[]} }
  function saveReadIds(ids){ try{localStorage.setItem('zy_bell_read_ids',JSON.stringify(ids))}catch{} }

  function getAllItems(){
    var rids = getReadIds();
    var admin = getAdminMsgs().map(function(m){
      return {id:'adm_'+m.id, icon:'fas fa-bullhorn', txt:m.text, isAdmin:true, read:rids.indexOf('adm_'+m.id)>=0};
    });
    var stat = NEWS.map(function(n,i){
      return {id:'st_'+i, icon:n.icon, txt:n.txt, isAdmin:false, read:rids.indexOf('st_'+i)>=0};
    });
    return admin.concat(stat);
  }

  function getUnread(){ return getAllItems().filter(function(i){return !i.read;}).length; }

  /* ─── BADGE ─────────────────────────────────────── */
  function updateBadges(){
    var n = getUnread();
    document.querySelectorAll('.zy-bell-badge').forEach(function(b){
      if(n > 0){ b.textContent = n > 99 ? '99+' : n; b.classList.add('show'); }
      else { b.classList.remove('show'); b.textContent=''; }
    });
  }

  /* ─── RO'YXAT RENDER ────────────────────────────── */
  function renderList(listEl){
    if(!listEl) return;
    var items = getAllItems();
    if(!items.length){
      listEl.innerHTML='<div class="zy-bell-empty"><i class="fas fa-bell-slash"></i><span>Bildirishnoma yo\'q</span></div>';
      return;
    }
    var html = '';
    items.forEach(function(item){
      html +=
        '<div class="zy-bell-dd-item' + (item.read?' zy-bell-dd-read':'') + '" data-id="' + item.id + '">' +
          '<i class="zy-dd-icon ' + item.icon + (item.isAdmin?' admin':'') + '" aria-hidden="true"></i>' +
          '<span class="zy-dd-text">' + String(item.txt).replace(/</g,'&lt;') + '</span>' +
          (!item.read ? '<span class="zy-bell-unread-dot"></span>' : '') +
        '</div>';
    });
    html +=
      '<div class="zy-bell-clear">' +
        '<i class="fas fa-check-double" aria-hidden="true"></i> Barchasini o\'qilgan belgilash' +
      '</div>';
    listEl.innerHTML = html;

    /* Click eventlar */
    listEl.querySelectorAll('.zy-bell-dd-item').forEach(function(el){
      el.addEventListener('click', function(){
        var id = el.dataset.id;
        var ids = getReadIds();
        if(ids.indexOf(id) < 0){ ids.push(id); saveReadIds(ids); }
        el.classList.add('zy-bell-dd-read');
        var dot = el.querySelector('.zy-bell-unread-dot');
        if(dot) dot.remove();
        updateBadges();
      });
    });

    var clrBtn = listEl.querySelector('.zy-bell-clear');
    if(clrBtn){
      clrBtn.addEventListener('click', function(e){
        e.stopPropagation();
        saveReadIds(getAllItems().map(function(i){return i.id;}));
        updateBadges();
        document.querySelectorAll('.zy-bell-dd-list').forEach(renderList);
      });
    }
  }

  /* ─── BACKDROP ─────────────────────────────────── */
  var bdEl = null;
  function getBd(){
    if(!bdEl){
      bdEl = document.createElement('div');
      bdEl.className = 'zy-bell-backdrop';
      bdEl.addEventListener('click', closeAll);
      document.body.appendChild(bdEl);
    }
    return bdEl;
  }

  function isMob(){ return window.innerWidth <= 768; }

  /* ─── OPEN / CLOSE ─────────────────────────────── */
  function openDd(dd){
    /* Boshqa ochiqlarni yopish */
    document.querySelectorAll('.zy-bell-dropdown.open').forEach(function(other){
      if(other !== dd) closeDd(other);
    });

    /* Ro'yxatni yangilash */
    var list = dd.querySelector('.zy-bell-dd-list');
    if(list) renderList(list);

    /* Backdrop */
    getBd().classList.add('show');

    /* Mobilda scroll o'chirish */
    if(isMob()) document.body.style.overflow = 'hidden';

    /* Ochish */
    dd.classList.add('open');

    /* Bell silkinishi */
    var wrap = dd.closest('.zy-bell-wrap');
    var btn = wrap ? wrap.querySelector('.zy-bell-btn, .nav-icon-btn') : null;
    if(btn){
      btn.classList.add('ringing');
      setTimeout(function(){ btn.classList.remove('ringing'); }, 700);
    }
  }

  function closeDd(dd){
    if(!dd) return;
    dd.classList.remove('open');
    if(bdEl) bdEl.classList.remove('show');
    document.body.style.overflow = '';
  }

  function closeAll(){
    document.querySelectorAll('.zy-bell-dropdown').forEach(closeDd);
  }

  /* ─── SWIPE DOWN (mobil) ────────────────────────── */
  function addSwipe(dd){
    var startY = 0, listScrollTop = 0;
    dd.addEventListener('touchstart', function(e){
      startY = e.touches[0].clientY;
      var list = dd.querySelector('.zy-bell-dd-list');
      listScrollTop = list ? list.scrollTop : 0;
    }, {passive:true});
    dd.addEventListener('touchend', function(e){
      var dy = e.changedTouches[0].clientY - startY;
      if(dy > 80 && listScrollTop <= 2) closeDd(dd);
    }, {passive:true});
  }

  /* ─── BELL INIT ─────────────────────────────────── */
  function initBells(){
    document.querySelectorAll('.zy-bell-wrap').forEach(function(wrap){
      /* MUHIM: zy-bell-btn YO nav-icon-btn — ikkalasini ham qidirish */
      var btn = wrap.querySelector('.zy-bell-btn') || wrap.querySelector('.nav-icon-btn');
      var dd  = wrap.querySelector('.zy-bell-dropdown');
      var list = wrap.querySelector('.zy-bell-dd-list');
      if(!btn || !dd || !list) return;

      /* Handle chiziqchasini qo'shish */
      if(!dd.querySelector('.zy-bell-handle')){
        var h = document.createElement('div');
        h.className = 'zy-bell-handle';
        h.setAttribute('aria-hidden','true');
        dd.insertBefore(h, dd.firstChild);
      }

      /* Boshlang'ich render */
      renderList(list);

      /* Swipe */
      addSwipe(dd);

      /* BELL TUGMA CLICK — bu asosiy muammo hal qilindi */
      btn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        if(dd.classList.contains('open')){
          closeDd(dd);
        } else {
          openDd(dd);
        }
      });

      /* Dropdown ichini bossam yopilmasin */
      dd.addEventListener('click', function(e){ e.stopPropagation(); });
    });

    /* Tashqarida bosish */
    document.addEventListener('click', function(){
      if(!isMob()) closeAll();
    });

    /* Escape */
    document.addEventListener('keydown', function(e){
      if(e.key==='Escape') closeAll();
    });

    updateBadges();
  }

  /* ─── ADMIN XABARLAR ────────────────────────────── */
  function checkAdmin(){
    var msgs = getAdminMsgs();
    var seen; try{seen=JSON.parse(localStorage.getItem('zy_admin_seen')||'[]')}catch{seen=[]}
    var changed = false;
    msgs.forEach(function(m){
      if(seen.indexOf(m.id)<0){
        showToast(m.text,'admin',0);
        seen.push(m.id); changed=true;
      }
    });
    if(changed){
      try{localStorage.setItem('zy_admin_seen',JSON.stringify(seen))}catch{}
      updateBadges();
      document.querySelectorAll('.zy-bell-dd-list').forEach(renderList);
    }
  }

  /* ─── REAL-TIME ─────────────────────────────────── */
  window.addEventListener('storage', function(e){
    if(e.key==='zy_admin_msgs'||e.key==='zy_bell_read_ids'){
      updateBadges();
      document.querySelectorAll('.zy-bell-dd-list').forEach(renderList);
    }
  });
  setInterval(function(){ updateBadges(); checkAdmin(); }, 10000);

  /* ─── GLOBAL API ────────────────────────────────── */
  window.ZiyomapNotify = {
    show:showToast, update:updateToast,
    info:    function(t,d){return showToast(t,'info',d);},
    success: function(t,d){return showToast(t,'success',d);},
    error:   function(t,d){return showToast(t,'error',d);},
    loading: function(t)  {return showToast(t,'loading',0);},
    admin:   function(t)  {return showToast(t,'admin',0);},
    close: closeAll, checkAdmin: checkAdmin,
    refresh: function(){ document.querySelectorAll('.zy-bell-dd-list').forEach(renderList); },
    ring: function(){
      document.querySelectorAll('.zy-bell-btn, .zy-bell-wrap .nav-icon-btn').forEach(function(b){
        b.classList.add('ringing');
        setTimeout(function(){b.classList.remove('ringing');},700);
      });
    }
  };

  /* ─── TIPS ──────────────────────────────────────── */
  var TIPS=['Ziyo AI Studio da dars rejalarini tayyorlang! 🤖',"O'yinlar bo'limida bilimingizni sinang! 🎮","Virtual laboratoriyalarda tajriba o'tkazing! 🔬",'AI Chat orqali istalgan savolga javob oling! 💬'];
  var tipIdx=0;

  /* ─── DOM READY ─────────────────────────────────── */
  function onReady(){
    initBells();
    setTimeout(checkAdmin,1500);
    var path=location.pathname.replace(/\/+$/,'');
    var isHome=path===''||path==='/index.html'||path==='/index';
    if(isHome){
      var h=new Date().getHours();
      var g=h<12?'Xayrli tong! ☀️':h<18?'Xayrli kun! 👋':'Xayrli kech! 🌙';
      if(!sessionStorage.getItem('zy_ws')){
        setTimeout(function(){showToast(g+' Ziyomapga xush kelibsiz!','info',5000);},3000);
        sessionStorage.setItem('zy_ws','1');
      } else {
        try{
          var ref=document.referrer?new URL(document.referrer):null;
          if(ref&&ref.origin===location.origin)
            setTimeout(function(){showToast(g+' Asosiy sahifaga qaytdingiz','info',4000);},1500);
        }catch{}
      }
    }
    setTimeout(function(){showToast(TIPS[tipIdx++%TIPS.length],'info',6000);},14000);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',onReady);
  } else {
    onReady();
  }

})();
