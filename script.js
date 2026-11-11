const honeyBloomConfig = {
  businessName: "HoneyBloom Ice Cream",
  openingDate: "January 1, 2027",
  location: "62-A Mangosteen, Arca South, Taguig City, Metro Manila",
  price: 100,
  priceConfirmed: true,
  servingSize: "8 oz",
  hours: {
    monday: "Closed",
    tuesdayToSunday: "10:00 AM–6:00 PM",
  },
  paymentMethods: ["Cash", "GCash"],
  socialLinks: {
    facebook: "https://www.facebook.com/people/HoneyBloom-Ice-Cream/61594597684046/",
    instagram: "https://www.instagram.com/honeybloom_icecream?obrf=ZTA3aXJraHR6c3Ey",
    tiktok: "https://www.tiktok.com/@honey.bloom.ice.c?_r=1&_t=ZS-9AhOK3tj25k",
  },
};

function populateBusinessDetails() {
  document.querySelectorAll("[data-opening-date]").forEach((element) => {
    element.textContent = honeyBloomConfig.openingDate;
  });

  document.querySelectorAll("[data-location]").forEach((element) => {
    element.textContent = honeyBloomConfig.location;
  });

  const hoursElement = document.querySelector("[data-hours]");
  if (hoursElement) {
    hoursElement.textContent = `Tuesday–Sunday · ${honeyBloomConfig.hours.tuesdayToSunday}`;
  }

  const paymentsElement = document.querySelector("[data-payments]");
  if (paymentsElement) {
    paymentsElement.textContent = honeyBloomConfig.paymentMethods.join(" & ");
  }

  const formattedPrice = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(honeyBloomConfig.price);

  document.querySelectorAll("[data-price]").forEach((element) => {
    element.textContent = formattedPrice;
  });

  const priceDisplay = document.querySelector("[data-price-display]");
  if (priceDisplay) {
    priceDisplay.textContent = honeyBloomConfig.priceConfirmed
      ? `${formattedPrice} / ${honeyBloomConfig.servingSize}`
      : `Proposed price: ${formattedPrice} / ${honeyBloomConfig.servingSize} · Subject to confirmation`;
  }

  const faqPrice = document.querySelector("[data-faq-price]");
  if (faqPrice) {
    faqPrice.textContent = honeyBloomConfig.priceConfirmed
      ? `HoneyBloom costs ${formattedPrice} per ${honeyBloomConfig.servingSize} serving.`
      : `The proposed price is ${formattedPrice} per ${honeyBloomConfig.servingSize} serving. Final pricing is subject to confirmation before launch.`;
  }

  document.querySelectorAll("[data-social]").forEach((link) => {
    const platform = link.dataset.social;
    if (platform && honeyBloomConfig.socialLinks[platform]) {
      link.href = honeyBloomConfig.socialLinks[platform];
    }
  });

  const yearElement = document.querySelector("[data-current-year]");
  if (yearElement) yearElement.textContent = new Date().getFullYear();
}

function initializeMobileNavigation() {
  const toggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".site-nav");
  if (!toggle || !navigation) return;

  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation menu");
    navigation.classList.remove("open");
  };

  toggle.addEventListener("click", () => {
    const willOpen = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(willOpen));
    toggle.setAttribute("aria-label", willOpen ? "Close navigation menu" : "Open navigation menu");
    navigation.classList.toggle("open", willOpen);
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navigation.classList.contains("open")) {
      closeMenu();
      toggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!navigation.contains(event.target) && !toggle.contains(event.target)) closeMenu();
  });
}

function initializeAccordion() {
  document.querySelectorAll(".faq-item button").forEach((button) => {
    button.addEventListener("click", () => {
      const panelId = button.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : null;
      if (!panel) return;

      const isOpen = button.getAttribute("aria-expanded") === "true";

      // Close all others
      document.querySelectorAll(".faq-item button[aria-expanded='true']").forEach((otherBtn) => {
        if (otherBtn === button) return;
        const otherId = otherBtn.getAttribute("aria-controls");
        const otherPanel = otherId ? document.getElementById(otherId) : null;
        if (otherPanel) {
          otherBtn.setAttribute("aria-expanded", "false");
          otherPanel.classList.remove("is-open");
        }
      });

      button.setAttribute("aria-expanded", String(!isOpen));
      panel.classList.toggle("is-open", !isOpen);
    });
  });
}

