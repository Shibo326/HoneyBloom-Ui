const honeyBloomConfig = {
  businessName: "HoneyBloom Ice Cream",
  openingDate: "January 1, 2027",
  location: "Barangay Western Bicutan, Taguig City, Metro Manila",
  price: 70,
  priceConfirmed: false,
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

populateBusinessDetails();
initializeMobileNavigation();
initializeAccordion();
initializeRevealAnimations();
initializeBackToTop();
initializeScrollFeedback();
initializeHeroParallax();
initializeEasterEgg();
