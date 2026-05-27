/* =============================================
   MAGIC DIETITIAN — script.js
   ============================================= */
(function () {
  'use strict';

  // ===== HEADER: always scrolled so nav is always visible and readable =====
  const header = document.getElementById('header');
  // Show frosted glass immediately for readability since hero has light bg
  header.classList.add('header--scrolled');
  const onScroll = () => header.classList.toggle('header--scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ===== ACTIVE NAV LINK =====
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav__link');

  new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
      }
    });
  }, { threshold: 0.3, rootMargin: '-70px 0px 0px 0px' }).observe
    ? sections.forEach(s => new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const id = e.target.id;
            navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
          }
        });
      }, { threshold: 0.3, rootMargin: '-70px 0px 0px 0px' }).observe(s))
    : null;

  // ===== MOBILE DRAWER =====
  const hamburger    = document.getElementById('hamburgerBtn');
  const drawer       = document.getElementById('navDrawer');
  const overlay      = document.getElementById('navOverlay');
  const drawerClose  = document.getElementById('drawerCloseBtn');
  const drawerLinks  = document.querySelectorAll('.nav__drawer-link, .nav__drawer-cta');

  const openDrawer  = () => { drawer.classList.add('open');  overlay.classList.add('show');  document.body.style.overflow = 'hidden'; };
  const closeDrawer = () => { drawer.classList.remove('open'); overlay.classList.remove('show'); document.body.style.overflow = ''; };

  hamburger.addEventListener('click', openDrawer);
  drawerClose.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  drawerLinks.forEach(l => l.addEventListener('click', closeDrawer));

  // ===== SCROLL ANIMATIONS =====
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

  // ===== COUNTER ANIMATION — only fires when stats fully in view =====
  function animCount(el) {
    const target = parseInt(el.dataset.count, 10);
    const dur    = 1600;
    const start  = performance.now();
    const run    = (now) => {
      const p    = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(2, -10 * p);
      const val  = Math.floor(ease * target);
      el.textContent = val >= 1000 ? val.toLocaleString('en-IN') : val;
      if (p < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }

  const counters = document.querySelectorAll('.hero__count');
  let counted = false;
  const statsEl = document.querySelector('.hero__stats');

  // Reset counters to 0 only if they become visible while scrolling
  // (they start at their real values in HTML so they look fine on load)
  if (statsEl) {
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !counted) {
        counted = true;
        // Reset then animate
        counters.forEach(c => { c.textContent = '0'; animCount(c); });
      }
    }, { threshold: 0.95 }).observe(statsEl);
  }

  // ===== TESTIMONIAL CAROUSEL =====
  const track    = document.getElementById('testiTrack');
  const dotsWrap = document.getElementById('testiDots');
  const prevBtn  = document.getElementById('prevBtn');
  const nextBtn  = document.getElementById('nextBtn');

  if (track) {
    const cards = track.querySelectorAll('.testi-card');
    let cur = 0, auto;

    function spv() {
      if (window.innerWidth < 600) return 1;
      if (window.innerWidth < 860) return 2;
      return 3;
    }

    let perView = spv();
    const total = () => Math.max(cards.length - perView + 1, 1);

    // Create dots
    function buildDots() {
      dotsWrap.innerHTML = '';
      for (let i = 0; i < total(); i++) {
        const d = document.createElement('button');
        d.className = 'testi-dot' + (i === 0 ? ' active' : '');
        d.setAttribute('aria-label', `Slide ${i + 1}`);
        d.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(d);
      }
    }
    buildDots();

    function goTo(i) {
      cur = Math.max(0, Math.min(i, total() - 1));
      const w = cards[0].offsetWidth + 22;
      track.style.transform = `translateX(-${cur * w}px)`;
      dotsWrap.querySelectorAll('.testi-dot').forEach((d, idx) => d.classList.toggle('active', idx === cur));
    }

    const next = () => goTo(cur < total() - 1 ? cur + 1 : 0);
    const prev = () => goTo(cur > 0 ? cur - 1 : total() - 1);

    nextBtn.addEventListener('click', () => { next(); resetAuto(); });
    prevBtn.addEventListener('click', () => { prev(); resetAuto(); });

    const startAuto = () => { auto = setInterval(next, 4500); };
    const resetAuto = () => { clearInterval(auto); startAuto(); };
    startAuto();

    track.addEventListener('mouseenter', () => clearInterval(auto));
    track.addEventListener('mouseleave', startAuto);

    // Touch swipe
    let tx = 0;
    track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const d = tx - e.changedTouches[0].clientX;
      if (Math.abs(d) > 50) { d > 0 ? next() : prev(); resetAuto(); }
    });

    window.addEventListener('resize', () => {
      perView = spv();
      buildDots();
      goTo(0);
    }, { passive: true });
  }

  // ===== CONTACT FORM =====
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name  = document.getElementById('f-name').value.trim();
      const phone = document.getElementById('f-phone').value.trim();
      const goal  = document.getElementById('f-goal').value;

      if (!name)                { shake('f-name');  return; }
      if (phone.length < 10)    { shake('f-phone'); return; }
      if (!goal)                { shake('f-goal');  return; }

      const btn = document.getElementById('form-submit');
      btn.textContent = 'Sending...';
      btn.disabled = true;

      setTimeout(() => {
        document.querySelector('.contact__right').innerHTML = `
          <div class="form-success">
            <span class="form-success__icon">🎉</span>
            <h3>Thank You, ${name}!</h3>
            <p>Dr. Geetika's team will contact you at <strong>${phone}</strong> within 24 hours.</p>
            <br/>
            <a href="https://wa.me/919999899084" class="btn btn--cta" target="_blank" style="margin:0 auto">
              Chat on WhatsApp Now →
            </a>
          </div>`;
      }, 1200);
    });
  }

  function shake(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.borderColor = '#E8534A';
    el.focus();
    el.style.animation = 'shake 0.4s ease';
    el.addEventListener('animationend', () => { el.style.animation = ''; }, { once: true });
    el.addEventListener('input', () => { el.style.borderColor = ''; }, { once: true });
  }

  // Inject shake keyframes
  const s = document.createElement('style');
  s.textContent = `
    @keyframes shake {
      0%,100%{transform:translateX(0)}
      20%{transform:translateX(-6px)}
      40%{transform:translateX(6px)}
      60%{transform:translateX(-4px)}
      80%{transform:translateX(4px)}
    }`;
  document.head.appendChild(s);

  // ===== SMOOTH SCROLL =====
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 72, behavior: 'smooth' }); }
    });
  });

})();
