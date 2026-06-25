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
  // Header treats the homepage hero OR any [data-dark-hero] band (e.g. the
  // Team masthead) as the dark region it overlays until scrolled past.
  var darkHero = hero || document.querySelector("[data-dark-hero]");

  function updateHeader() {
    // Pages without any dark hero keep the header solid at all times.
    var scrolled = window.scrollY > 24 || !darkHero;
    header.classList.toggle("is-scrolled", scrolled);

    // Header sits on the dark band until we've scrolled past most of it
    if (darkHero) {
      var heroBottom = darkHero.offsetHeight - 90;
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

  /* ---------- Subtle hero parallax (drifting light only) ---------- */
  if (!prefersReduced && hero) {
    var light = hero.querySelector(".hero__light");
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight && light) {
          light.style.transform = "translateY(" + y * 0.12 + "px)";
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

  /* ---------- Hero crossbow: self-drafting draw-on ----------
     Traces each stroked element by animating stroke-dashoffset from its own
     length to 0; text labels reveal with a left-to-right clip-path wipe.
     Nothing fades. Plays once per load. Reduced-motion shows the finished
     drawing via CSS (.hero__crossbow opacity is 0.5 under that media query),
     so this routine simply does not run. */
  var crossbow = document.getElementById("heroCrossbow");
  if (crossbow && !prefersReduced) {
    var TARGET = 0.5; // final opacity of the whole schematic
    var seq = {
      "g-cons":   { d: 0,    t: 900 },
      "g-tiller": { d: 500,  t: 700 },
      "g-prod":   { d: 950,  t: 800 },
      "g-string": { d: 1500, t: 600 },
      "g-lash":   { d: 1550, t: 400 },
      "g-stir":   { d: 1700, t: 450 },
      "g-nut":    { d: 1900, t: 600 },
      "g-bolt":   { d: 2250, t: 750 },
      "g-call":   { d: 2700, t: 700 },
      "g-det":    { d: 2950, t: 850 },
      "g-title":  { d: 3300, t: 700 }
    };
    var traces = []; // stroked geometry — drawn by tracing the path
    var wipes = [];  // text labels — revealed by a left-to-right wipe

    Object.keys(seq).forEach(function (cls) {
      var c = seq[cls];
      crossbow.querySelectorAll("." + cls).forEach(function (g) {
        g.querySelectorAll("path,line,circle,polygon,polyline,text").forEach(function (el) {
          if (el.tagName.toLowerCase() === "text") {
            el.style.clipPath = "inset(-15% 102% -15% -2%)"; // hidden to the left
            wipes.push({ el: el, c: c });
            return;
          }
          var len = 0;
          try { len = el.getTotalLength(); } catch (e) { len = 0; }
          if (!len) return;
          el.style.strokeDasharray = len;
          el.style.strokeDashoffset = len;
          traces.push({ el: el, c: c });
        });
      });
    });

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        crossbow.style.opacity = TARGET;
        traces.forEach(function (o) {
          o.el.style.transition = "stroke-dashoffset " + o.c.t + "ms cubic-bezier(.45,0,.25,1) " + o.c.d + "ms";
          o.el.style.strokeDashoffset = "0";
        });
        wipes.forEach(function (o) {
          var dur = Math.min(o.c.t, 520);
          o.el.style.transition = "clip-path " + dur + "ms cubic-bezier(.45,0,.25,1) " + o.c.d + "ms";
          o.el.style.clipPath = "inset(-15% -2% -15% -2%)"; // fully revealed
        });
      });
    });
  }

})();
