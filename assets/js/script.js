/* ====================================================================
   AKRIGHT SUMMIT v4 — INTERACTIONS
   Multi-page · preloader · reveals · magnetic · counter · countdown
   ==================================================================== */
(function(){
  'use strict';

  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer  = matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ---------- PRELOADER ---------- */
  document.body.classList.add('loading');
  const loader = document.getElementById('loader');
  const pctEl  = document.querySelector('.loader-pct');

  if (pctEl && !prefersReduced){
    let p = 0;
    const iv = setInterval(()=>{
      p += Math.floor(Math.random()*8)+4;
      if (p>=100){ p=100; clearInterval(iv); }
      pctEl.textContent = String(p).padStart(3,'0');
    }, 50);
  } else if (pctEl){
    pctEl.textContent = '100';
  }

  function endLoader(){
    if (!loader){
      document.body.classList.remove('loading');
      document.body.classList.add('hero-ready');
      return;
    }
    loader.classList.add('done');
    document.body.classList.remove('loading');
    document.body.classList.add('hero-ready');
    setTimeout(()=>{ loader.style.display='none'; }, 1100);
  }

  let triggered = false;
  function trigger(){ if(triggered) return; triggered = true; setTimeout(endLoader, prefersReduced ? 150 : 1800); }
  window.addEventListener('load', trigger);
  setTimeout(trigger, 4000);

  /* ---------- NAV ---------- */
  const nav      = document.getElementById('nav');
  const toTop    = document.getElementById('toTop');
  const progress = document.getElementById('scrollProgress');
  let lastY = 0, ticking = false;

  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(()=>{
      const y = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      if (nav){
        nav.classList.toggle('scrolled', y > 30);
        if (y > 240 && y > lastY + 8) nav.classList.add('hidden');
        else if (y < lastY - 4) nav.classList.remove('hidden');
      }
      if (toTop) toTop.classList.toggle('show', y > 600);
      if (progress && docH > 0) progress.style.width = Math.min(100, (y/docH)*100) + '%';
      lastY = y; ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, {passive:true});

  if (toTop){
    toTop.addEventListener('click', e=>{
      e.preventDefault();
      window.scrollTo({top:0, behavior: prefersReduced ? 'auto' : 'smooth'});
    });
  }

  /* ---------- MOBILE NAV ---------- */
  const toggle = document.getElementById('navToggle');
  const drawer = document.getElementById('mobileNav');
  function setOpen(open){
    if (!toggle) return;
    toggle.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    const s = toggle.querySelectorAll('span');
    if (open){
      s[0].style.transform='translateY(7.5px) rotate(45deg)';
      s[1].style.opacity='0';
      s[2].style.transform='translateY(-7.5px) rotate(-45deg)';
    } else {
      s[0].style.transform=''; s[1].style.opacity='1'; s[2].style.transform='';
    }
  }
  if (toggle && drawer){
    toggle.addEventListener('click', ()=>{
      const open = drawer.classList.toggle('open');
      setOpen(open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    drawer.querySelectorAll('a').forEach(a=>{
      a.addEventListener('click', ()=>{
        drawer.classList.remove('open'); setOpen(false); document.body.style.overflow='';
      });
    });
    document.addEventListener('keydown', e=>{
      if (e.key === 'Escape' && drawer.classList.contains('open')){
        drawer.classList.remove('open'); setOpen(false); document.body.style.overflow='';
      }
    });
  }

  /* ---------- SCROLL REVEAL ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(en=>{
        if (en.isIntersecting){
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    }, { threshold:0.12, rootMargin:'0px 0px -6% 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- COUNTERS ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length){
    const cio = new IntersectionObserver((entries)=>{
      entries.forEach(en=>{
        if (!en.isIntersecting) return;
        const el = en.target;
        const target   = parseFloat(el.dataset.count);
        const dur      = parseInt(el.dataset.dur || '1800', 10);
        const decimals = parseInt(el.dataset.decimals || '0', 10);
        if (prefersReduced){
          el.textContent = target.toLocaleString(undefined, {maximumFractionDigits:decimals});
        } else {
          const start = performance.now();
          (function step(t){
            const k = Math.min(1, (t-start)/dur);
            const eased = 1 - Math.pow(1-k, 3);
            const val = target * eased;
            el.textContent = val.toLocaleString(undefined, {maximumFractionDigits:decimals, minimumFractionDigits:decimals});
            if (k < 1) requestAnimationFrame(step);
          })(start);
        }
        cio.unobserve(el);
      });
    }, { threshold:0.3 });
    counters.forEach(el => cio.observe(el));
  }

  /* ---------- COUNTDOWN to launch ---------- */
  const targetDate = new Date('2026-08-29T09:00:00+03:00').getTime();
  const cdDays = document.getElementById('cdDays');
  const cdHrs  = document.getElementById('cdHrs');
  const cdMin  = document.getElementById('cdMin');
  const cdSec  = document.getElementById('cdSec');
  if (cdDays && cdHrs && cdMin && cdSec){
    function tick(){
      const now = Date.now();
      let d = targetDate - now;
      if (d < 0) d = 0;
      const days = Math.floor(d / 86400000);
      const hrs  = Math.floor((d % 86400000) / 3600000);
      const min  = Math.floor((d % 3600000) / 60000);
      const sec  = Math.floor((d % 60000) / 1000);
      cdDays.textContent = String(days).padStart(3,'0');
      cdHrs.textContent  = String(hrs).padStart(2,'0');
      cdMin.textContent  = String(min).padStart(2,'0');
      cdSec.textContent  = String(sec).padStart(2,'0');
    }
    tick(); setInterval(tick, 1000);
  }

  /* ---------- SMOOTH ANCHORS ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      const href = a.getAttribute('href');
      if (href === '#' || href.length < 2) return;
      const t = document.querySelector(href);
      if (t){
        e.preventDefault();
        const y = t.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({top: y, behavior: prefersReduced ? 'auto' : 'smooth'});
      }
    });
  });

  /* ---------- MAGNETIC (subtle) ---------- */
  if (isFinePointer && !prefersReduced){
    document.querySelectorAll('[data-magnetic]').forEach(el=>{
      const strength = parseFloat(el.dataset.magnetic) || 0.15;
      let tx=0, ty=0, cx=0, cy=0, raf=null;
      function loop(){
        cx += (tx - cx) * 0.15;
        cy += (ty - cy) * 0.15;
        el.style.transform = `translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px)`;
        if (Math.abs(tx-cx) > 0.05 || Math.abs(ty-cy) > 0.05){
          raf = requestAnimationFrame(loop);
        } else { raf = null; }
      }
      el.addEventListener('pointermove', e=>{
        const r = el.getBoundingClientRect();
        tx = (e.clientX - (r.left + r.width/2)) * strength;
        ty = (e.clientY - (r.top + r.height/2)) * strength;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      el.addEventListener('pointerleave', ()=>{
        tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop);
      });
    });
  }

  /* ---------- FAQ ---------- */
  document.querySelectorAll('.faq-q').forEach(q=>{
    q.addEventListener('click', ()=>{
      const item = q.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* ---------- FORM ---------- */
  window.aksSubmit = function(){
    const req = ['fName','fEmail','fMsg'];
    let ok = true, firstInvalid = null;
    req.forEach(id=>{
      const el = document.getElementById(id);
      if (el && !el.value.trim()){
        ok = false;
        el.style.borderBottomColor = '#D4634D';
        setTimeout(()=> el.style.borderBottomColor='', 2200);
        if (!firstInvalid) firstInvalid = el;
      }
    });
    const em = document.getElementById('fEmail');
    if (em && em.value && !/^\S+@\S+\.\S+$/.test(em.value)){
      ok = false;
      em.style.borderBottomColor = '#D4634D';
      setTimeout(()=> em.style.borderBottomColor='', 2200);
      if (!firstInvalid) firstInvalid = em;
    }
    if (!ok){ if (firstInvalid) firstInvalid.focus(); return; }
    const btn = document.getElementById('fSubmit');
    if (btn){
      btn.innerHTML = '<span>Sending…</span>';
      btn.style.opacity = '0.7'; btn.style.pointerEvents = 'none';
    }
    setTimeout(()=>{
      const body = document.getElementById('formBody'); if (body) body.style.display='none';
      const okEl = document.getElementById('formSuccess'); if (okEl) okEl.classList.add('show');
    }, 1000);
  };

  window.aksSubscribe = function(e){
    if (e) e.preventDefault();
    const inp = document.querySelector('.newsletter input');
    const btn = document.querySelector('.newsletter button');
    if (!inp || !inp.value.trim() || !/^\S+@\S+\.\S+$/.test(inp.value)){
      if (inp){ inp.style.borderColor='#D4634D'; setTimeout(()=> inp.style.borderColor='', 2000); inp.focus(); }
      return false;
    }
    if (btn) btn.innerHTML='✓';
    inp.value=''; inp.placeholder='Subscribed — thank you.';
    setTimeout(()=>{ if (btn) btn.innerHTML='→'; inp.placeholder='Your email'; }, 4000);
    return false;
  };

  onScroll();
})();
