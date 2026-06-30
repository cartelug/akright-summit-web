/* ====================================================================
   AKRIGHT SUMMIT — HOME "LUMINOUS" · interactions
   loader · nav · reveal · counters · multi-countdown · magnetic
   pointer-reactive hero glow · mobile nav · newsletter
   ==================================================================== */
(function(){
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine   = matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ---------- LOADER ---------- */
  const loader = document.getElementById('loader');
  const pctEl  = document.querySelector('.ld-pct');
  if (pctEl && !reduce){
    let p = 0;
    const iv = setInterval(()=>{ p += Math.floor(Math.random()*9)+5; if(p>=100){p=100;clearInterval(iv);} pctEl.textContent = String(p).padStart(3,'0'); }, 48);
  } else if (pctEl){ pctEl.textContent = '100'; }

  function endLoader(){
    document.body.classList.remove('loading');
    document.body.classList.add('ready');
    if (loader){ loader.classList.add('done'); setTimeout(()=>{ loader.style.display='none'; }, 900); }
  }
  let done = false;
  function trigger(){ if(done) return; done = true; setTimeout(endLoader, reduce ? 120 : 1500); }
  window.addEventListener('load', trigger);
  setTimeout(trigger, 3500);

  /* ---------- NAV / SCROLL ---------- */
  const nav = document.getElementById('nav');
  const toTop = document.getElementById('toTop');
  const progress = document.getElementById('scrollProgress');
  let lastY = 0, ticking = false;
  function onScroll(){
    if (ticking) return; ticking = true;
    requestAnimationFrame(()=>{
      const y = scrollY;
      const docH = document.documentElement.scrollHeight - innerHeight;
      if (nav){
        nav.classList.toggle('scrolled', y > 24);
        if (y > 260 && y > lastY + 8) nav.classList.add('hidden');
        else if (y < lastY - 4) nav.classList.remove('hidden');
      }
      if (toTop) toTop.classList.toggle('show', y > 600);
      if (progress && docH > 0) progress.style.width = Math.min(100,(y/docH)*100) + '%';
      lastY = y; ticking = false;
    });
  }
  addEventListener('scroll', onScroll, {passive:true});
  if (toTop) toTop.addEventListener('click', e=>{ e.preventDefault(); scrollTo({top:0, behavior: reduce?'auto':'smooth'}); });

  /* ---------- MOBILE NAV ---------- */
  const tog = document.getElementById('navToggle');
  const drawer = document.getElementById('mnav');
  function setOpen(open){
    if (!tog) return;
    tog.setAttribute('aria-expanded', open?'true':'false');
    const s = tog.querySelectorAll('span');
    if (open){ s[0].style.transform='translateY(7px) rotate(45deg)'; s[1].style.opacity='0'; s[2].style.transform='translateY(-7px) rotate(-45deg)'; }
    else { s[0].style.transform=''; s[1].style.opacity='1'; s[2].style.transform=''; }
  }
  if (tog && drawer){
    tog.addEventListener('click', ()=>{ const open = drawer.classList.toggle('open'); setOpen(open); document.body.style.overflow = open?'hidden':''; });
    drawer.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=>{ drawer.classList.remove('open'); setOpen(false); document.body.style.overflow=''; }));
    addEventListener('keydown', e=>{ if(e.key==='Escape' && drawer.classList.contains('open')){ drawer.classList.remove('open'); setOpen(false); document.body.style.overflow=''; } });
  }

  /* ---------- REVEAL ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window){
    const io = new IntersectionObserver((es)=>{ es.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } }); }, {threshold:0.12, rootMargin:'0px 0px -6% 0px'});
    reveals.forEach(el=>io.observe(el));
  } else reveals.forEach(el=>el.classList.add('in'));

  /* ---------- COUNTERS ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length){
    const cio = new IntersectionObserver((es)=>{ es.forEach(en=>{ if(!en.isIntersecting) return;
      const el = en.target, target = parseFloat(el.dataset.count), dur = parseInt(el.dataset.dur||'1800',10);
      if (reduce){ el.textContent = target.toLocaleString(); }
      else { const start = performance.now();
        (function step(t){ const k = Math.min(1,(t-start)/dur); const v = target*(1-Math.pow(1-k,3));
          el.textContent = Math.round(v).toLocaleString(); if(k<1) requestAnimationFrame(step); })(start); }
      cio.unobserve(el);
    }); }, {threshold:0.4});
    counters.forEach(el=>cio.observe(el));
  }

  /* ---------- COUNTDOWN (supports multiple) ---------- */
  const target = new Date('2026-08-29T09:00:00+03:00').getTime();
  const cdSets = {
    days: document.querySelectorAll('[data-cd="days"]'),
    hrs:  document.querySelectorAll('[data-cd="hrs"]'),
    min:  document.querySelectorAll('[data-cd="min"]'),
    sec:  document.querySelectorAll('[data-cd="sec"]'),
  };
  function setAll(list, val){ list.forEach(el=> el.textContent = val); }
  if (cdSets.days.length){
    (function tick(){
      let d = target - Date.now(); if (d<0) d=0;
      setAll(cdSets.days, String(Math.floor(d/86400000)).padStart(3,'0'));
      setAll(cdSets.hrs,  String(Math.floor((d%86400000)/3600000)).padStart(2,'0'));
      setAll(cdSets.min,  String(Math.floor((d%3600000)/60000)).padStart(2,'0'));
      setAll(cdSets.sec,  String(Math.floor((d%60000)/1000)).padStart(2,'0'));
      setTimeout(tick, 1000);
    })();
  }

  /* ---------- SMOOTH ANCHORS ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{ const h = a.getAttribute('href'); if(h==='#'||h.length<2) return;
      const t = document.querySelector(h); if(t){ e.preventDefault(); scrollTo({top: t.getBoundingClientRect().top+scrollY-70, behavior: reduce?'auto':'smooth'}); } });
  });

  /* ---------- MAGNETIC ---------- */
  if (fine && !reduce){
    document.querySelectorAll('[data-magnetic]').forEach(el=>{
      const k = parseFloat(el.dataset.magnetic)||0.2; let tx=0,ty=0,cx=0,cy=0,raf=null;
      function loop(){ cx+=(tx-cx)*0.15; cy+=(ty-cy)*0.15; el.style.transform=`translate(${cx.toFixed(1)}px,${cy.toFixed(1)}px)`;
        if (Math.abs(tx-cx)>0.05||Math.abs(ty-cy)>0.05) raf=requestAnimationFrame(loop); else raf=null; }
      el.addEventListener('pointermove', e=>{ const r=el.getBoundingClientRect(); tx=(e.clientX-(r.left+r.width/2))*k; ty=(e.clientY-(r.top+r.height/2))*k; if(!raf) raf=requestAnimationFrame(loop); });
      el.addEventListener('pointerleave', ()=>{ tx=0; ty=0; if(!raf) raf=requestAnimationFrame(loop); });
    });
  }

  /* ---------- POINTER-REACTIVE HERO GLOW ---------- */
  if (fine && !reduce){
    const hero = document.querySelector('.hero'), blobs = document.querySelectorAll('.hero-bg .blob');
    if (hero && blobs.length){
      let raf=null, mx=0, my=0;
      hero.addEventListener('pointermove', e=>{ const r=hero.getBoundingClientRect();
        mx=(e.clientX-r.left)/r.width-0.5; my=(e.clientY-r.top)/r.height-0.5;
        if(!raf) raf=requestAnimationFrame(()=>{ blobs.forEach((b,i)=>{ const f=(i+1)*14; b.style.translate=`${(mx*f).toFixed(1)}px ${(my*f).toFixed(1)}px`; }); raf=null; }); });
    }
  }

  /* ---------- NEWSLETTER ---------- */
  window.aksSubscribe = function(e){
    if (e) e.preventDefault();
    const inp = document.querySelector('.news input'), btn = document.querySelector('.news button');
    if (!inp || !inp.value.trim() || !/^\S+@\S+\.\S+$/.test(inp.value)){ if(inp){ inp.style.boxShadow='inset 0 0 0 1.5px #E8512E'; setTimeout(()=>inp.style.boxShadow='',1800); inp.focus(); } return false; }
    if (btn) btn.textContent='✓';
    inp.value=''; inp.placeholder='Subscribed — thank you.';
    setTimeout(()=>{ if(btn) btn.textContent='→'; inp.placeholder='Your email'; }, 4000);
    return false;
  };

  onScroll();
})();
