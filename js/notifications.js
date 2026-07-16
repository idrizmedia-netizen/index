/* ===================================================
   ZIYOMAP — Bildirishnoma JS (v9 — Mukammal Final)
   Kompyuter: dropdown | Mobil: alohida overlay element
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
        el.style.borderLeftColor='transparent';
        el.style.background='transparent';
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

  function openDd(dd){
    if(openedDd&&openedDd!==dd) closeDd();
    var list=dd.querySelector('.zy-bell-dd-list');
    if(list){list.innerHTML=buildItemsHTML();attachItemClicks(list);}
    var clr=dd.querySelector('.zy-bell-clear');
    if(clr) clr.onclick=function(e){e.stopPropagation();markAll();};
    getBd().classList.add('show');
    dd.style.zIndex='99999';
    dd.style.position=dd.style.position||'absolute';
    dd.classList.add('open');
    openedDd=dd;
    /* Bell */
    var btn=dd.closest('.zy-bell-wrap').querySelector('button');
    if(btn){btn.classList.add('ringing');setTimeout(function(){btn.classList.remove('ringing');},700);}
  }

  function closeDd(){
    if(openedDd) openedDd.classList.remove('open');
    openedDd=null;
    if(bdEl) bdEl.classList.remove('show');
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
    document.querySelectorAll('.zy-bell-wrap').forEach(function(wrap){
      var btn=wrap.querySelector('button')||wrap.querySelector('.nav-icon-btn');
      var dd=wrap.querySelector('.zy-bell-dropdown');
      if(!btn||!dd) return;

      btn.addEventListener('click',function(e){
        e.preventDefault();
        e.stopPropagation();
        if(isMob()){
          /* MOBIL: alohida overlay */
          if(mobOverlay&&mobOverlay.classList.contains('open')){
            closeMob();
          } else {
            openMob();
          }
        } else {
          /* KOMPYUTER: dropdown */
          if(dd.classList.contains('open')){
            closeDd();
          } else {
            openDd(dd);
          }
        }
      });

      dd.addEventListener('click',function(e){e.stopPropagation();});
    });

    /* Tashqarida bosish — kompyuterda */
    document.addEventListener('click',function(e){
      if(isMob()) return;
      if(e.target.closest && e.target.closest('.zy-bell-dropdown, .zy-bell-btn')) return;
      closeDd();
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
