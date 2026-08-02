/**
 * Premium Portfolio — script.js
 * Vanilla ES6+ · No dependencies
 *
 * Features:
 *  1. Scroll-reveal animation system (IntersectionObserver)
 *  2. Navbar glassmorphic scroll effect
 *  3. Smooth-scrolling navigation + active-link highlight
 *  4. Mobile hamburger menu
 *  5. Typing effect in hero
 *  6. Project category filter
 *  7. Contact-form validation + toast
 *  8. Parallax hero orbs
 *  9. Counter (stat numbers) animation
 * 10. Back-to-top button
 */

(() => {
  'use strict';

  const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Utilities ─────────────────────────────────────────── */
  const debounce = (fn, ms = 15) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  };

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ====================================================
     1. Scroll Reveal
     ==================================================== */
  const initScrollReveal = () => {
    if (prefersReducedMotion) {
      $$('.reveal, .reveal-card').forEach(el => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = el.dataset.delay;
          if (delay) el.style.transitionDelay = `${delay * 120}ms`;
          el.classList.add('revealed');
          obs.unobserve(el);
        });
      },
      { threshold: 0.12 }
    );

    $$('.reveal, .reveal-card').forEach(el => observer.observe(el));
  };

  /* ====================================================
     2. Navbar scroll effect  &  10. Back-to-top
     ==================================================== */
  const initNavbar = () => {
    const navbar = $('#navbar');
    const btt = $('#backToTop');

    const update = () => {
      const y = window.scrollY;
      if (navbar) navbar.classList.toggle('scrolled', y > 60);
      if (btt) btt.classList.toggle('visible', y > 500);
    };

    window.addEventListener('scroll', debounce(update, 10));
    update();                       // run once on load

    if (btt) {
      btt.addEventListener('click', () =>
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
      );
    }
  };

  /* ====================================================
     3. Smooth scrolling  &  Active-link highlight
     ==================================================== */
  const initNav = () => {
    const links = $$('.nav-link');
    const sections = $$('main section[id]');
    const navH = () => ($('#navbar')?.offsetHeight ?? 80);

    // Smooth scroll on click
    links.forEach(link => {
      link.addEventListener('click', e => {
        const id = link.getAttribute('href');
        if (!id?.startsWith('#')) return;
        const target = $(id);
        if (!target) return;
        e.preventDefault();
        window.scrollTo({
          top: target.offsetTop - navH(),
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
      });
    });

    // Highlight active link
    const hlObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          links.forEach(l => {
            l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
          });
        });
      },
      { rootMargin: `-${navH() + 1}px 0px -40% 0px`, threshold: 0 }
    );
    sections.forEach(s => hlObserver.observe(s));
  };

  /* ====================================================
     4. Mobile menu
     ==================================================== */
  const initMobileMenu = () => {
    const toggle = $('#navToggle');
    const menu = $('#navLinks');
    const navbar = $('#navbar');
    if (!toggle || !menu) return;

    // Sync mobile menu top edge with actual navbar bottom edge
    const syncMenuTop = () => {
      if (navbar) {
        menu.style.top = navbar.getBoundingClientRect().height + 'px';
      }
    };

    const open = () => {
      syncMenuTop();
      toggle.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      menu.classList.add('active');
      document.body.classList.add('no-scroll');
    };
    const close = () => {
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('active');
      document.body.classList.remove('no-scroll');
    };

    toggle.addEventListener('click', () =>
      menu.classList.contains('active') ? close() : open()
    );

    // Close when a link is clicked
    $$('.nav-link', menu).forEach(l => l.addEventListener('click', close));

    // Close on outside click
    document.addEventListener('click', e => {
      if (menu.classList.contains('active') &&
          !menu.contains(e.target) &&
          !toggle.contains(e.target)) {
        close();
      }
    });

    // Keep menu top in sync if window is resized
    window.addEventListener('resize', () => {
      if (menu.classList.contains('active')) syncMenuTop();
    });
  };

  /* ====================================================
     5. Typing effect
     ==================================================== */
  const initTyping = () => {
    const el = $('#typedText');
    const cursor = $('#typedCursor');
    if (!el || !cursor) return;

    const words = [
       "Python Full Stack Developer"

    ];
    const typeSpeed = 80;
    const eraseSpeed = 40;
    const pauseAfterType = 2000;
    const pauseAfterErase = 600;

    let wordIdx = 0;
    let charIdx = 0;
    let isDeleting = false;

    const tick = () => {
      const current = words[wordIdx];

      if (!isDeleting) {
        el.textContent = current.slice(0, ++charIdx);
        if (charIdx === current.length) {
          isDeleting = true;
          return setTimeout(tick, pauseAfterType);
        }
        return setTimeout(tick, typeSpeed);
      }

      el.textContent = current.slice(0, --charIdx);
      if (charIdx === 0) {
        isDeleting = false;
        wordIdx = (wordIdx + 1) % words.length;
        return setTimeout(tick, pauseAfterErase);
      }
      return setTimeout(tick, eraseSpeed);
    };

    setTimeout(tick, 1200);
  };

  /* ====================================================
     6. Project filter
     ==================================================== */
  const initFilter = () => {
    const btns = $$('.filter-btn');
    const cards = $$('.project-card');
    if (!btns.length || !cards.length) return;

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const val = btn.dataset.filter;

        cards.forEach(card => {
          const cats = (card.dataset.category || '').split(' ');
          const match = val === 'all' || cats.includes(val);
          if (match) {
            card.style.display = '';
            requestAnimationFrame(() => {
              card.style.opacity = '1';
              card.style.transform = '';
            });
          } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.92) translateY(8px)';
            setTimeout(() => { card.style.display = 'none'; }, 320);
          }
        });
      });
    });
  };

  /* ====================================================
     7. Contact form + toast
     ==================================================== */
  const initForm = () => {
    const form = $('#contactForm');
    if (!form) return;

    const toast = $('#toast');
    const toastMsg = $('#toastMessage');
    let toastTimer;

    const showToast = (message, type = 'success') => {
      if (!toast) return;
      clearTimeout(toastTimer);
      toastMsg.textContent = message;
      toast.className = `toast show ${type}`;
      toastTimer = setTimeout(() => {
        toast.classList.replace('show', 'hide');
        setTimeout(() => { toast.className = 'toast'; }, 350);
      }, 3200);
    };

    const setError = (id, msg) => {
      const el = $(`#${id}`);
      if (!el) return;
      el.textContent = msg;
      el.classList.toggle('visible', !!msg);
      
      const inputGroup = el.closest('.form-group');
      if (inputGroup) {
        inputGroup.classList.toggle('has-error', !!msg);
        inputGroup.classList.toggle('has-success', !msg);
      }
    };

    const validateEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    const checkField = (input) => {
      const val = input.value.trim();
      const id = input.id;

      if (id === 'formName') {
        if (!val) {
          setError('nameError', 'Please enter your name');
          return false;
        }
        setError('nameError', '');
        return true;
      }

      if (id === 'formEmail') {
        if (!val) {
          setError('emailError', 'Please enter your email address');
          return false;
        }
        if (!validateEmail(val)) {
          setError('emailError', 'Please enter a valid email address');
          return false;
        }
        setError('emailError', '');
        return true;
      }

      if (id === 'formMessage') {
        if (!val) {
          setError('messageError', 'Please write your message');
          return false;
        }
        setError('messageError', '');
        return true;
      }
      return true;
    };

    // Attach real-time input and blur events
    const inputs = $$('.form-input', form);
    inputs.forEach(input => {
      // Focus effect
      input.addEventListener('focus', () => {
        const group = input.closest('.form-group');
        if (group) group.classList.add('focused');
      });

      // Blur validation
      input.addEventListener('blur', () => {
        const group = input.closest('.form-group');
        if (group) {
          group.classList.remove('focused');
          group.classList.toggle('filled', input.value.trim() !== '');
        }
        checkField(input);
      });

      // Real-time input checking
      input.addEventListener('input', () => {
        const group = input.closest('.form-group');
        if (group && group.classList.contains('has-error')) {
          checkField(input);
        }
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();

      let isFormValid = true;
      inputs.forEach(input => {
        const isValid = checkField(input);
        if (!isValid) isFormValid = false;
      });

      if (!isFormValid) {
        showToast('Please correct the errors in the form.', 'error');
        return;
      }

      // Simulate sending
      const btn = $('#submitBtn');
      btn.classList.add('loading');
      btn.disabled = true;

      setTimeout(() => {
        btn.classList.remove('loading');
        btn.disabled = false;
        form.reset();
        
        // Remove success classes from all groups
        $$('.form-group', form).forEach(g => {
          g.classList.remove('has-success', 'filled', 'has-error');
        });
        
        showToast('Message sent successfully! I\'ll get back to you soon.');
      }, 1500);
    });
  };

  /* ====================================================
     8. Parallax hero orbs
     ==================================================== */
  const initParallax = () => {
    if (prefersReducedMotion) return;

    const orbs = $$('.hero-orb');
    if (!orbs.length) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        orbs.forEach((orb, i) => {
          const speed = 0.03 + i * 0.015;
          orb.style.transform = `translate3d(0, ${y * speed}px, 0)`;
        });
        ticking = false;
      });
    });
  };

  /* ====================================================
     9. Counter animation
     ==================================================== */
  const initCounters = () => {
    if (prefersReducedMotion) {
      $$('.stat-number[data-target]').forEach(el => {
        el.textContent = el.dataset.target;
      });
      return;
    }

    const counters = $$('.stat-number[data-target]');
    if (!counters.length) return;

    const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

    const animateCount = el => {
      const target = +el.dataset.target;
      const duration = 2000;
      const start = performance.now();

      const step = now => {
        const progress = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(target * easeOutQuart(progress));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const obs = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          animateCount(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(c => obs.observe(c));
  };



  /* ====================================================
     11. Preloader
     ==================================================== */
  const initPreloader = (onComplete) => {
    const preloader = $('#preloader');
    const bar = $('#preloaderProgress');
    const pct = $('#preloaderPercentage');
    if (!preloader) { onComplete(); return; }

    let progress = 0;
    const target = 100;
    const duration = 1600;
    const start = performance.now();

    const easeOutExpo = t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const tick = now => {
      const elapsed = now - start;
      const raw = Math.min(elapsed / duration, 1);
      progress = Math.round(target * easeOutExpo(raw));

      if (bar) bar.style.width = `${progress}%`;
      if (pct) pct.textContent = `${progress}%`;

      if (raw < 1) {
        requestAnimationFrame(tick);
      } else {
        // Done — fade out
        setTimeout(() => {
          preloader.classList.add('fade-out');
          document.body.classList.remove('loading-active');
          preloader.setAttribute('aria-hidden', 'true');
          setTimeout(() => {
            preloader.remove();
            onComplete();
          }, 600);
        }, 300);
      }
    };
    requestAnimationFrame(tick);
  };

  /* ====================================================
     12. Scroll Progress Bar
     ==================================================== */
  const initScrollProgress = () => {
    const bar = $('#scrollProgressBar');
    if (!bar) return;

    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = `${percent}%`;
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
  };

  /* ====================================================
     13. Cursor Glow
     ==================================================== */
  const initCursorGlow = () => {
    if (prefersReducedMotion) return;
    const glow = $('#cursorGlow');
    if (!glow) return;
    // Only on desktop (hidden via CSS on ≤1024px)
    if (window.innerWidth <= 1024) return;

    document.addEventListener('mousemove', e => {
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
    }, { passive: true });
  };

  /* ====================================================
     14. Background Particles
     ==================================================== */
  const initParticles = () => {
    if (prefersReducedMotion) return;
    const container = $('#particlesContainer');
    if (!container) return;

    const count = Math.min(14, Math.floor(window.innerWidth / 120));

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.classList.add('particle');
      const size = Math.random() * 4 + 2;   // 2–6px
      const left = Math.random() * 100;       // horizontal %
      const delay = Math.random() * 20;       // offset seconds
      const speed = Math.random() * 25 + 25;  // 25–50s

      p.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        bottom: -${size}px;
        animation-duration: ${speed}s;
        animation-delay: -${delay}s;
      `;
      container.appendChild(p);
    }
  };

  /* ====================================================
     15. Button Ripple Effect
     ==================================================== */
  const initRipple = () => {
    if (prefersReducedMotion) return;

    const targets = '.btn, .project-btn, .filter-btn, .nav-toggle, .back-to-top';

    document.addEventListener('click', e => {
      const el = e.target.closest(targets);
      if (!el) return;

      const circle = document.createElement('span');
      circle.classList.add('ripple');
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      circle.style.width = circle.style.height = `${size}px`;
      circle.style.left = `${e.clientX - rect.left - size / 2}px`;
      circle.style.top  = `${e.clientY - rect.top  - size / 2}px`;
      el.appendChild(circle);
      circle.addEventListener('animationend', () => circle.remove());
    });
  };

  /* ====================================================
     16. Keyboard-controlled Background Music
     ==================================================== */
  const initBackgroundMusic = () => {
    const audio = $('#bgMusic');
    const hint = $('#musicHint');
    if (!audio) return;

    // Show music control hint shortly after page load
    if (hint) {
      setTimeout(() => {
        hint.classList.add('show');
        // Auto hide after 5 seconds
        setTimeout(() => {
          hint.classList.remove('show');
        }, 5000);
      }, 2500);
    }

    document.addEventListener('keydown', e => {
      // Ignore keydown events inside textareas, inputs to not block user typing in contact form
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'm') {
        // If it's already playing, don't restart it
        if (audio.paused) {
          audio.play().catch(err => {
            console.warn("Audio play failed or was blocked by browser autoplay policy:", err);
          });
        }
      } else if (key === 's') {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  };

  /* ====================================================
     Boot
     ==================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    initPreloader(() => {
      // Run after preloader finishes
      initScrollReveal();
      initNavbar();
      initNav();
      initMobileMenu();
      initTyping();
      initFilter();
      initForm();
      initParallax();
      initCounters();
      initScrollProgress();
      initCursorGlow();
      initParticles();
      initRipple();
      initBackgroundMusic();
    });
  });
})();
window.addEventListener("load", () => {

    const loader = document.getElementById("preloader");

    setTimeout(() => {

        loader.classList.add("hide");

    }, 1200);

});