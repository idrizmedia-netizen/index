/* ===================================================
   ZIYOMAP — Bildirishnoma JS (v4 — Final)
   =================================================== */
(function(){
  'use strict';

  /* ===== TOAST ===== */
  const toastBox = document.createElement('div');
  toastBox.className = 'zy-notif-container';
  document.body.appendChild(toastBox);

  const ICO = {
    info:'fas fa-info-circle', success:'fas fa-check-circle',
    error:'fas fa-exclamation-circle', loading:'fas fa-spinner', admin:'fas fa-bullhorn'
  };

  function showToast(txt, type, ms) {
    type = type||'info';
    if (ms === undefined || ms === null) ms = 4000;
    if (type === 'loading') ms = 0;
    const el = document.createElement('div');
    el.className = 'zy-notif zy-notif--'+type;
    el.innerHTML =
      '<span class="zy-notif-icon"><i class="'+(ICO[type]||ICO.info)+'"></i></span>'+
      '<span class="zy-notif-text">'+String(txt).replace(/</g,'&lt;')+'</span>'+
      '<button class="zy-notif-close">&times;</button>';
    el.querySelector('.zy-notif-close').onclick = ()=>removeToast(el);
    if (ms > 0) {
      const bar = document.createElement('div');
      bar.className = 'zy-notif-progress';
      bar.style.animationDuration = (ms/1000)+'s';
      el.appendChild(bar);
      setTimeout(()=>removeToast(el), ms);
    }
    toastBox.appendChild(el);
    return el;
  }
  function removeToast(el) {
    if (!el||!el.parentNode) return;
    el.classList.add('zy-notif--removing');
    setTimeout(()=>el.remove(), 320);
  }
  function updateToast(el, txt, type) {
    if (!el||!el.parentNode) return;
    if (type) {
      el.className = 'zy-notif zy-notif--'+type;
      const i = el.querySelector('.zy-notif-icon i');
      if (i) i.className = ICO[type]||ICO.info;
    }
    const t = el.querySelector('.zy-notif-text');
    if (t) t.textContent = txt;
    if (type && type !== 'loading') setTimeout(()=>removeToast(el), 3000);
  }

  /* ===== MA'LUMOTLAR ===== */
  const NEWS = [
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
    const rids = getReadIds();
    const admin = getAdminMsgs().map(m=>({
      id:'adm_'+m.id, icon:'fas fa-bullhorn',
      txt:m.text, isAdmin:true, read:rids.includes('adm_'+m.id)
    }));
    const stat = NEWS.map((n,i)=>({
      id:'st_'+i, icon:n.icon,
      txt:n.txt, isAdmin:false, read:rids.includes('st_'+i)
    }));
    return [...admin,...stat];
  }
  function getUnread(){ return getAllItems().filter(i=>!i.read).length; }

  /* ===== BADGE ===== */
  function updateBadges(){
    const n = getUnread();
    document.querySelectorAll('.zy-bell-badge').forEach(b=>{
      if(n>0){ b.textContent=n>99?'99+':n; b.classList.add('show'); }
      else b.classList.remove('show');
    });
  }

  /* ===== LIST RENDER ===== */
  function renderList(listEl){
    if(!listEl) return;
    const items = getAllItems();
    const rids  = getReadIds();
    if(!items.length){
      listEl.innerHTML = '<div class="zy-bell-empty"><i class="fas fa-bell-slash"></i><span>Bildirishnoma yo\'q</span></div>';
      return;
    }
    const frag = document.createDocumentFragment();
    items.forEach(item=>{
      const d = document.createElement('div');
      d.className = 'zy-bell-dd-item'+(item.read?' zy-bell-dd-read':'');
      d.dataset.nid = item.id;
      d.innerHTML =
        '<i class="zy-dd-icon '+item.icon+(item.isAdmin?' admin':'')+'"></i>'+
        '<span class="zy-dd-text">'+item.txt+'</span>'+
        (!item.read?'<span class="zy-bell-unread-dot"></span>':'');
      d.addEventListener('click',()=>{
        const ids=getReadIds();
        if(!ids.includes(item.id)){ids.push(item.id);saveReadIds(ids);}
        d.classList.add('zy-bell-dd-read');
        d.querySelector('.zy-bell-unread-dot')?.remove();
        updateBadges();
      });
      frag.appendChild(d);
    });

    // "Barchasini o'qish"
    const clr = document.createElement('div');
    clr.className = 'zy-bell-clear';
    clr.innerHTML = '<i class="fas fa-check-double"></i> Barchasini o\'qilgan deb belgilash';
    clr.addEventListener('click', e=>{
      e.stopPropagation();
      saveReadIds(getAllItems().map(i=>i.id));
      updateBadges();
      document.querySelectorAll('.zy-bell-dd-list').forEach(renderList);
    });
    frag.appendChild(clr);

    listEl.innerHTML='';
    listEl.appendChild(frag);
  }

  /* ===== BACKDROP ===== */
  let bd = null;
  function getBd(){
    if(!bd){
      bd = document.createElement('div');
      bd.className = 'zy-bell-backdrop';
      bd.addEventListener('click', closeAll);
      document.body.appendChild(bd);
    }
    return bd;
  }

  function isMob(){ return window.innerWidth <= 768; }

  /* ===== OPEN / CLOSE ===== */
  function openDd(dd){
    closeAll();
    // ro'yxatni yangilash
    const list = dd.querySelector('.zy-bell-dd-list');
    if(list) renderList(list);
    dd.classList.add('open');
    if(isMob()){
      getBd().classList.add('show');
      document.body.style.overflow='hidden';
    }
    // bell silkinishi
    const btn = dd.closest('.zy-bell-wrap')?.querySelector('.zy-bell-btn');
    if(btn){ btn.classList.add('ringing'); setTimeout(()=>btn.classList.remove('ringing'),700); }
  }

  function closeDd(dd){
    if(!dd) return;
    dd.classList.remove('open');
    if(bd) bd.classList.remove('show');
    document.body.style.overflow='';
  }

  function closeAll(){
    document.querySelectorAll('.zy-bell-dropdown').forEach(closeDd);
  }

  /* ===== SWIPE DOWN ===== */
  function addSwipe(dd){
    let sy=0, sc=0;
    dd.addEventListener('touchstart', e=>{
      sy=e.touches[0].clientY;
      sc=dd.querySelector('.zy-bell-dd-list')?.scrollTop||0;
    },{passive:true});
    dd.addEventListener('touchend', e=>{
      const dy=e.changedTouches[0].clientY-sy;
      if(dy>90 && sc<=4) closeDd(dd);
    },{passive:true});
  }

  /* ===== BELL INIT ===== */
  function initBells(){
    document.querySelectorAll('.zy-bell-wrap').forEach(wrap=>{
      const btn  = wrap.querySelector('.zy-bell-btn');
      const dd   = wrap.querySelector('.zy-bell-dropdown');
      const list = wrap.querySelector('.zy-bell-dd-list');
      if(!btn||!dd||!list) return;

      // Handle chiziqchani qo'shish (agar yo'q bo'lsa)
      if(!dd.querySelector('.zy-bell-handle')){
        const h = document.createElement('div');
        h.className = 'zy-bell-handle';
        dd.insertBefore(h, dd.firstChild);
      }

      renderList(list);
      addSwipe(dd);

      // Bell tugma
      btn.addEventListener('click', e=>{
        e.stopPropagation();
        dd.classList.contains('open') ? closeDd(dd) : openDd(dd);
      });

      // Dropdown ichini bossam — yopilmasin
      dd.addEventListener('click', e=>e.stopPropagation());
    });

    // Desktop: tashqarida bosish
    document.addEventListener('click', ()=>{ if(!isMob()) closeAll(); });

    // Escape
    document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeAll(); });

    updateBadges();
  }

  /* ===== ADMIN XABARLAR ===== */
  function checkAdmin(){
    const msgs = getAdminMsgs();
    const seen = (()=>{ try{return JSON.parse(localStorage.getItem('zy_admin_seen')||'[]')}catch{return[]} })();
    let changed=false;
    msgs.forEach(m=>{
      if(!seen.includes(m.id)){
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

  /* ===== REAL-TIME ===== */
  window.addEventListener('storage', e=>{
    if(['zy_admin_msgs','zy_bell_read_ids'].includes(e.key)){
      updateBadges();
      document.querySelectorAll('.zy-bell-dd-list').forEach(renderList);
    }
  });
  setInterval(()=>{ updateBadges(); checkAdmin(); }, 10000);

  /* ===== GLOBAL API ===== */
  window.ZiyomapNotify = {
    show: showToast, update: updateToast,
    info:    (t,d)=>showToast(t,'info',d),
    success: (t,d)=>showToast(t,'success',d),
    error:   (t,d)=>showToast(t,'error',d),
    loading: t=>showToast(t,'loading',0),
    admin:   t=>showToast(t,'admin',0),
    checkAdmin, close: closeAll,
    refresh: ()=>document.querySelectorAll('.zy-bell-dd-list').forEach(renderList),
    ring: ()=>{
      document.querySelectorAll('.zy-bell-btn').forEach(b=>{
        b.classList.add('ringing');
        setTimeout(()=>b.classList.remove('ringing'),700);
      });
    }
  };

  /* ===== TIPS ===== */
  const TIPS = [
    'Ziyo AI Studio da dars rejalarini tayyorlang! 🤖',
    "O'yinlar bo'limida bilimingizni sinang! 🎮",
    "Virtual laboratoriyalarda tajriba o'tkazing! 🔬",
    'AI Chat orqali istalgan savolga javob oling! 💬',
  ];
  let tipIdx=0;

  /* ===== DOM READY ===== */
  document.addEventListener('DOMContentLoaded',()=>{
    initBells();
    setTimeout(checkAdmin,1500);

    const path = location.pathname.replace(/\/+$/,'');
    const isHome = path===''||path==='/index.html'||path==='/index';
    if(isHome){
      const h = new Date().getHours();
      const g = h<12?'Xayrli tong! ☀️':h<18?'Xayrli kun! 👋':'Xayrli kech! 🌙';
      if(!sessionStorage.getItem('zy_ws')){
        setTimeout(()=>showToast(g+' Ziyomapga xush kelibsiz!','info',5000),3000);
        sessionStorage.setItem('zy_ws','1');
      } else {
        try{
          const ref = document.referrer?new URL(document.referrer):null;
          if(ref&&ref.origin===location.origin)
            setTimeout(()=>showToast(g+' Asosiy sahifaga qaytdingiz','info',4000),1500);
        }catch{}
      }
    }
    setTimeout(()=>showToast(TIPS[tipIdx++%TIPS.length],'info',6000),14000);
  });
})();
