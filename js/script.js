"use strict";
/* =========================================================
   Merlito & Daisa — Wedding Invitation
   Compiled from script.ts (see /ts/script.ts for source)
   ========================================================= */
(function () {
  const WEDDING_DATE = new Date("2027-02-14T14:00:00+08:00");
  const VENUE_QUERY = "Sage and Ivory Garden Estate, Carmen, Cagayan de Oro City";

  /* ---------- Theme ---------- */
  function initTheme() {
    const root = document.documentElement;
    const toggle = document.getElementById("theme-toggle");
    const stored = safeGet("wedding-theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored || (prefersDark ? "dark" : "light");
    root.setAttribute("data-theme", initial);

    toggle?.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      safeSet("wedding-theme", next);
    });
  }

  function safeGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, val) {
    try { window.localStorage.setItem(key, val); } catch (e) { /* ignore */ }
  }
  function safeGetJSON(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function safeSetJSON(key, val) {
    try { window.localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* ignore */ }
  }

  /* ---------- Seal gate ---------- */
  function initSealGate() {
    const gate = document.getElementById("seal-gate");
    const openBtn = document.getElementById("open-invite");
    const main = document.getElementById("invitation");
    const nav = document.getElementById("site-nav");
    const audio = document.getElementById("bg-audio");

    const alreadyOpened = sessionStorage_get("wedding-opened");
    if (alreadyOpened) {
      openInvitation(true);
    }

    openBtn?.addEventListener("click", () => {
      openBtn.classList.add("is-opening");
      openBtn.disabled = true;
      setTimeout(() => openInvitation(false), 320);
    });

    function openInvitation(instant) {
      gate?.classList.add("is-hidden");
      if (main) main.hidden = false;
      nav?.classList.add("is-visible");
      document.body.style.overflow = "";
      sessionStorage_set("wedding-opened", "1");
      startMusic();
      triggerReveal();
    }

    function startMusic() {
      const toggle = document.getElementById("music-toggle");
      const label = document.getElementById("music-label");
      if (!audio) return;
      audio.play()
        .then(() => {
          toggle?.setAttribute("aria-pressed", "true");
          if (label) label.textContent = "Pause Music";
        })
        .catch(() => {
          // Autoplay was blocked (e.g. revisiting without a fresh click) —
          // fall back to the manual button.
          toggle?.setAttribute("aria-pressed", "false");
          if (label) label.textContent = "Play Music";
        });
    }

    function sessionStorage_get(key) {
      try { return window.sessionStorage.getItem(key); } catch (e) { return null; }
    }
    function sessionStorage_set(key, val) {
      try { window.sessionStorage.setItem(key, val); } catch (e) { /* ignore */ }
    }
  }

  function triggerReveal() {
    // re-run the scroll observer pass in case sections are already in view
    window.dispatchEvent(new Event("scroll"));
  }

  /* ---------- Nav: toggle, scrollspy, shrink ---------- */
  function initNav() {
    const toggle = document.getElementById("nav-toggle");
    const menu = document.getElementById("site-nav-menu");
    toggle?.addEventListener("click", () => {
      const isOpen = menu?.classList.toggle("is-open");
      toggle.classList.toggle("is-open", !!isOpen);
      toggle.setAttribute("aria-expanded", String(!!isOpen));
    });

    document.querySelectorAll("[data-nav]").forEach((link) => {
      link.addEventListener("click", () => {
        menu?.classList.remove("is-open");
        toggle?.classList.remove("is-open");
        toggle?.setAttribute("aria-expanded", "false");
      });
    });

    const sections = Array.from(document.querySelectorAll("main .section, main .hero"));
    const navLinks = Array.from(document.querySelectorAll("[data-nav]"));
    if (!sections.length || !navLinks.length) return;

    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            navLinks.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${id}`));
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Nav magnify (dock-style) ---------- */
  function initNavMagnify() {
    const menu = document.getElementById("site-nav-menu");
    if (!menu) return;
    const items = Array.from(menu.querySelectorAll("li"));
    if (!items.length) return;

    const MAX_SCALE = 1.55;
    const MAX_LIFT = 10;
    const SPREAD = 110; // px influence radius
    const isDesktop = () => window.matchMedia("(min-width: 861px)").matches;
    let ticking = false;

    function reset() {
      items.forEach((li) => {
        li.style.transform = "";
        li.style.setProperty("--magnify-scale", "1");
      });
    }

    function apply(clientX) {
      items.forEach((li) => {
        const rect = li.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const dist = Math.abs(clientX - center);
        const influence = Math.max(0, 1 - dist / SPREAD);
        const eased = influence * influence * (3 - 2 * influence); // smoothstep
        const scale = 1 + (MAX_SCALE - 1) * eased;
        const lift = -MAX_LIFT * eased;
        li.style.transform = `translateY(${lift}px) scale(${scale})`;
        li.style.setProperty("--magnify-scale", String(scale));
        li.style.zIndex = eased > 0.05 ? "2" : "1";
      });
    }

    menu.addEventListener("mousemove", (e) => {
      if (!isDesktop()) return;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        apply(e.clientX);
        ticking = false;
      });
    });

    menu.addEventListener("mouseleave", reset);
    window.addEventListener("resize", () => { if (!isDesktop()) reset(); });
  }

  /* ---------- Scroll reveal ---------- */
  function initScrollReveal() {
    const targets = document.querySelectorAll(".reveal-on-scroll");
    if (!("IntersectionObserver" in window)) {
      targets.forEach((t) => t.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );
    targets.forEach((t) => io.observe(t));
  }

  /* ---------- Countdown ---------- */
  function initCountdown() {
    const els = {
      days: document.getElementById("cd-days"),
      hours: document.getElementById("cd-hours"),
      mins: document.getElementById("cd-mins"),
      secs: document.getElementById("cd-secs"),
    };
    if (!els.days) return;

    function tick() {
      const now = new Date().getTime();
      let diff = WEDDING_DATE.getTime() - now;
      if (diff < 0) diff = 0;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      els.days.textContent = pad(days);
      els.hours.textContent = pad(hours);
      els.mins.textContent = pad(mins);
      els.secs.textContent = pad(secs);
    }
    function pad(n) { return String(n).padStart(2, "0"); }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Map placeholder link ---------- */
  function initMapLink() {
    const link = document.getElementById("map-link");
    if (link) link.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(VENUE_QUERY)}`;
  }

  /* ---------- Radial Photo Carousel ---------- */
  function initRadialCarousel() {
    const stage = document.getElementById("carousel-stage");
    const ring = document.getElementById("carousel-ring");
    const dotsWrap = document.getElementById("carousel-dots");
    const prevBtn = document.getElementById("carousel-prev");
    const nextBtn = document.getElementById("carousel-next");
    if (!stage || !ring || !dotsWrap) return;

    const items = Array.from(ring.querySelectorAll(".radial-carousel__item"));
    if (!items.length) return;

    const count = items.length;
    const angleStep = 360 / count;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let currentRotation = 0;
    let activeIndex = 0;
    let autoplayTimer = null;
    let dragging = false;
    let dragMoved = false;
    let startX = 0;
    let startRotation = 0;
    let suppressNextClick = false;

    function layout() {
      const stageSize = stage.clientWidth;
      const itemSize = parseFloat(getComputedStyle(stage).getPropertyValue("--item-size")) || 90;
      const radius = stageSize / 2 - itemSize / 2 - 6;
      items.forEach((item, i) => {
        const angle = i * angleStep;
        item.style.transform = `translate(-50%,-50%) rotate(${angle}deg) translateY(-${radius}px) rotate(${-angle}deg)`;
      });
      update();
    }

    function update() {
      ring.style.transform = `rotate(${currentRotation}deg)`;
      let bestDiff = Infinity;
      let bestIdx = 0;
      items.forEach((item, i) => {
        const angle = i * angleStep;
        const inner = item.querySelector(".radial-carousel__inner");
        if (inner) inner.style.transform = `rotate(${-(currentRotation + angle)}deg)`;
        let total = (currentRotation + angle) % 360;
        if (total < 0) total += 360;
        const diff = Math.min(total, 360 - total);
        if (diff < bestDiff) { bestDiff = diff; bestIdx = i; }
      });
      items.forEach((item, i) => item.classList.toggle("is-active", i === bestIdx));
      activeIndex = bestIdx;
      updateDots();
    }

    function rotateTo(targetIndex) {
      const target = -targetIndex * angleStep;
      let delta = (target - currentRotation) % 360;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      currentRotation += delta;
      update();
    }

    function buildDots() {
      dotsWrap.innerHTML = "";
      items.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "radial-carousel__dot";
        dot.setAttribute("aria-label", `Go to photo ${i + 1}`);
        dot.addEventListener("click", () => { rotateTo(i); restartAutoplay(); });
        dotsWrap.appendChild(dot);
      });
    }
    function updateDots() {
      Array.from(dotsWrap.children).forEach((d, i) => d.classList.toggle("is-active", i === activeIndex));
    }

    function startAutoplay() {
      if (reduceMotion) return;
      stopAutoplay();
      autoplayTimer = setInterval(() => rotateTo((activeIndex + 1) % count), 4200);
    }
    function stopAutoplay() { if (autoplayTimer) clearInterval(autoplayTimer); autoplayTimer = null; }
    function restartAutoplay() { stopAutoplay(); startAutoplay(); }

    prevBtn?.addEventListener("click", () => { rotateTo((activeIndex - 1 + count) % count); restartAutoplay(); });
    nextBtn?.addEventListener("click", () => { rotateTo((activeIndex + 1) % count); restartAutoplay(); });

    /* Drag to spin */
    function onPointerDown(e) {
      dragging = true;
      dragMoved = false;
      startX = e.clientX;
      startRotation = currentRotation;
      ring.classList.add("is-dragging");
      ring.setPointerCapture?.(e.pointerId);
      stopAutoplay();
    }
    function onPointerMove(e) {
      if (!dragging) return;
      const deltaX = e.clientX - startX;
      if (Math.abs(deltaX) > 4) dragMoved = true;
      currentRotation = startRotation + deltaX * 0.4;
      update();
    }
    function onPointerUp() {
      if (!dragging) return;
      dragging = false;
      ring.classList.remove("is-dragging");
      if (dragMoved) {
        rotateTo(activeIndex);
        suppressNextClick = true;
        setTimeout(() => { suppressNextClick = false; }, 60);
      }
      restartAutoplay();
    }

    ring.addEventListener("pointerdown", onPointerDown);
    ring.addEventListener("pointermove", onPointerMove);
    ring.addEventListener("pointerup", onPointerUp);
    ring.addEventListener("pointercancel", onPointerUp);
    ring.addEventListener("click", (e) => {
      if (suppressNextClick) { e.stopPropagation(); e.preventDefault(); }
    }, true);

    stage.addEventListener("mouseenter", stopAutoplay);
    stage.addEventListener("mouseleave", startAutoplay);
    stage.addEventListener("focusin", stopAutoplay);
    stage.addEventListener("focusout", startAutoplay);

    let resizeTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(layout, 150);
    });

    buildDots();
    layout();
    startAutoplay();
  }

  /* ---------- Gallery + Lightbox ---------- */
  /* ---------- Gallery + Lightbox ---------- */