function initializeRevealAnimations() {
  const elements = document.querySelectorAll(".reveal");
  if (!elements.length) return;

  if (
    !("IntersectionObserver" in window) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    elements.forEach((element) => element.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
  );

  elements.forEach((element) => observer.observe(element));
}

function initializeBackToTop() {
  const button = document.querySelector(".back-to-top");
  if (!button) return;

  const updateVisibility = () => {
    button.classList.toggle("visible", window.scrollY > 700);
  };

  window.addEventListener("scroll", updateVisibility, { passive: true });
  button.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  });
  updateVisibility();
}

function initializeScrollFeedback() {
  const header = document.querySelector("[data-header]");
  const navigationLinks = [...document.querySelectorAll(".site-nav > a:not(.nav-cta)")];
  const sectionLinks = navigationLinks
    .map((link) => {
      const section = document.querySelector(link.getAttribute("href"));
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  if (!header || !sectionLinks.length) return;

  let framePending = false;
  const update = () => {
    header.classList.toggle("scrolled", window.scrollY > 12);

    const marker = window.scrollY + window.innerHeight * 0.35;
    let current = sectionLinks[0];
    sectionLinks.forEach((item) => {
      if (item.section.offsetTop <= marker) current = item;
    });

    sectionLinks.forEach(({ link }) => {
      const isActive = link === current.link;
      link.classList.toggle("active", isActive);
      if (isActive) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    framePending = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!framePending) {
        window.requestAnimationFrame(update);
        framePending = true;
      }
    },
    { passive: true },
  );
  update();
}

function initializeHeroParallax() {
  const sunburst = document.querySelector(".sunburst");
  const heroFlowerOne = document.querySelector(".flower-one");
  const heroFlowerTwo = document.querySelector(".flower-two");
  if (!sunburst) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let framePending = false;
  window.addEventListener("scroll", () => {
    if (!framePending) {
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        if (sunburst) sunburst.style.transform = `rotate(${-8 + y * 0.015}deg) scale(${1 + y * 0.00005}) translateY(${y * 0.12}px)`;
        if (heroFlowerOne) heroFlowerOne.style.transform = `translateY(${y * 0.18}px) rotate(${y * 0.02}deg)`;
        if (heroFlowerTwo) heroFlowerTwo.style.transform = `translateY(${y * 0.14}px) rotate(${y * 0.015}deg)`;
        framePending = false;
      });
      framePending = true;
    }
  }, { passive: true });
}

function initializeEasterEgg() {
  const title = document.getElementById("hero-title");
  const overlay = document.getElementById("egg-overlay");
  const closeBtn = document.getElementById("egg-close");
  const petalsContainer = document.getElementById("egg-petals");
  if (!title || !overlay || !closeBtn) return;

  const REQUIRED_CLICKS = 5;
  let clickCount = 0;
  let resetTimer = null;
  const petals = ["✿", "✦", "🌸", "🍯", "🌼", "✿", "💮", "🌺"];

  function spawnPetals() {
    petalsContainer.innerHTML = "";
    const total = 28;
    for (let i = 0; i < total; i++) {
      const el = document.createElement("span");
      el.className = "egg-petal";
      el.textContent = petals[Math.floor(Math.random() * petals.length)];
      el.style.left = `${Math.random() * 100}%`;
      el.style.fontSize = `${1 + Math.random() * 1.5}rem`;
      el.style.animationDelay = `${Math.random() * 2.5}s`;
      el.style.animationDuration = `${2.5 + Math.random() * 2}s`;
      petalsContainer.appendChild(el);
    }
  }

  function openEgg() {
    spawnPetals();
    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function closeEgg() {
    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    clickCount = 0;
    title.focus();
  }

  title.addEventListener("click", () => {
    clickCount++;
    // Wiggle feedback on each click
    title.style.transition = "transform 0.15s ease";
    title.style.transform = `scale(${1 + clickCount * 0.03}) rotate(${(clickCount % 2 === 0 ? 1 : -1) * clickCount}deg)`;
    setTimeout(() => {
      title.style.transform = "";
    }, 180);

    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => { clickCount = 0; }, 3000);

    if (clickCount >= REQUIRED_CLICKS) {
      clearTimeout(resetTimer);
      clickCount = 0;
      openEgg();
    }
  });

  closeBtn.addEventListener("click", closeEgg);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeEgg();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("active")) closeEgg();
  });
}

