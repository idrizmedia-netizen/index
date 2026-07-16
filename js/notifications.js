/* ===================================================
   ZIYOMAP — Bildirishnoma JS (v9 — Mukammal Final)
   Kompyuter: dropdown | Mobil: alohida overlay element
   =================================================== */
(function(){
  'use strict';

  /* ─── DROPDOWN + MOBIL OVERLAY — kun/tun rejimiga mos dizayn ── */
  var styleTag = document.createElement('style');
  styleTag.textContent = `
    .zy-bell-wrap{ position:relative!important; }

    .zy-bell-dropdown{
      border-radius:18px!important; overflow:hidden!important;
      padding:0!important; width:360px!important; max-width:92vw!important;
      position:absolute!important; top:calc(100% + 12px)!important; right:0!important;
      display:none!important; z-index:99999!important;
    }
    .zy-bell-dropdown.open{ display:block!important; animation:zyDdIn .18s ease!important; }
    @keyframes zyDdIn{ from{opacity:0;transform:translateY(-8px);} to{opacity:1;transform:translateY(0);} }

    .zy-bell-backdrop{
      position:fixed!important; inset:0!important; background:transparent!important;
      display:none!important; z-index:99998!important;
    }
    .zy-bell-backdrop.show{ display:block!important; }

    .zy-bell-dd-header{
      padding:16px 18px!important; margin:0!important;
      display:flex!important; align-items:center!important; gap:10px!important;
      font-weight:800!important; font-size:16px!important;
    }
    .zy-bell-clear{ display:none!important; }
    .zy-bell-close-x{
      margin-left:auto!important; width:30px!important; height:30px!important; border-radius:50%!important;
      display:flex!important; align-items:center!important; justify-content:center!important; font-size:13px!important;
    }
    .zy-bell-dd-list{ padding:12px!important; max-height:min(60vh,420px)!important; overflow-y:auto!important; }
    .zy-bell-dd-footer{
      border-top:1px solid!important; padding:14px!important;
      text-align:center!important; font-weight:700!important; font-size:13px!important;
      cursor:pointer!important; display:flex!important; align-items:center!important; justify-content:center!important; gap:8px!important;
    }

    /* ── Notif kartochkalar (dropdown va mobil overlayda umumiy) ── */
    .zy-bell-dd-list .zy-notif-item, .zy-mob-list .zy-notif-item{
      border-radius:14px!important; padding:14px!important;
      margin-bottom:10px!important; display:flex!important; align-items:center!important; gap:12px!important;
      border-left:3px solid #6366f1!important; cursor:pointer!important; transition:background .15s,opacity .15s!important;
    }
    .zy-bell-dd-list .zy-notif-item.read, .zy-mob-list .zy-notif-item.read{
      border-left-color:transparent!important; opacity:.55!important; background:transparent!important;
    }
    .zy-bell-dd-list .zy-ni-icon, .zy-mob-list .zy-ni-icon{
      width:42px!important; height:42px!important; border-radius:50%!important; flex-shrink:0!important;
      background:#6366f1!important; display:flex!important; align-items:center!important; justify-content:center!important;
      color:#fff!important; font-size:15px!important;
    }
    .zy-bell-dd-list .zy-ni-icon.admin, .zy-mob-list .zy-ni-icon.admin{ background:#ea580c!important; }
    .zy-bell-dd-list .zy-ni-title, .zy-mob-list .zy-ni-title{ font-weight:700!important; font-size:14px!important; }
    .zy-bell-dd-list .zy-ni-dot, .zy-mob-list .zy-ni-dot{ width:8px!important; height:8px!important; border-radius:50%!important; background:#6366f1!important; flex-shrink:0!important; }
    .zy-bell-dd-list .zy-bell-empty, .zy-mob-list .zy-bell-empty{ text-align:center!important; padding:30px 10px!important; }
    .zy-bell-dd-list .zy-bell-empty i, .zy-mob-list .zy-bell-empty i{ display:block!important; font-size:28px!important; margin-bottom:8px!important; opacity:.5!important; }

    /* ── KUN (yorug') rejim ── */
    body:not(.dark-theme) .zy-bell-dropdown{
      background:#ffffff!important; border:1px solid #e2e8f0!important;
      box-shadow:0 20px 60px rgba(15,23,42,0.16)!important;
    }
    body:not(.dark-theme) .zy-bell-dd-header{ background:#f8fafc!important; color:#0f172a!important; border-bottom:1px solid #e2e8f0!important; }
    body:not(.dark-theme) .zy-bell-close-x{ background:#eef2f7!important; color:#475569!important; }
    body:not(.dark-theme) .zy-bell-dd-list .zy-notif-item{ background:#f8fafc!important; }
    body:not(.dark-theme) .zy-bell-dd-list .zy-notif-item:hover{ background:#eef2ff!important; }
    body:not(.dark-theme) .zy-bell-dd-list .zy-ni-title{ color:#1e293b!important; }
    body:not(.dark-theme) .zy-bell-dd-list .zy-bell-empty{ color:#94a3b8!important; }
    body:not(.dark-theme) .zy-bell-dd-footer{ background:#f8fafc!important; border-top-color:#e2e8f0!important; color:#4f46e5!important; }
    body:not(.dark-theme) .zy-bell-dd-footer:hover{ background:#eef2ff!important; }

    /* ── TUN (qorong'i) rejim ── */
    body.dark-theme .zy-bell-dropdown{
      background:#0f1729!important; border:1px solid #1e293b!important;
      box-shadow:0 20px 60px rgba(0,0,0,0.45)!important;
    }
    body.dark-theme .zy-bell-dd-header{ background:#111c34!important; color:#f1f5f9!important; border-bottom:1px solid #1e293b!important; }
    body.dark-theme .zy-bell-close-x{ background:#1e2a44!important; color:#cbd5e1!important; }
    body.dark-theme .zy-bell-dd-list .zy-notif-item{ background:#161f38!important; }
    body.dark-theme .zy-bell-dd-list .zy-notif-item:hover{ background:#1c2744!important; }
    body.dark-theme .zy-bell-dd-list .zy-ni-title{ color:#e2e8f0!important; }
    body.dark-theme .zy-bell-dd-list .zy-bell-empty{ color:#64748b!important; }
    body.dark-theme .zy-bell-dd-footer{ background:#111c34!important; border-top-color:#1e293b!important; color:#818cf8!important; }
    body.dark-theme .zy-bell-dd-footer:hover{ background:#152040!important; }

    /* ── MOBIL — to'liq ekran overlay, kun/tun rejimiga mos ── */
    .zy-mob-overlay{
      position:fixed!important; top:0!important; left:0!important; right:0!important; bottom:0!important;
      display:flex!important; flex-direction:column!important;
      transform:translateY(100%)!important; transition:transform .28s ease!important;
      z-index:2147483647!important;
    }
    .zy-mob-overlay.open{ transform:translateY(0)!important; }
    .zy-mob-header{
      display:flex!important; align-items:center!important; gap:10px!important;
      padding:16px 18px!important; font-weight:800!important; font-size:16px!important;
      flex-shrink:0!important;
    }
    .zy-mob-close{
      margin-left:auto!important; width:32px!important; height:32px!important; border-radius:50%!important;
      display:flex!important; align-items:center!important; justify-content:center!important;
      border:none!important; cursor:pointer!important; font-size:14px!important;
    }
    .zy-mob-list{ flex:1!important; overflow-y:auto!important; padding:12px!important; -webkit-overflow-scrolling:touch!important; }
    .zy-mob-clear{
      padding:14px!important; text-align:center!important; font-weight:700!important; font-size:13px!important;
      cursor:pointer!important; flex-shrink:0!important; border-top:1px solid!important;
      display:flex!important; align-items:center!important; justify-content:center!important; gap:8px!important;
    }

    body:not(.dark-theme) .zy-mob-overlay{ background:#ffffff!important; }
    body:not(.dark-theme) .zy-mob-header{ background:#f8fafc!important; color:#0f172a!important; border-bottom:1px solid #e2e8f0!important; }
    body:not(.dark-theme) .zy-mob-close{ background:#eef2f7!important; color:#475569!important; }
    body:not(.dark-theme) .zy-mob-list .zy-notif-item{ background:#f8fafc!important; }
    body:not(.dark-theme) .zy-mob-list .zy-ni-title{ color:#1e293b!important; }
    body:not(.dark-theme) .zy-mob-clear{ background:#f8fafc!important; border-top-color:#e2e8f0!important; color:#4f46e5!important; }

    body.dark-theme .zy-mob-overlay{ background:#0f1729!important; }
    body.dark-theme .zy-mob-header{ background:#111c34!important; color:#f1f5f9!important; border-bottom:1px solid #1e293b!important; }
    body.dark-theme .zy-mob-close{ background:#1e2a44!important; color:#cbd5e1!important; }
    body.dark-theme .zy-mob-list .zy-notif-item{ background:#161f38!important; }
    body.dark-theme .zy-mob-list .zy-ni-title{ color:#e2e8f0!important; }
    body.dark-theme .zy-mob-clear{ background:#111c34!important; border-top-color:#1e293b!important; color:#818cf8!important; }

    /* ── Surgich (scrollbar) — bildirishnomalar ko'payganda ── */
    .zy-bell-dd-list::-webkit-scrollbar, .zy-mob-list::-webkit-scrollbar{ width:8px!important; }
    .zy-bell-dd-list::-webkit-scrollbar-track, .zy-mob-list::-webkit-scrollbar-track{ background:transparent!important; }
    body:not(.dark-theme) .zy-bell-dd-list::-webkit-scrollbar-thumb, body:not(.dark-theme) .zy-mob-list::-webkit-scrollbar-thumb{
      background:#cbd5e1!important; border-radius:10px!important;
    }
    body.dark-theme .zy-bell-dd-list::-webkit-scrollbar-thumb, body.dark-theme .zy-mob-list::-webkit-scrollbar-thumb{
      background:#334155!important; border-radius:10px!important;
    }
  `;
  document.head.appendChild(styleTag);

  /* ─── TOAST ─────────────────────────────────────── */
  var toastBox = document.createElement('div');
  toastBox.className = 'zy-notif-container';
  document.body.appendChild(toastBox);

  var ICO = {
    info:'fas fa-info-circle', success:'fas fa-check-circle',
    error:'fas fa-exclamation-circle', loading:'fas fa-spinner fa-spin', admin:'fas fa-bullhorn'
  };

  function showToast(txt, type, ms) {
    type = type||'info';
    if(ms===undefined||ms===null) ms=4000;
    if(type==='loading') ms=0;
    var el=document.createElement('div');
    el.className='zy-notif zy-notif--'+type;
    el.innerHTML=
      '<span class="zy-notif-icon"><i class="'+(ICO[type]||ICO.info)+'"></i></span>'+
      '<span class="zy-notif-text">'+esc(txt)+'</span>'+
      '<button class="zy-notif-close">&times;</button>';
    el.querySelector('.zy-notif-close').onclick=function(){removeToast(el);};
    if(ms>0){
      var bar=document.createElement('div');
      bar.className='zy-notif-progress';
      bar.style.animationDuration=(ms/1000)+'s';
      el.appendChild(bar);
      setTimeout(function(){removeToast(el);},ms);
    }
    toastBox.appendChild(el);
    return el;
  }
  function removeToast(el){
    if(!el||!el.parentNode)return;
    el.classList.add('zy-notif--removing');
    setTimeout(function(){if(el.parentNode)el.remove();},300);
  }
  function updateToast(el,txt,type){
    if(!el||!el.parentNode)return;
    if(type){
      el.className='zy-notif zy-notif--'+type;
      var ico=el.querySelector('.zy-notif-icon i');
      if(ico) ico.className=ICO[type]||ICO.info;
    }
    var t=el.querySelector('.zy-notif-text');
    if(t) t.textContent=txt;
    if(type&&type!=='loading') setTimeout(function(){removeToast(el);},3000);
  }

  /* ─── YORDAMCHI ──────────────────────────────────── */
  function esc(str){
    return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function isMob(){ return window.innerWidth<=768; }

  /* ─── MA'LUMOTLAR ───────────────────────────────── */
  var NEWS=[
    {icon:'fas fa-flask',               txt:'Yangi virtual laboratoriya: Optika'},
    {icon:'fas fa-gamepad',             txt:"Arqon tortish o'yini yangilandi"},
    {icon:'fas fa-wand-magic-sparkles', txt:'AI Studio da yangi imkoniyatlar'},
    {icon:'fas fa-book',                txt:"Metodlar bo'limiga 10+ yangi metod"},
    {icon:'fas fa-brain',               txt:"Memory o'yiniga yangi darajalar"},
  ];
  function getAdminMsgs(){try{return JSON.parse(localStorage.getItem('zy_admin_msgs')||'[]')}catch{return[]}}
  function getReadIds(){try{return JSON.parse(localStorage.getItem('zy_bell_read_ids')||'[]')}catch{return[]}}
  function saveReadIds(ids){try{localStorage.setItem('zy_bell_read_ids',JSON.stringify(ids))}catch{}}
  function getAllItems(){
    var rids=getReadIds();
    var admin=getAdminMsgs().map(function(m){
      return{id:'adm_'+m.id,icon:'fas fa-bullhorn',txt:m.text,isAdmin:true,read:rids.indexOf('adm_'+m.id)>=0};
    });
    var stat=NEWS.map(function(n,i){
      return{id:'st_'+i,icon:n.icon,txt:n.txt,isAdmin:false,read:rids.indexOf('st_'+i)>=0};
    });
    return admin.concat(stat);
  }
  function getUnread(){return getAllItems().filter(function(i){return!i.read;}).length;}

  /* ─── BADGE ─────────────────────────────────────── */
  function updateBadges(){
    var n=getUnread();
    document.querySelectorAll('.zy-bell-badge').forEach(function(b){
      if(n>0){b.textContent=n>99?'99+':n;b.classList.add('show');}
      else{b.classList.remove('show');b.textContent='';}
    });
  }

  /* ─── XABAR HTML RENDER ─────────────────────────── */
  function buildItemsHTML(){
    var items=getAllItems();
    if(!items.length){
      return '<div class="zy-bell-empty"><i class="fas fa-bell-slash"></i><span>Bildirishnomalar yo\'q</span></div>';
    }
    var html='';
    items.forEach(function(item){
      html+=
        '<div class="zy-notif-item'+(item.read?' read':'')+'" data-nid="'+item.id+'">'+
          '<div class="zy-ni-icon'+(item.isAdmin?' admin':'')+'">'+
            '<i class="'+item.icon+'"></i>'+
          '</div>'+
          '<div class="zy-ni-body">'+
            '<div class="zy-ni-title">'+esc(item.txt)+'</div>'+
          '</div>'+
          (!item.read?'<span class="zy-ni-dot"></span>':'')+
        '</div>';
    });
    return html;
  }

  function attachItemClicks(container){
    container.querySelectorAll('.zy-notif-item').forEach(function(el){
      el.addEventListener('click',function(e){
        e.stopPropagation();
        var id=el.dataset.nid;
        var ids=getReadIds();
        if(ids.indexOf(id)<0){ids.push(id);saveReadIds(ids);}
        el.classList.add('read');
        var dot=el.querySelector('.zy-ni-dot');
        if(dot)dot.remove();
        updateBadges();
      });
    });
  }

  function markAll(){
    saveReadIds(getAllItems().map(function(i){return i.id;}));
    updateBadges();
    /* Kompyuter dropdown yangilash */
    document.querySelectorAll('.zy-bell-dd-list').forEach(function(l){
      l.innerHTML=buildItemsHTML();
      attachItemClicks(l);
    });
    /* Mobil overlay yangilash */
    if(mobList) { mobList.innerHTML=buildItemsHTML(); attachItemClicks(mobList); }
  }

  /* ─── KOMPYUTER — DROPDOWN ──────────────────────── */
  var bdEl=null;
  function getBd(){
    if(!bdEl){
      bdEl=document.createElement('div');
      bdEl.className='zy-bell-backdrop';
      bdEl.style.zIndex='99998';
      bdEl.addEventListener('click',closeDd);
      document.body.appendChild(bdEl);
    }
    return bdEl;
  }

  var openedDd=null;

  function positionDd(dd, wrap){
    if(!wrap) return;
    var btn=wrap.querySelector('button');
    if(!btn) return;
    var r=btn.getBoundingClientRect();
    var ddWidth=Math.min(360, window.innerWidth*0.92);
    var left=r.right-ddWidth;
    if(left<8) left=8;
    var maxLeft=window.innerWidth-ddWidth-8;
    if(left>maxLeft) left=maxLeft;
    /* setProperty(...,'important') ishlatiladi, chunki tashqi CSS faylida
       .zy-bell-dropdown uchun !important qoida bo'lsa, oddiy inline style
       (dd.style.top=...) uni yenga olmaydi va oyna sahifa oxiriga tushib qolardi. */
    dd.style.setProperty('position','fixed','important');
    dd.style.setProperty('left',left+'px','important');
    dd.style.setProperty('top',(r.bottom+10)+'px','important');
    dd.style.setProperty('right','auto','important');
    dd.style.setProperty('bottom','auto','important');
    dd.style.setProperty('margin','0','important');
    dd.style.setProperty('transform','none','important');
    dd.style.setProperty('z-index','2147483000','important');
  }

  function repositionOpenDd(){
    if(openedDd && openedDd._zyWrap) positionDd(openedDd, openedDd._zyWrap);
  }
  window.addEventListener('resize', repositionOpenDd);
  window.addEventListener('scroll', repositionOpenDd, true);

  function openDd(dd){
    if(openedDd&&openedDd!==dd) closeDd();
    ensureDdFooter(dd);
    var list=dd.querySelector('.zy-bell-dd-list');
    if(list){list.innerHTML=buildItemsHTML();attachItemClicks(list);}
    getBd().classList.add('show');

    /* Nav elementi position:fixed + z-index bilan o'z stacking-kontekstini
       yaratadi, shu sabab dropdown nav ichida qolsa, backdrop undan "ustunroq"
       chizilib, barcha bosishlarni (X, Hammasini o'qish, xabarlar) o'ziga olib
       qo'yardi. Buni oldini olish uchun ochilganda dropdownni to'g'ridan-to'g'ri
       <body>ga ko'chiramiz va tugma tagiga joylashtiramiz; yopilganda asl joyiga
       qaytaramiz. */
    var wrap=dd._zyWrap||dd.closest('.zy-bell-wrap');
    dd._zyWrap=wrap;
    if(dd.parentNode!==document.body) document.body.appendChild(dd);
    positionDd(dd, wrap);

    dd.classList.add('open');
    openedDd=dd;
    /* Bell */
    var btn=wrap?wrap.querySelector('button'):null;
    if(btn){btn.classList.add('ringing');setTimeout(function(){btn.classList.remove('ringing');},700);}
  }

  function closeDd(){
    if(openedDd){
      openedDd.classList.remove('open');
      var wrap=openedDd._zyWrap;
      if(wrap && openedDd.parentNode!==wrap) wrap.appendChild(openedDd);
      ['position','left','top','right','bottom','margin','transform','z-index'].forEach(function(p){
        openedDd.style.removeProperty(p);
      });
    }
    openedDd=null;
    if(bdEl) bdEl.classList.remove('show');
  }

  function ensureDdFooter(dd){
    if(!dd || dd.querySelector('.zy-bell-dd-footer')) return;
    var footer=document.createElement('div');
    footer.className='zy-bell-dd-footer';
    footer.innerHTML='<i class="fas fa-check-double"></i> Barchasini o\'qilgan belgilash';
    dd.appendChild(footer);
  }

  /* ─── MOBIL — ALOHIDA OVERLAY ───────────────────── */
  /* Overlay body ga bir marta qo'shiladi, har doim tayyor */
  var mobOverlay=null, mobList=null;

  function buildMobOverlay(){
    if(mobOverlay) return;

    mobOverlay=document.createElement('div');
    mobOverlay.className='zy-mob-overlay';
    /* z-index inline - CSS dan ustun bo'lishi uchun */
    mobOverlay.style.cssText='position:fixed!important;top:0!important;left:0!important;right:0!important;bottom:0!important;z-index:2147483647!important;';

    /* Header */
    var hdr=document.createElement('div');
    hdr.className='zy-mob-header';
    hdr.innerHTML=
      '<div class="zy-mob-title"><i class="fas fa-bell"></i> Bildirishnomalar</div>'+
      '<button class="zy-mob-close" aria-label="Yopish"><i class="fas fa-times"></i></button>';
    hdr.querySelector('.zy-mob-close').addEventListener('click',closeMob);
    mobOverlay.appendChild(hdr);

    /* List */
    mobList=document.createElement('div');
    mobList.className='zy-mob-list';
    mobOverlay.appendChild(mobList);

    /* "Barchasini o'qish" */
    var clr=document.createElement('div');
    clr.className='zy-mob-clear';
    clr.innerHTML='<i class="fas fa-check-double"></i> Barchasini o\'qilgan belgilash';
    clr.addEventListener('click',function(){markAll();});
    mobOverlay.appendChild(clr);

    /* Overlay ichida bosish — fon bilan yopilmasin */
    mobOverlay.addEventListener('click',function(e){e.stopPropagation();});

    document.body.appendChild(mobOverlay);
  }

  function openMob(){
    buildMobOverlay();
    mobList.innerHTML=buildItemsHTML();
    attachItemClicks(mobList);
    document.body.style.overflow='hidden';
    mobOverlay.classList.add('open');
  }

  function closeMob(){
    if(mobOverlay) mobOverlay.classList.remove('open');
    document.body.style.overflow='';
  }

  /* ─── BELL INIT ─────────────────────────────────── */
  function initBells(){
    /* Har ehtimolga qarshi, hozircha mavjud bo'lgan dropdownlarga footer qo'shib qo'yamiz */
    document.querySelectorAll('.zy-bell-dropdown').forEach(ensureDdFooter);

    /* MUHIM: bosishlar to'g'ridan-to'g'ri tugmalarga emas, balki document darajasida
       "delegatsiya" orqali ushlanadi. Sabab: ba'zi akkauntlarda nav.js/auth.js kabi
       boshqa skriptlar sahifa yuklangach nav qatoridagi elementlarni qayta chizib
       qo'yishi mumkin — shunda shu yerda to'g'ridan-to'g'ri ulangan handlerlar yo'qolib,
       qo'ng'iroqcha bosilganda hech narsa ochilmay qolardi. Delegatsiya esa har safar
       bosilgan paytda joriy DOM holatini tekshiradi, shuning uchun har doim ishlaydi. */
    document.addEventListener('click', function(e){
      var t = e.target;

      var bellBtn = t.closest && t.closest('.zy-bell-btn');
      if(bellBtn){
        e.preventDefault();
        e.stopPropagation();
        var wrap = bellBtn.closest('.zy-bell-wrap');
        if(!wrap) return;
        var dd = (openedDd && openedDd._zyWrap===wrap) ? openedDd : wrap.querySelector('.zy-bell-dropdown');
        if(isMob()){
          if(mobOverlay && mobOverlay.classList.contains('open')) closeMob(); else openMob();
        } else if(dd){
          if(dd.classList.contains('open')) closeDd(); else openDd(dd);
        }
        return;
      }

      var closeX = t.closest && t.closest('.zy-bell-close-x');
      if(closeX){ e.stopPropagation(); closeDd(); return; }

      var clearBtn = t.closest && t.closest('.zy-bell-clear, .zy-bell-dd-footer');
      if(clearBtn){ e.stopPropagation(); markAll(); return; }

      var insideDd = t.closest && t.closest('.zy-bell-dropdown');
      if(insideDd){ e.stopPropagation(); return; }

      /* Tashqarida bosish — kompyuterda dropdownni yopadi */
      if(!isMob()) closeDd();
    });

    /* Escape */
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'){closeDd();closeMob();}
    });

    updateBadges();
  }

  /* ─── ADMIN XABARLAR ────────────────────────────── */
  function checkAdmin(){
    var msgs=getAdminMsgs();
    var seen;try{seen=JSON.parse(localStorage.getItem('zy_admin_seen')||'[]')}catch{seen=[];}
    var changed=false;
    msgs.forEach(function(m){
      if(seen.indexOf(m.id)<0){showToast(m.text,'admin',0);seen.push(m.id);changed=true;}
    });
    if(changed){
      try{localStorage.setItem('zy_admin_seen',JSON.stringify(seen))}catch{}
      updateBadges();
    }
  }

  /* ─── REAL-TIME ─────────────────────────────────── */
  window.addEventListener('storage',function(e){
    if(e.key==='zy_admin_msgs'||e.key==='zy_bell_read_ids') updateBadges();
  });
  setInterval(function(){updateBadges();checkAdmin();},10000);

  /* ─── GLOBAL API ────────────────────────────────── */
  window.ZiyomapNotify={
    show:showToast, update:updateToast,
    info:    function(t,d){return showToast(t,'info',d);},
    success: function(t,d){return showToast(t,'success',d);},
    error:   function(t,d){return showToast(t,'error',d);},
    loading: function(t)  {return showToast(t,'loading',0);},
    admin:   function(t)  {return showToast(t,'admin',0);},
    close: function(){closeDd();closeMob();},
    checkAdmin: checkAdmin,
    refresh: function(){ updateBadges(); },
    ring: function(){
      document.querySelectorAll('.zy-bell-wrap button').forEach(function(b){
        b.classList.add('ringing');
        setTimeout(function(){b.classList.remove('ringing');},700);
      });
    }
  };

  /* ─── DOM READY ─────────────────────────────────── */
  var TIPS=['Ziyo AI Studio da dars rejalarini tayyorlang! 🤖',"O'yinlar bo'limida bilimingizni sinang! 🎮","Virtual laboratoriyalarda tajriba o'tkazing! 🔬",'AI Chat orqali istalgan savolga javob oling! 💬'];
  var tipIdx=0;

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
