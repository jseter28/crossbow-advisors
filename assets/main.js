/* Crossbow Capital Advisors — interactions */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Current year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Header: scrolled + on-dark state ---------- */
  var header = document.getElementById("siteHeader");
  var hero = document.getElementById("hero");

  function updateHeader() {
    // Interior pages (no dark hero) keep the header solid at all times.
    var scrolled = window.scrollY > 24 || !hero;
    header.classList.toggle("is-scrolled", scrolled);

    // Header sits on the dark hero until we've scrolled past most of it
    if (hero) {
      var heroBottom = hero.offsetHeight - 90;
      header.classList.toggle("on-dark", window.scrollY < heroBottom);
    }
  }
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");

  function setMenu(open) {
    toggle.classList.toggle("is-open", open);
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-hidden", String(!open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setMenu(!menu.classList.contains("is-open"));
    });
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) setMenu(false);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          // stagger siblings within the same group
          var delay = Number(el.dataset.delay || 0);
          el.style.transitionDelay = delay + "ms";
          el.classList.add("is-in");
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    // Apply a gentle stagger to grouped reveals
    var groups = document.querySelectorAll(".insights-grid, .firm__cols, .stats, .hero__inner");
    groups.forEach(function (group) {
      var kids = group.querySelectorAll("[data-reveal]");
      kids.forEach(function (kid, i) { kid.dataset.delay = String(Math.min(i * 70, 350)); });
    });

    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Subtle hero parallax ---------- */
  if (!prefersReduced && hero) {
    var light = hero.querySelector(".hero__light");
    var grid = hero.querySelector(".hero__grid");
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight) {
          if (light) light.style.transform = "translateY(" + y * 0.12 + "px)";
          if (grid) grid.style.transform = "translateY(" + y * 0.06 + "px)";
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Skyline band parallax ----------
     Drives .skyband::before via the --sky-shift custom property. Uses a
     transform (not background-attachment:fixed), so it works on touch screens
     too. The image layer has 20% vertical slack each side (see styles.css), and
     the shift is capped at 18% of the band height so an edge is never revealed. */
  if (!prefersReduced) {
    var bands = document.querySelectorAll(".skyband");
    if (bands.length) {
      var bandTicking = false;

      var updateBands = function () {
        var vh = window.innerHeight;
        bands.forEach(function (band) {
          var rect = band.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > vh) return; // skip offscreen bands
          var max = rect.height * 0.18;
          var center = rect.top + rect.height / 2;
          // p: +1 when the band is well below the viewport center, 0 at center, -1 above
          var p = (center - vh / 2) / (vh / 2 + rect.height / 2);
          band.style.setProperty("--sky-shift", (-p * max).toFixed(1) + "px");
        });
        bandTicking = false;
      };

      window.addEventListener("scroll", function () {
        if (bandTicking) return;
        bandTicking = true;
        requestAnimationFrame(updateBands);
      }, { passive: true });
      window.addEventListener("resize", updateBands, { passive: true });
      updateBands();
    }
  }

})();