function initializeGallery() {
  const wrap = document.getElementById("gallery-track-wrap");
  const track = document.getElementById("gallery-track");
  const prevBtn = document.getElementById("gallery-prev");
  const nextBtn = document.getElementById("gallery-next");
  const dotsContainer = document.getElementById("gallery-dots");
  const lightbox = document.getElementById("gallery-lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxClose = document.getElementById("lightbox-close");
  if (!wrap || !track) return;

  const originalSlides = [...track.querySelectorAll(".gallery-slide")];
  const total = originalSlides.length;
  const GAP = 16;

  // State
  let currentIndex = 0;   // logical index (0 … total-1)
  let trackIndex = 0;      // physical index into allSlides (includes clones)
  let isDragging = false;
  let startX = 0;
  let lastX = 0;
  let dragDelta = 0;
  let dragVelocity = 0;    // px/ms — used for momentum-based throw
  let lastMoveTime = 0;
  let baseTranslate = 0;
  // "pending" queues a step requested while a transition is running
  let pendingStep = 0;
  let isTransitioning = false;

  // ── Clone slides for seamless infinite loop ──
  const clonesBefore = originalSlides.map((s) => {
    const c = s.cloneNode(true);
    c.setAttribute("aria-hidden", "true");
    return c;
  });
  const clonesAfter = originalSlides.map((s) => {
    const c = s.cloneNode(true);
    c.setAttribute("aria-hidden", "true");
    return c;
  });
  clonesBefore.forEach((c) => track.prepend(c));
  clonesAfter.forEach((c) => track.appendChild(c));

  const allSlides = [...track.querySelectorAll(".gallery-slide")];
  const cloneOffset = clonesBefore.length; // = total

  // ── Dots ──
  if (dotsContainer) {
    originalSlides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "gallery-dot" + (i === 0 ? " active" : "");
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      dot.addEventListener("click", () => goTo(i));
      dotsContainer.appendChild(dot);
    });
  }

  if (prevBtn) prevBtn.disabled = false;
  if (nextBtn) nextBtn.disabled = false;

  // ── Helpers ──
  function getOffsetOf(idx) {
    let offset = 0;
    for (let i = 0; i < idx; i++) {
      offset += allSlides[i].offsetWidth + GAP;
    }
    return -offset;
  }

  function updateDots(logicalIdx) {
    document.querySelectorAll(".gallery-dot").forEach((d, i) => {
      d.classList.toggle("active", i === logicalIdx);
    });
  }

  function updateActiveSlide(physicalIdx) {
    allSlides.forEach((s, i) => {
      s.classList.toggle("active-slide", i === physicalIdx);
    });
  }

  function setTranslate(tx, animate) {
    if (animate) {
      track.classList.remove("no-transition");
    } else {
      track.classList.add("no-transition");
    }
    track.style.transform = `translateX(${tx}px)`;
  }

  // ── Navigate to a logical index ──
  function goTo(logicalIdx, animate = true) {
    logicalIdx = ((logicalIdx % total) + total) % total;
    currentIndex = logicalIdx;
    trackIndex = logicalIdx + cloneOffset;
    const tx = getOffsetOf(trackIndex);
    setTranslate(tx, animate);
    updateDots(currentIndex);
    updateActiveSlide(trackIndex);
    if (animate) isTransitioning = true;
  }

  // ── Step one slide in a direction ──
  // Accepts a queued step while already transitioning so rapid clicks
  // feel responsive (each lands, one at a time, without skipping).
  function step(direction) {
    if (isTransitioning) {
      // Queue at most one ahead — prevents piling up
      pendingStep = direction;
      return;
    }

    const nextLogical = ((currentIndex + direction) % total + total) % total;
    const nextPhysical = trackIndex + direction;

    currentIndex = nextLogical;
    trackIndex = nextPhysical;

    setTranslate(getOffsetOf(nextPhysical), true);
    updateDots(currentIndex);
    updateActiveSlide(nextPhysical);
    isTransitioning = true;
  }

  // ── After each animation: snap back from clone zone & flush queue ──
  track.addEventListener("transitionend", (e) => {
    if (e.propertyName !== "transform") return;
    isTransitioning = false;

    const lowerBound = cloneOffset;
    const upperBound = cloneOffset + total - 1;

    if (trackIndex < lowerBound || trackIndex > upperBound) {
      // Silently teleport to the matching real slide
      trackIndex = currentIndex + cloneOffset;
      setTranslate(getOffsetOf(trackIndex), false);
      track.getBoundingClientRect(); // force reflow
    }

    // Flush any queued step
    if (pendingStep !== 0) {
      const queued = pendingStep;
      pendingStep = 0;
      step(queued);
    }
  });

  // ── Buttons ──
  if (prevBtn) prevBtn.addEventListener("click", () => step(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => step(1));

  // ── Keyboard ──
  wrap.setAttribute("tabindex", "0");
  wrap.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); step(-1); }
  });

  // ── Mouse drag — with velocity tracking for momentum throw ──
  wrap.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    lastX = e.clientX;
    dragDelta = 0;
    dragVelocity = 0;
    lastMoveTime = performance.now();
    baseTranslate = getOffsetOf(trackIndex);
    wrap.classList.add("dragging");
    track.classList.add("no-transition");
    // Interrupt ongoing transition so drag feels instant
    if (isTransitioning) {
      isTransitioning = false;
      pendingStep = 0;
      const currentTx = new DOMMatrix(getComputedStyle(track).transform).m41;
      track.style.transform = `translateX(${currentTx}px)`;
      baseTranslate = currentTx;
      startX = e.clientX;
      lastX = e.clientX;
    }
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const now = performance.now();
    const dt = now - lastMoveTime;
    if (dt > 0) dragVelocity = (e.clientX - lastX) / dt; // px/ms
    lastX = e.clientX;
    lastMoveTime = now;
    dragDelta = e.clientX - startX;
    track.style.transform = `translateX(${baseTranslate + dragDelta}px)`;
  });

  window.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    wrap.classList.remove("dragging");
    releaseDrag();
  });

  // ── Touch swipe — same velocity tracking ──
  wrap.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    lastX = startX;
    dragDelta = 0;
    dragVelocity = 0;
    lastMoveTime = performance.now();
    baseTranslate = getOffsetOf(trackIndex);
    if (isTransitioning) {
      isTransitioning = false;
      pendingStep = 0;
      const currentTx = new DOMMatrix(getComputedStyle(track).transform).m41;
      baseTranslate = currentTx;
      startX = e.touches[0].clientX;
      lastX = startX;
    }
    track.classList.add("no-transition");
  }, { passive: true });

  wrap.addEventListener("touchmove", (e) => {
    const now = performance.now();
    const dt = now - lastMoveTime;
    const x = e.touches[0].clientX;
    if (dt > 0) dragVelocity = (x - lastX) / dt;
    lastX = x;
    lastMoveTime = now;
    dragDelta = x - startX;
    track.style.transform = `translateX(${baseTranslate + dragDelta}px)`;
  }, { passive: true });

  wrap.addEventListener("touchend", () => releaseDrag());

  // ── Momentum-based release: fast flick = step, slow drag = threshold ──
  function releaseDrag() {
    const FLICK_VELOCITY = 0.4;   // px/ms threshold for a flick
    const DRAG_THRESHOLD = 55;    // px threshold for a slow drag

    const isFlick = Math.abs(dragVelocity) > FLICK_VELOCITY;
    const isBigDrag = Math.abs(dragDelta) > DRAG_THRESHOLD;

    if (isFlick || isBigDrag) {
      // Direction: flick/drag left = next, right = prev
      const dir = (dragVelocity < 0 || dragDelta < 0) ? 1 : -1;
      // Allow multi-step for fast throws
      const steps = isFlick ? Math.min(Math.round(Math.abs(dragVelocity) / FLICK_VELOCITY), 2) : 1;
      for (let i = 0; i < steps; i++) step(dir);
    } else {
      goTo(currentIndex);
    }
    dragDelta = 0;
    dragVelocity = 0;
  }

  // ── Lightbox ──
  originalSlides.forEach((slide) => {
    const img = slide.querySelector("img");
    if (!img || !lightbox || !lightboxImg) return;
    slide.style.cursor = "pointer";
    slide.addEventListener("click", () => {
      if (Math.abs(dragDelta) > 8) return;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add("active");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      if (lightboxClose) lightboxClose.focus();
    });
  });

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox && lightbox.classList.contains("active")) closeLightbox();
  });

  // ── Auto-advance every 5 s, pauses on hover/focus ──
  let autoTimer = null;
  const AUTO_INTERVAL = 5000;

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => step(1), AUTO_INTERVAL);
  }
  function stopAuto() {
    clearInterval(autoTimer);
  }

  wrap.addEventListener("mouseenter", stopAuto);
  wrap.addEventListener("mouseleave", startAuto);
  wrap.addEventListener("focusin", stopAuto);
  wrap.addEventListener("focusout", startAuto);

  // ── Init ──
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      goTo(0, false);
      startAuto();
    });
  });
}