function initGallery() {
  const items = Array.from(document.querySelectorAll(".gallery__item"));
  const lightbox = document.getElementById("lightbox");
  const img = document.getElementById("lightbox-image");
  const caption = document.getElementById("lightbox-caption");
  const closeBtn = document.getElementById("lightbox-close");
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");
  if (!items.length || !lightbox || !img) return;

  let currentIndex = 0;

  function openAt(index) {
    currentIndex = (index + items.length) % items.length;
    const item = items[currentIndex];
    const image = item.querySelector("img");
    const cap = item.querySelector(".gallery__caption, .caption");
    img.src = image ? image.currentSrc || image.src : "";
    img.alt = image ? image.alt : "";
    if (caption) caption.textContent = cap ? cap.textContent : "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function close() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  items.forEach((item, index) => {
    item.addEventListener("click", (e) => {
      // Prevent opening lightbox if item was actively being dragged
      if (item.closest('#carousel-ring')?.classList.contains('is-dragging')) return;
      openAt(index);
    });
  });

  closeBtn?.addEventListener("click", close);
  prevBtn?.addEventListener("click", () => openAt(currentIndex - 1));
  nextBtn?.addEventListener("click", () => openAt(currentIndex + 1));
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) close(); });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") openAt(currentIndex - 1);
    if (e.key === "ArrowRight") openAt(currentIndex + 1);
  });
}

  /* ---------- RSVP form validation ---------- */
  function initRSVP() {
    const form = document.getElementById("rsvp-form");
    const modal = document.getElementById("rsvp-modal");
    const modalClose = document.getElementById("rsvp-modal-close");
    const modalBackdrop = document.getElementById("rsvp-modal-backdrop");
    const modalText = document.getElementById("rsvp-modal-text");
    if (!form) return;

    const nameEl = document.getElementById("rsvp-name");
    const emailEl = document.getElementById("rsvp-email");
    const phoneEl = document.getElementById("rsvp-phone");
    const guestsEl = document.getElementById("rsvp-guests");

    const validators = {
      "rsvp-name": (v) => (v.trim().length >= 2 ? "" : "Please enter your full name."),
      "rsvp-email": (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Please enter a valid email address."),
      "rsvp-phone": (v) => (/^[0-9+()\-\s]{7,15}$/.test(v.trim()) ? "" : "Please enter a valid contact number."),
      "rsvp-guests": (v) => (v ? "" : "Please select the number of guests."),
    };

    function showError(id, message) {
      const el = document.getElementById(id);
      const errorEl = document.querySelector(`[data-error-for="${id}"]`);
      if (el) el.classList.toggle("is-invalid", !!message);
      if (errorEl) errorEl.textContent = message;
    }

    [nameEl, emailEl, phoneEl, guestsEl].forEach((el) => {
      el?.addEventListener("input", () => {
        const validator = validators[el.id];
        if (validator) showError(el.id, validator(el.value));
      });
      el?.addEventListener("blur", () => {
        const validator = validators[el.id];
        if (validator) showError(el.id, validator(el.value));
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;

      Object.keys(validators).forEach((id) => {
        const el = document.getElementById(id);
        const message = validators[id](el ? el.value : "");
        showError(id, message);
        if (message) valid = false;
      });

      const attendance = form.querySelector('input[name="attendance"]:checked');
      const attendanceError = document.querySelector('[data-error-for="rsvp-attendance"]');
      if (!attendance) {
        if (attendanceError) attendanceError.textContent = "Please let us know if you'll be attending.";
        valid = false;
      } else if (attendanceError) {
        attendanceError.textContent = "";
      }

      if (!valid) {
        const firstInvalid = form.querySelector(".is-invalid");
        firstInvalid?.focus();
        return;
      }

      const data = {
        name: nameEl.value.trim(),
        email: emailEl.value.trim(),
        phone: phoneEl.value.trim(),
        guests: guestsEl.value,
        attendance: attendance.value,
        message: document.getElementById("rsvp-message")?.value.trim() || "",
        submittedAt: new Date().toISOString(),
      };

      const responses = safeGetJSON("wedding-rsvps", []);
      responses.push(data);
      safeSetJSON("wedding-rsvps", responses);

      if (modalText) {
        modalText.textContent =
          data.attendance === "joyfully-accept"
            ? `Thank you, ${data.name.split(" ")[0]}! We can't wait to celebrate with you and ${Number(data.guests) > 1 ? "your guests" : "you"}.`
            : `Thank you for letting us know, ${data.name.split(" ")[0]}. You'll be in our hearts on the day.`;
      }
      openModal(modal);
      form.reset();
      [nameEl, emailEl, phoneEl, guestsEl].forEach((el) => el?.classList.remove("is-invalid"));
    });

    function openModal(el) {
      if (!el) return;
      el.classList.add("is-open");
      el.setAttribute("aria-hidden", "false");
    }
    function closeModal(el) {
      if (!el) return;
      el.classList.remove("is-open");
      el.setAttribute("aria-hidden", "true");
    }
    modalClose?.addEventListener("click", () => closeModal(modal));
    modalBackdrop?.addEventListener("click", () => closeModal(modal));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal?.classList.contains("is-open")) closeModal(modal);
    });
  }

  /* ---------- Guestbook ---------- */
  function initGuestbook() {
    const form = document.getElementById("guestbook-form");
    const wall = document.getElementById("guestbook-wall");
    if (!form || !wall) return;

    const seed = [
      { name: "Ate Stephane", message: "Wishing you both a lifetime of love, laughter, and adventure together!" },
      { name: "Mama Sally", message: "So happy for you two. May your marriage be as beautiful as your love story." },
      { name: "Ate Trixia June", message: "Congratulations Merlito and Daisa! Can't wait to celebrate with you." },
    ];

    function render() {
      const stored = safeGetJSON("wedding-guestbook", []);
      const all = [...seed, ...stored].slice(-30).reverse();
      wall.innerHTML = "";
      all.forEach((entry) => {
        const card = document.createElement("article");
        card.className = "guestbook__card reveal-on-scroll is-in";
        const p = document.createElement("p");
        p.textContent = `"${entry.message}"`;
        const cite = document.createElement("cite");
        cite.textContent = `— ${entry.name}`;
        card.appendChild(p);
        card.appendChild(cite);
        wall.appendChild(card);
      });
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameEl = document.getElementById("gb-name");
      const msgEl = document.getElementById("gb-message");
      const name = nameEl.value.trim();
      const message = msgEl.value.trim();
      if (!name || !message) return;

      const stored = safeGetJSON("wedding-guestbook", []);
      stored.push({ name, message });
      safeSetJSON("wedding-guestbook", stored);
      form.reset();
      render();
    });

    render();
  }

  /* ---------- Music player ---------- */
  function initMusicPlayer() {
    const btn = document.getElementById("music-toggle");
    const label = document.getElementById("music-label");
    const audio = document.getElementById("bg-audio");
    if (!btn || !audio) return;

    btn.addEventListener("click", () => {
      const playing = btn.getAttribute("aria-pressed") === "true";
      if (playing) {
        audio.pause();
        btn.setAttribute("aria-pressed", "false");
        if (label) label.textContent = "Play Music";
      } else {
        audio.play().catch(() => {
          if (label) label.textContent = "Music Unavailable";
        });
        btn.setAttribute("aria-pressed", "true");
        if (label) label.textContent = "Pause Music";
      }
    });
  }

  /* ---------- Nav shrink on scroll ---------- */
  function initNavVisibility() {
    const nav = document.getElementById("site-nav");
    const gate = document.getElementById("seal-gate");
    window.addEventListener("scroll", () => {
      if (!gate?.classList.contains("is-hidden")) return;
      nav?.classList.add("is-visible");
    });
  }

  /* ---------- Ambient sprig particles on canvas ---------- */
  function initSprigCanvas() {
    const canvas = document.getElementById("sprig-canvas");
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles = [];
    let width = 0, height = 0;
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = document.documentElement.scrollHeight;
      const count = Math.min(60, Math.floor((width * height) / 90000));
      particles = Array.from({ length: count }, () => makeParticle());
    }
    function makeParticle() {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: 1 + Math.random() * 2.2,
        speed: 0.15 + Math.random() * 0.35,
        drift: (Math.random() - 0.5) * 0.3,
        hue: Math.random() > 0.5 ? "198,161,91" : "147,168,130",
        alpha: 0.15 + Math.random() * 0.25,
      };
    }
    function draw() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.hue},${p.alpha})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
      });
      if (!reduceMotion) requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", debounce(resize, 250));
    draw();
  }

  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  /* ---------- Footer year ---------- */
  function initFooterYear() {
    const el = document.getElementById("footer-year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initSealGate();
    initNav();
    initNavMagnify();
    initNavVisibility();
    initScrollReveal();
    initCountdown();
    initMapLink();
    // initRadialCarousel(); // replaced with static photo-grid gallery
    initGallery();
    initRSVP();
    initGuestbook();
    initMusicPlayer();
    initSprigCanvas();
    initFooterYear();
  });
})();