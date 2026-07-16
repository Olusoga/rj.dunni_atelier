const body = document.body;
const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navPanel = document.querySelector(".nav-panel");
const navLinks = document.querySelectorAll(".nav-panel a");
const pageLoader = document.querySelector(".page-loader");
const backToTop = document.querySelector(".back-to-top");
const heroVisual = document.querySelector(".hero-visual");
const heroImage = document.getElementById("hero-image");
const filterButtons = document.querySelectorAll(".filter-button");
const galleryItems = document.querySelectorAll(".gallery-item");
const lightbox = document.getElementById("lightbox");
const lightboxVisual = document.getElementById("lightbox-visual");
const lightboxTitle = document.getElementById("lightbox-title");
const lightboxDescription = document.getElementById("lightbox-description");
const lightboxBadge = document.getElementById("lightbox-badge");
const lightboxClose = document.querySelector(".lightbox-close");
const lightboxLinks = document.querySelectorAll("[data-lightbox-link]");
const slides = Array.from(document.querySelectorAll(".testimonial-card"));
const sliderDots = Array.from(document.querySelectorAll(".slider-dot"));
const sliderControls = document.querySelectorAll(".slider-control");
const counters = document.querySelectorAll("[data-counter]");
const contactForm = document.getElementById("contact-form");
const feedback = document.getElementById("form-feedback");
const currentYear = document.getElementById("current-year");

let activeSlide = 0;
let sliderIntervalId = null;

const fallbackHeroPath = "assets/hero-fallback.svg";

function toggleNavigation(forceOpen) {
  if (!navToggle || !navPanel) return;

  const isExpanded =
    typeof forceOpen === "boolean"
      ? forceOpen
      : navToggle.getAttribute("aria-expanded") !== "true";

  navToggle.setAttribute("aria-expanded", String(isExpanded));
  navPanel.classList.toggle("is-open", isExpanded);
  body.classList.toggle("nav-open", isExpanded);
}

function updateScrollState() {
  const scrollTop = window.scrollY;

  header?.classList.toggle("is-scrolled", scrollTop > 16);
  backToTop?.classList.toggle("is-visible", scrollTop > 560);

  if (heroVisual) {
    const shift = Math.min(scrollTop * 0.12, 40);
    heroVisual.style.setProperty("--hero-shift", `${shift}px`);
  }
}

function revealElements() {
  const revealNodes = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -60px 0px",
    }
  );

  revealNodes.forEach((node) => observer.observe(node));
}

function animateCounter(node) {
  const target = Number(node.dataset.counter || 0);
  const prefix = node.dataset.prefix || "";
  const suffix = node.dataset.suffix || "";
  const duration = 1400;
  const start = performance.now();

  function step(timestamp) {
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);

    node.textContent = `${prefix}${value}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

function initCounters() {
  if (!counters.length) return;

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.target.dataset.played === "true") {
          return;
        }

        entry.target.dataset.played = "true";
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.7 }
  );

  counters.forEach((counter) => {
    counter.textContent = "0";
    counterObserver.observe(counter);
  });
}

function setSlide(index) {
  if (!slides.length) return;

  activeSlide = (index + slides.length) % slides.length;

  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === activeSlide);
  });

  sliderDots.forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === activeSlide);
  });
}

function nextSlide(direction = 1) {
  setSlide(activeSlide + direction);
}

function startSlider() {
  if (slides.length < 2) return;

  clearInterval(sliderIntervalId);
  sliderIntervalId = window.setInterval(() => nextSlide(1), 5200);
}

function openLightbox(item) {
  if (!lightbox || !lightboxVisual || !lightboxTitle || !lightboxDescription || !lightboxBadge) {
    return;
  }

  const gradientClass = item.dataset.gradient;
  const badgeText = item.dataset.badge;
  const imagePath = item.dataset.image;
  const title = item.dataset.title || "Collection Preview";

  lightbox.hidden = false;
  body.classList.add("lightbox-open");
  lightboxVisual.className = imagePath
    ? "lightbox-visual"
    : `lightbox-visual ${gradientClass}`;
  lightboxVisual.innerHTML = imagePath
    ? `<img src="${imagePath}" alt="${title}"><span>${badgeText}</span>`
    : `<span>${badgeText}</span>`;
  lightboxTitle.textContent = title;
  lightboxDescription.textContent =
    item.dataset.description || "Luxury gallery preview.";
  lightboxBadge.textContent = badgeText || "Gallery Story";
  lightboxClose?.focus();
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.hidden = true;
  body.classList.remove("lightbox-open");
}

function initGalleryFilters() {
  if (!filterButtons.length || !galleryItems.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((btn) => btn.classList.toggle("is-active", btn === button));

      galleryItems.forEach((item) => {
        const isVisible =
          filter === "all" || item.dataset.category === filter;
        item.classList.toggle("is-hidden", !isVisible);
      });
    });
  });

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => openLightbox(item));
  });
}

function initLightbox() {
  if (!lightbox) return;

  lightboxClose?.addEventListener("click", closeLightbox);

  lightboxLinks.forEach((link) => {
    link.addEventListener("click", closeLightbox);
  });

  lightbox.addEventListener("click", (event) => {
    const target = event.target;
    if (
      !(target instanceof HTMLElement) ||
      target.dataset.closeLightbox !== "true"
    ) {
      return;
    }

    closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLightbox();
      toggleNavigation(false);
    }
  });

  window.addEventListener("hashchange", () => {
    if (!lightbox.hidden) {
      closeLightbox();
    }
  });
}

function initSlider() {
  if (!slides.length) return;

  setSlide(0);
  startSlider();

  sliderControls.forEach((control) => {
    control.addEventListener("click", () => {
      const direction = control.dataset.direction === "prev" ? -1 : 1;
      nextSlide(direction);
      startSlider();
    });
  });

  sliderDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      setSlide(index);
      startSlider();
    });
  });
}

function initHeroFallback() {
  if (!heroImage) return;

  heroImage.addEventListener("error", () => {
    if (heroImage.dataset.fallbackApplied === "true") return;

    heroImage.dataset.fallbackApplied = "true";
    heroImage.src = fallbackHeroPath;
    heroImage.alt =
      "Stylized couture placeholder. Replace assets/hero.jpg with the uploaded hero image.";
    heroImage.classList.add("hero-image-fallback");
  });
}

function initForm() {
  if (!contactForm || !feedback) return;

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    feedback.textContent =
      "Thank you. Your consultation request has been noted and the atelier will be in touch shortly.";
    contactForm.reset();
  });
}

function initBackToTop() {
  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function initNavigation() {
  navToggle?.addEventListener("click", () => toggleNavigation());

  navLinks.forEach((link) => {
    link.addEventListener("click", () => toggleNavigation(false));
  });
}

window.addEventListener("load", () => {
  currentYear.textContent = new Date().getFullYear();
  pageLoader?.classList.add("is-hidden");
});

window.addEventListener("scroll", updateScrollState, { passive: true });

updateScrollState();
revealElements();
initCounters();
initSlider();
initGalleryFilters();
initLightbox();
initHeroFallback();
initForm();
initBackToTop();
initNavigation();