function initializeCountdown() {
  const target = new Date("2027-01-01T00:00:00+08:00"); // PH time
  const daysEl  = document.getElementById("cd-days");
  const hoursEl = document.getElementById("cd-hours");
  const minsEl  = document.getElementById("cd-mins");
  const secsEl  = document.getElementById("cd-secs");
  if (!daysEl) return;

  function pad(n) { return String(n).padStart(2, "0"); }

  function tick(el, val) {
    const newVal = pad(val);
    if (el.textContent !== newVal) {
      el.classList.remove("tick");
      void el.offsetWidth; // reflow to restart animation
      el.classList.add("tick");
      el.textContent = newVal;
      setTimeout(() => el.classList.remove("tick"), 200);
    }
  }

  function update() {
    const diff = target - Date.now();
    if (diff <= 0) {
      daysEl.textContent = hoursEl.textContent = minsEl.textContent = secsEl.textContent = "00";
      return;
    }
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000) / 60000);
    const secs  = Math.floor((diff % 60000) / 1000);
    tick(daysEl, days);
    tick(hoursEl, hours);
    tick(minsEl, mins);
    tick(secsEl, secs);
  }

  update();
  setInterval(update, 1000);
}

populateBusinessDetails();
initializeMobileNavigation();
initializeAccordion();
initializeRevealAnimations();
initializeBackToTop();
initializeScrollFeedback();
initializeHeroParallax();
initializeCountdown();
initializeEasterEgg();
initializeGallery();

