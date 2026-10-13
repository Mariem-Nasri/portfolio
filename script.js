const menuButton = document.querySelector(".menu-toggle");
const siteNavigation = document.querySelector(".site-nav");


function closeNavigation() {
  if (!menuButton || !siteNavigation) return;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
  siteNavigation.classList.remove("is-open");
}

if (menuButton && siteNavigation) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    siteNavigation.classList.toggle("is-open", !isOpen);
  });

  siteNavigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeNavigation();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNavigation();
  });

  document.addEventListener("click", (event) => {
    if (!siteNavigation.contains(event.target) && !menuButton.contains(event.target)) closeNavigation();
  });
}

const year = document.querySelector("#current-year");
if (year) year.textContent = new Date().getFullYear();

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealItems = document.querySelectorAll(".reveal");

if (!prefersReducedMotion) {
  requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add("page-ready")));
}

if (!prefersReducedMotion && "IntersectionObserver" in window && revealItems.length) {
  document.documentElement.classList.add("motion-ready");
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });

  revealItems.forEach((item) => observer.observe(item));
}

const motionDiagrams = document.querySelectorAll(".motion-diagram");
if (!prefersReducedMotion && "IntersectionObserver" in window && motionDiagrams.length) {
  const diagramObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle("is-active", entry.isIntersecting));
  }, { threshold: 0.35 });
  motionDiagrams.forEach((diagram) => diagramObserver.observe(diagram));
}
