/* ===================================================
   ZIYOMAP — Bildirishnoma JS (v8 — Final)
   Kompyuter: dropdown | Mobil: to'liq ekran panel
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
      '<span class="zy-notif-text">'+String(txt).replace(/</g,'&lt;')+'</span>'+
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

  /* ─── RO'YXAT RENDER ────────────────────────────── */
  function renderList(listEl){
    if(!listEl)return;
    var items=getAllItems();
    if(!items.length){
      listEl.innerHTML='<div class="zy-bell-empty"><i class="fas fa-bell-slash"></i><span>Bildirishnomalar yo\'q</span></div>';
      return;
    }
    var html='';
    items.forEach(function(item){
      html+=
        '<div class="zy-bell-dd-item'+(item.read?' zy-bell-dd-read':'')+'" data-nid="'+item.id+'">'+
          '<div class="zy-dd-icon-wrap'+(item.isAdmin?' admin':'')+'">'+
            '<i class="'+item.icon+'" aria-hidden="true"></i>'+
          '</div>'+
          '<div class="zy-dd-content">'+
            '<div class="zy-dd-title">'+escHtml(item.txt)+'</div>'+
          '</div>'+
          (!item.read?'<span class="zy-bell-unread-dot"></span>':'')+
        '</div>';
    });
    html+='<div class="zy-bell-clear"><i class="fas fa-check-double"></i> Barchasini o\'qilgan belgilash</div>';
    listEl.innerHTML=html;

    listEl.querySelectorAll('.zy-bell-dd-item').forEach(function(el){
      el.addEventListener('click',function(){
        var id=el.dataset.nid;
        var ids=getReadIds();
        if(ids.indexOf(id)<0){ids.push(id);saveReadIds(ids);}
        el.classList.add('zy-bell-dd-read');
        el.style.borderLeftColor='transparent';
        el.style.background='';
        var dot=el.querySelector('.zy-bell-unread-dot');
        if(dot)dot.remove();
        updateBadges();
      });
    });

    var clr=listEl.querySelector('.zy-bell-clear');
    if(clr){
      clr.addEventListener('click',function(e){
        e.stopPropagation();
        saveReadIds(getAllItems().map(function(i){return i.id;}));
        updateBadges();
        document.querySelectorAll('.zy-bell-dd-list').forEach(renderList);
      });
    }
  }

  function escHtml(str){
    return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ─── BACKDROP (faqat kompyuter) ───────────────── */
  var bdEl=null;
  function getBd(){
    if(!bdEl){
      bdEl=document.createElement('div');
      bdEl.className='zy-bell-backdrop';
      bdEl.addEventListener('click',closeAll);
      document.body.appendChild(bdEl);
    }
    return bdEl;
  }

  function isMob(){return window.innerWidth<=768;}

  /* ─── OPEN / CLOSE ─────────────────────────────── */
  function openDd(dd){
    /* Boshqalarni yopish */
    document.querySelectorAll('.zy-bell-dropdown.open').forEach(function(o){
      if(o!==dd)closeDd(o);
    });

    /* Ro'yxat yangilash */
    var list=dd.querySelector('.zy-bell-dd-list');
    if(list)renderList(list);

    if(isMob()){
      /* MOBIL: to'liq ekran panel */
      document.body.style.overflow='hidden';
      document.body.style.position='fixed';
      document.body.style.width='100%';
    } else {
      /* KOMPYUTER: backdrop */
      getBd().classList.add('show');
    }

    dd.classList.add('open');

    /* Bell silkinishi */
    var wrap=dd.closest('.zy-bell-wrap');
    if(wrap){
      var btn=wrap.querySelector('button');
      if(btn){btn.classList.add('ringing');setTimeout(function(){btn.classList.remove('ringing');},700);}
    }
  }

  function closeDd(dd){
    if(!dd||!dd.classList.contains('open'))return;
    dd.classList.remove('open');
    if(bdEl)bdEl.classList.remove('show');
    document.body.style.overflow='';
    document.body.style.position='';
    document.body.style.width='';
  }

  function closeAll(){
    document.querySelectorAll('.zy-bell-dropdown.open').forEach(closeDd);
  }

  /* ─── MOBIL YOPISH TUGMASI ─────────────────────── */
  function addMobileCloseBtn(dd){
    /* Avval mavjudligini tekshirish */
    if(dd.querySelector('.zy-bell-mobile-header'))return;
    var hdr=document.createElement('div');
    hdr.className='zy-bell-mobile-header';
    hdr.innerHTML=
      '<div class="zy-bell-mobile-title"><i class="fas fa-bell" style="color:#6366f1"></i> Bildirishnomalar</div>'+
      '<button class="zy-bell-mobile-close" aria-label="Yopish"><i class="fas fa-times"></i></button>';
    hdr.querySelector('.zy-bell-mobile-close').addEventListener('click',function(e){
      e.stopPropagation();
      closeDd(dd);
    });
    /* Sarlavhadan oldin qo'shish */
    var existingHeader=dd.querySelector('.zy-bell-dd-header');
    if(existingHeader){
      dd.insertBefore(hdr,existingHeader);
      /* Kompyuter sarlavhasini mobilda yashirish */
      existingHeader.style.cssText='display:none';
    } else {
      dd.insertBefore(hdr,dd.firstChild);
    }
  }

  /* ─── BELL INIT ─────────────────────────────────── */
  function initBells(){
    document.querySelectorAll('.zy-bell-wrap').forEach(function(wrap){
      var btn=wrap.querySelector('button')||wrap.querySelector('.nav-icon-btn')||wrap.querySelector('.zy-bell-btn');
      var dd=wrap.querySelector('.zy-bell-dropdown');
      var list=wrap.querySelector('.zy-bell-dd-list');
      if(!btn||!dd||!list)return;

      /* Mobil yopish tugmasini qo'shish */
      addMobileCloseBtn(dd);

      /* Boshlang'ich render */
      renderList(list);

      /* BELL CLICK */
      btn.addEventListener('click',function(e){
        e.preventDefault();
        e.stopPropagation();
        if(dd.classList.contains('open')){
          closeDd(dd);
        } else {
          openDd(dd);
        }
      });

      /* Dropdown ichida bosish — yopilmasin */
      dd.addEventListener('click',function(e){e.stopPropagation();});
    });

    /* Tashqarida bosish — kompyuterda */
    document.addEventListener('click',function(){
      if(!isMob())closeAll();
    });

    /* Escape */
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape')closeAll();
    });

    /* Back button (Android) */
    window.addEventListener('popstate',function(){
      closeAll();
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
      document.querySelectorAll('.zy-bell-dd-list').forEach(renderList);
    }
  }

  /* ─── REAL-TIME ─────────────────────────────────── */
  window.addEventListener('storage',function(e){
    if(e.key==='zy_admin_msgs'||e.key==='zy_bell_read_ids'){
      updateBadges();
      document.querySelectorAll('.zy-bell-dd-list').forEach(renderList);
    }
  });
  setInterval(function(){updateBadges();checkAdmin();},10000);

  /* ─── GLOBAL API ────────────────────────────────── */
  window.ZiyomapNotify={
    show:showToast,update:updateToast,
    info:    function(t,d){return showToast(t,'info',d);},
    success: function(t,d){return showToast(t,'success',d);},
    error:   function(t,d){return showToast(t,'error',d);},
    loading: function(t)  {return showToast(t,'loading',0);},
    admin:   function(t)  {return showToast(t,'admin',0);},
    close:closeAll,checkAdmin:checkAdmin,
    refresh:function(){document.querySelectorAll('.zy-bell-dd-list').forEach(renderList);},
    ring:function(){
      document.querySelectorAll('.zy-bell-wrap button').forEach(function(b){
        b.classList.add('ringing');
        setTimeout(function(){b.classList.remove('ringing');},700);
      });
    }
  };

  /* ─── TIPS & GREETING ───────────────────────────── */
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