/* ═══════════════════════════════════════════════════
   CUTE UPGRADES — SKELETON IMAGE LOADERS
═══════════════════════════════════════════════════ */
function initializeSkeletonLoaders() {
  // We only do this for lazy images that may not have loaded yet
  const images = document.querySelectorAll("img[loading='lazy'], img:not([loading])");

  images.forEach((img) => {
    // Skip if the image is already complete
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add("img-revealed");
      return;
    }

    // Add skeleton to the parent wrapper
    const wrapper = img.closest(
      ".product-photo, .story-logo-wrap, .gallery-card, .footer-logo, .hero-art .photo-frame"
    );
    if (wrapper) {
      wrapper.classList.add("img-loading");
    }

    img.addEventListener("load", () => {
      if (wrapper) wrapper.classList.remove("img-loading");
      img.classList.add("img-revealed");
    });

    img.addEventListener("error", () => {
      if (wrapper) wrapper.classList.remove("img-loading");
    });
  });
}

/* ═══════════════════════════════════════════════════
   CUTE UPGRADES — SPARKLE CURSOR TRAIL
═══════════════════════════════════════════════════ */
function initializeSparkleTrail() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  // Only on desktop pointer devices
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const SYMBOLS = ["✿", "✦", "🌸", "🍯", "⭐", "💮", "✨", "🌼"];
  let lastTime = 0;
  const THROTTLE_MS = 80; // one sparkle every 80ms max

  document.addEventListener("mousemove", (e) => {
    const now = Date.now();
    if (now - lastTime < THROTTLE_MS) return;
    lastTime = now;

    const el = document.createElement("span");
    el.className = "sparkle-particle";
    el.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    el.style.left = `${e.clientX - 10}px`;
    el.style.top = `${e.clientY - 10}px`;
    el.style.fontSize = `${0.65 + Math.random() * 0.55}rem`;
    el.style.animationDuration = `${0.6 + Math.random() * 0.5}s`;
    document.body.appendChild(el);

    el.addEventListener("animationend", () => el.remove(), { once: true });
  });
}

/* ═══════════════════════════════════════════════════
   CUTE UPGRADES — AMBIENT FLOATING PETALS
═══════════════════════════════════════════════════ */
function initializeAmbientPetals() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const SYMBOLS = ["✿", "✦", "🌸", "🌼", "💮", "🌺"];
  const MAX_PETALS = 6; // keep it subtle
  let count = 0;

  function spawnPetal() {
    if (document.querySelectorAll(".ambient-petal").length >= MAX_PETALS) return;

    const el = document.createElement("span");
    el.className = "ambient-petal";
    el.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    el.style.left = `${5 + Math.random() * 90}%`;
    el.style.fontSize = `${0.75 + Math.random() * 0.9}rem`;
    const dur = 7 + Math.random() * 7;
    el.style.animationDuration = `${dur}s`;
    el.style.animationDelay = "0s";
    document.body.appendChild(el);

    el.addEventListener("animationend", () => el.remove(), { once: true });
    count++;
  }

  // Spawn first petal after a short delay, then at gentle intervals
  setTimeout(() => {
    spawnPetal();
    setInterval(spawnPetal, 3200);
  }, 2000);
}

/* ═══════════════════════════════════════════════════
   CUTE UPGRADES — BUTTON RIPPLE + HEARTS
═══════════════════════════════════════════════════ */
function initializeButtonEffects() {
  document.querySelectorAll(".button-primary").forEach((btn) => {
    // Inject heart elements
    const hearts = document.createElement("span");
    hearts.className = "btn-hearts";
    hearts.setAttribute("aria-hidden", "true");
    hearts.innerHTML = "<span>🌸</span><span>✦</span><span>🍯</span>";
    btn.style.position = "relative";
    btn.appendChild(hearts);

    // Ripple on click
    btn.addEventListener("click", (e) => {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const ripple = document.createElement("span");
      ripple.className = "button-ripple";
      ripple.style.cssText = `
        width: ${size}px; height: ${size}px;
        left: ${x}px; top: ${y}px;
        position: absolute;
      `;
      btn.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    });
  });
}

/* ═══════════════════════════════════════════════════
   CUTE UPGRADES — BOUNCY STAGGER FOR SECTION HEADINGS
═══════════════════════════════════════════════════ */
function initializeStaggeredHeadings() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const heading = entry.target;
        // Stagger each direct child
        [...heading.children].forEach((child, i) => {
          child.style.transitionDelay = `${i * 0.08}s`;
          child.style.opacity = "0";
          child.style.transform = "translateY(18px) scale(.97)";
          child.style.transition =
            "opacity .5s cubic-bezier(0.34,1.2,0.64,1), transform .5s cubic-bezier(0.34,1.2,0.64,1)";
          // Force reflow
          child.getBoundingClientRect();
          child.style.opacity = "1";
          child.style.transform = "none";
        });
        observer.unobserve(heading);
      });
    },
    { threshold: 0.2 }
  );

  document.querySelectorAll(".section-heading").forEach((h) => observer.observe(h));
}

/* ═══════════════════════════════════════════════════
   CUTE UPGRADES — GALLERY CARD TILT
═══════════════════════════════════════════════════ */
function initializeCardTilt() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  document.querySelectorAll(".gallery-card, .process-step, .store-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `
        translateY(-6px)
        rotateX(${-dy * 4}deg)
        rotateY(${dx * 4}deg)
        scale(1.01)
      `;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

/* ═══════════════════════════════════════════════════
   CUTE UPGRADES — LAUNCH PILL SPARKLE ON HOVER
═══════════════════════════════════════════════════ */
function initializeLaunchPillSparkle() {
  const pill = document.querySelector(".launch-pill");
  if (!pill) return;

  pill.addEventListener("mouseenter", () => {
    const symbols = ["✿", "✦", "🌸"];
    symbols.forEach((sym, i) => {
      setTimeout(() => {
        const el = document.createElement("span");
        el.className = "sparkle-particle";
        el.textContent = sym;
        const rect = pill.getBoundingClientRect();
        el.style.left = `${rect.left + Math.random() * rect.width}px`;
        el.style.top = `${rect.top - 8}px`;
        el.style.fontSize = "0.8rem";
        document.body.appendChild(el);
        el.addEventListener("animationend", () => el.remove(), { once: true });
      }, i * 60);
    });
  });
}

/* ═══════════════════════════════════════════════════
   CUTE UPGRADES — VALUES GRID COUNT-UP
═══════════════════════════════════════════════════ */
function initializeValuesEntrance() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const grid = document.querySelector(".values-grid");
  if (!grid) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries[0].isIntersecting) return;
      grid.querySelectorAll("div").forEach((div, i) => {
        div.style.opacity = "0";
        div.style.transform = "translateY(20px) scale(.95)";
        div.style.transition = `opacity .5s ease ${i * 0.1}s, transform .5s cubic-bezier(0.34,1.4,0.64,1) ${i * 0.1}s`;
        setTimeout(() => {
          div.style.opacity = "1";
          div.style.transform = "none";
        }, 50);
      });
      observer.unobserve(grid);
    },
    { threshold: 0.3 }
  );

  observer.observe(grid);
}

/* ═══════════════════════════════════════════════════
   CUTE UPGRADES — FAQ ANSWER CUTE BOUNCE
═══════════════════════════════════════════════════ */
function initializeFaqBounce() {
  // Patch the existing accordion to add a cute icon spin
  document.querySelectorAll(".faq-item button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const span = btn.querySelector("span");
      if (!span) return;
      span.style.transition = "transform .4s cubic-bezier(0.34,1.56,0.64,1)";
      span.style.transform = "scale(1.3) rotate(90deg)";
      setTimeout(() => {
        span.style.transform = "";
      }, 350);
    });
  });
}

/* ═══════════════════════════════════════════════════
   CUTE UPGRADES — FOOTER EMOJI WAVE
═══════════════════════════════════════════════════ */
function initializeFooterEmoji() {
  const bottom = document.querySelector(".footer-bottom");
  if (!bottom) return;
  const spans = bottom.querySelectorAll("span");
  spans.forEach((span) => {
    if (span.textContent.includes("🌸")) {
      span.style.cursor = "pointer";
      span.addEventListener("click", () => {
        // Burst of petals from footer
        for (let i = 0; i < 8; i++) {
          setTimeout(() => {
            const el = document.createElement("span");
            el.className = "sparkle-particle";
            el.textContent = ["🌸", "✿", "✦", "🌼"][Math.floor(Math.random() * 4)];
            const rect = span.getBoundingClientRect();
            el.style.left = `${rect.left + Math.random() * rect.width}px`;
            el.style.top = `${rect.top}px`;
            el.style.fontSize = `${0.8 + Math.random() * 0.6}rem`;
            el.style.animationDuration = `${0.7 + Math.random() * 0.6}s`;
            document.body.appendChild(el);
            el.addEventListener("animationend", () => el.remove(), { once: true });
          }, i * 50);
        }
      });
    }
  });
}

/* ═══════════════════════════════════════════════════
   CUTE UPGRADES — BACK-TO-TOP CONFETTI BURST
═══════════════════════════════════════════════════ */
function initializeBackToTopConfetti() {
  const btn = document.querySelector(".back-to-top");
  if (!btn) return;

  btn.addEventListener("click", () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const symbols = ["🌸", "✿", "✦", "🍯", "🌼", "💮"];
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const el = document.createElement("span");
        el.className = "sparkle-particle";
        el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        const rect = btn.getBoundingClientRect();
        el.style.left = `${rect.left + rect.width / 2 + (Math.random() - 0.5) * 40}px`;
        el.style.top = `${rect.top + rect.height / 2}px`;
        el.style.fontSize = `${0.7 + Math.random() * 0.7}rem`;
        el.style.animationDuration = `${0.6 + Math.random() * 0.7}s`;
        document.body.appendChild(el);
        el.addEventListener("animationend", () => el.remove(), { once: true });
      }, i * 40);
    }
  });
}

/* ─── Init all cute upgrades ─── */
initializeSkeletonLoaders();
initializeSparkleTrail();
initializeAmbientPetals();
initializeButtonEffects();
initializeStaggeredHeadings();
initializeCardTilt();
initializeLaunchPillSparkle();
initializeValuesEntrance();
initializeFaqBounce();
initializeFooterEmoji();
initializeBackToTopConfetti();

/* ═══════════════════════════════════════════════════
   CUTE UPGRADES — OPENING COUNTDOWN TIMER
═══════════════════════════════════════════════════ */
function initializeCountdown() {
  const visitCopy = document.querySelector(".visit-copy");
  if (!visitCopy) return;

  const openingEl = visitCopy.querySelector(".opening-date");
  if (!openingEl) return;

  const target = new Date("2027-01-01T10:00:00+08:00"); // PH time

  // Insert countdown below the opening date
  const wrap = document.createElement("div");
  wrap.className = "opening-countdown";
  wrap.setAttribute("aria-live", "polite");
  wrap.setAttribute("aria-label", "Countdown to opening");
  openingEl.after(wrap);

  const units = [
    { key: "days",    label: "Days" },
    { key: "hours",   label: "Hours" },
    { key: "mins",    label: "Mins" },
    { key: "secs",    label: "Secs" },
  ];

  // Build DOM once
  const els = {};
  units.forEach(({ key, label }) => {
    const div = document.createElement("div");
    div.className = "countdown-unit";
    div.innerHTML = `<b id="cd-${key}">--</b><small>${label}</small>`;
    wrap.appendChild(div);
    els[key] = div.querySelector("b");
  });

  function pad(n) { return String(n).padStart(2, "0"); }

  function animateTick(el, newVal) {
    if (el.textContent === newVal) return;
    el.textContent = newVal;
    el.classList.remove("tick");
    // Force reflow
    void el.offsetWidth;
    el.classList.add("tick");
  }

  function update() {
    const now = Date.now();
    const diff = target.getTime() - now;

    if (diff <= 0) {
      wrap.innerHTML = `<p class="countdown-done">🎉 We're open! Come visit us.</p>`;
      return;
    }

    const totalSecs = Math.floor(diff / 1000);
    const secs  = totalSecs % 60;
    const mins  = Math.floor(totalSecs / 60) % 60;
    const hours = Math.floor(totalSecs / 3600) % 24;
    const days  = Math.floor(totalSecs / 86400);

    animateTick(els.days,  pad(days));
    animateTick(els.hours, pad(hours));
    animateTick(els.mins,  pad(mins));
    animateTick(els.secs,  pad(secs));
  }

  update();
  setInterval(update, 1000);
}

/* ═══════════════════════════════════════════════════
   CUTE UPGRADES — GALLERY SLIDE COUNTER
═══════════════════════════════════════════════════ */
function initializeGalleryCounter() {
  const nav = document.querySelector(".gallery-nav");
  if (!nav) return;

  // Count original slides (not clones) = 6
  const totalSlides = document.querySelectorAll(".gallery-slide:not([aria-hidden])").length || 6;

  const counter = document.createElement("span");
  counter.className = "gallery-counter";
  counter.setAttribute("aria-live", "polite");
  counter.innerHTML = `<span class="cur">1</span> / ${totalSlides}`;

  // Insert between dots and next button
  const nextBtn = document.getElementById("gallery-next");
  if (nextBtn) nav.insertBefore(counter, nextBtn);

  // Update counter when dots change
  const dotsContainer = document.getElementById("gallery-dots");
  if (!dotsContainer) return;

  const dotObserver = new MutationObserver(() => {
    const activeDot = dotsContainer.querySelector(".gallery-dot.active");
    if (!activeDot) return;
    const dots = [...dotsContainer.querySelectorAll(".gallery-dot")];
    const idx = dots.indexOf(activeDot) + 1;
    counter.innerHTML = `<span class="cur">${idx}</span> / ${totalSlides}`;
  });

  dotObserver.observe(dotsContainer, {
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });
}

/* ═══════════════════════════════════════════════════
   CUTE UPGRADES — PROCESS STEP CONNECTOR ANIMATE
═══════════════════════════════════════════════════ */
function initializeProcessConnector() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const grid = document.querySelector(".process-grid");
  if (!grid) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries[0].isIntersecting) return;
      grid.classList.add("connector-animated");
      observer.unobserve(grid);
    },
    { threshold: 0.4 }
  );
  observer.observe(grid);
}

/* ═══════════════════════════════════════════════════
   CUTE UPGRADES — FLAVOR LINE PILL HOVER
═══════════════════════════════════════════════════ */
function initializeFlavorLine() {
  const flavors = document.querySelectorAll(".flavor-line span");
  flavors.forEach((span) => {
    span.style.cursor = "default";
    span.style.transition =
      "color .2s ease, transform .3s cubic-bezier(0.34,1.56,0.64,1)";
    span.addEventListener("mouseenter", () => {
      span.style.color = "var(--pink)";
      span.style.transform = "scale(1.15) translateY(-2px)";
    });
    span.addEventListener("mouseleave", () => {
      span.style.color = "";
      span.style.transform = "";
    });
  });
}

/* ═══════════════════════════════════════════════════
   CUTE UPGRADES — SOCIAL CARD CONFETTI ON CLICK
═══════════════════════════════════════════════════ */
function initializeSocialCardConfetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.querySelectorAll(".social-grid a").forEach((card) => {
    card.addEventListener("click", () => {
      const symbols = ["✿", "✦", "🌸", "🍯"];
      const rect = card.getBoundingClientRect();
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          const el = document.createElement("span");
          el.className = "sparkle-particle";
          el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
          el.style.left = `${rect.left + Math.random() * rect.width}px`;
          el.style.top = `${rect.top + rect.height / 2}px`;
          el.style.fontSize = `${0.7 + Math.random() * 0.5}rem`;
          el.style.animationDuration = `${0.6 + Math.random() * 0.5}s`;
          document.body.appendChild(el);
          el.addEventListener("animationend", () => el.remove(), { once: true });
        }, i * 45);
      }
    });
  });
}

/* ─── Init remaining cute upgrades ─── */
initializeCountdown();
initializeGalleryCounter();
initializeProcessConnector();
initializeFlavorLine();
initializeSocialCardConfetti();
