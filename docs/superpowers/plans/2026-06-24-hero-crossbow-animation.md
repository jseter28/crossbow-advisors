# Hero Crossbow Schematic Animation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage hero's line-grid background with a detailed patent-plate crossbow schematic that draws itself on load (a self-drafting / plotter effect).

**Architecture:** One inline SVG schematic is added to the homepage hero's `.hero__bg`, replacing the `.hero__grid` div. Styling lives in `assets/styles.css`; a small vanilla-JS routine added to the existing `assets/main.js` IIFE measures each stroked element with `getTotalLength()` and animates `stroke-dashoffset` to trace it on, while text labels reveal via a `clip-path` wipe. CSS provides the no-JS / reduced-motion static fallback.

**Tech Stack:** Static HTML5, CSS3 (custom properties, SVG masks), vanilla ES5-style JS. No build step, no dependencies, no framework.

## Global Constraints

- No build step, no dependencies, no framework. Every page opens via `file://` or any static host.
- All JS lives in the single IIFE in `assets/main.js`; ES5-style (`var`, `function`), matching existing code.
- Respect `prefers-reduced-motion: reduce` — the schematic must show its finished state with no animation.
- **Copy is unchanged.** Headline stays `Capital. Strategy. Alignment.`; one-liner stays `Strategic capital advisory for real estate sponsors and institutional investors.`
- Only the homepage (`index.html`) hero is affected. Interior pages set `<body class="interior">` and have no `#hero` — they must remain untouched.
- Schematic styling tokens: color `#dce6fb`, final `opacity: 0.5`, mask `radial-gradient(125% 118% at 58% 46%, #000 30%, transparent 88%)` (with `-webkit-mask-image`).
- The decorative SVG is `aria-hidden="true"`.
- Verification is visual (headless Chrome). For horizontal-overflow checks use a DOM probe (`document.documentElement.scrollWidth <= window.innerWidth`), never a cropped screenshot (headless clamps `innerWidth` to ~500px).

Headless Chrome invocation used throughout (macOS):

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

---

### Task 1: Place the static crossbow schematic (HTML + CSS)

Adds the SVG markup and its styling, and removes the dead grid. After this task the schematic exists and renders as a finished drawing under reduced-motion / no-JS; under normal motion it is intentionally hidden (`opacity: 0`) awaiting the Task 2 animation.

**Files:**
- Modify: `index.html:104-105` (inside `.hero__bg`)
- Modify: `assets/styles.css:360-369` (replace the `.hero__grid` rule)
- Test: visual — temporary scratch copy screenshotted with the schematic forced visible

**Interfaces:**
- Consumes: nothing.
- Produces: a hero SVG with `id="heroCrossbow"`, `class="hero__crossbow"`, and animatable group classes `g-cons`, `g-tiller`, `g-prod`, `g-string`, `g-lash`, `g-stir`, `g-nut`, `g-bolt`, `g-call`, `g-det`, `g-title` — consumed by Task 2's JS. CSS rule `.hero__crossbow` (default `opacity: 0`, reduced-motion override `opacity: .5`).

- [ ] **Step 1: Replace the grid div with the crossbow SVG in `index.html`**

In `index.html`, the hero background currently reads (lines 103-106):

```html
      <div class="hero__bg" aria-hidden="true">
        <div class="hero__light"></div>
        <div class="hero__grid"></div>
      </div>
```

Remove the `.hero__grid` line and insert the SVG so the block becomes:

```html
      <div class="hero__bg" aria-hidden="true">
        <div class="hero__light"></div>
        <svg id="heroCrossbow" class="hero__crossbow" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMid slice" fill="none" stroke-linecap="round" stroke-linejoin="round" font-family="Inter, sans-serif" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">

          <!-- construction / drafting -->
          <g class="g-cons" stroke="currentColor" stroke-opacity="0.30" stroke-width="1">
            <line x1="40" y1="380" x2="1160" y2="380"/>
            <line x1="716" y1="64" x2="716" y2="696"/>
            <line x1="92" y1="412" x2="92" y2="492"/>
            <line x1="1100" y1="392" x2="1100" y2="492"/>
            <line x1="100" y1="484" x2="1092" y2="484"/>
            <path d="M100 484 L118 477 M100 484 L118 491"/>
            <path d="M1092 484 L1074 477 M1092 484 L1074 491"/>
            <line x1="770" y1="92" x2="826" y2="92"/>
            <line x1="770" y1="668" x2="826" y2="668"/>
            <line x1="816" y1="100" x2="816" y2="660"/>
            <path d="M816 100 L809 117 M816 100 L823 117"/>
            <path d="M816 660 L809 643 M816 660 L823 643"/>
            <path d="M92 706 H212 M92 701 V711 M122 703 V709 M152 701 V711 M182 703 V709 M212 701 V711"/>
          </g>

          <!-- tiller / stock -->
          <g class="g-tiller" stroke="currentColor" stroke-opacity="0.60" stroke-width="1.3">
            <path d="M150 362 H720"/>
            <path d="M150 398 H720"/>
            <path d="M720 356 V404"/>
            <path d="M150 362 L118 350 L92 353 L92 407 L118 410 L150 398"/>
            <path d="M118 350 V410" stroke-opacity="0.4"/>
            <path d="M300 398 C 300 452 352 458 384 446 C 392 442 392 430 388 420"/>
            <path d="M250 380 H705" stroke-opacity="0.35"/>
            <path d="M560 374 H705 M560 386 H705" stroke-opacity="0.4"/>
            <path d="M168 372 C 360 369 540 369 700 372" stroke-opacity="0.25"/>
            <path d="M168 390 C 360 392 540 392 700 389" stroke-opacity="0.25"/>
          </g>

          <!-- prod / bow (double-line recurve) -->
          <g class="g-prod" stroke="currentColor" stroke-opacity="0.85" stroke-width="1.5">
            <path d="M760 98 C 694 200 682 298 714 372"/>
            <path d="M751 108 C 707 206 701 300 724 372" stroke-opacity="0.55"/>
            <path d="M760 98 C 772 90 779 99 773 110"/>
            <path d="M760 662 C 694 560 682 462 714 388"/>
            <path d="M751 652 C 707 554 701 460 724 388" stroke-opacity="0.55"/>
            <path d="M760 662 C 772 670 779 661 773 650"/>
            <path d="M755 104 C 700 202 690 300 719 372" stroke-opacity="0.3" stroke-width="1"/>
            <path d="M755 656 C 700 558 690 460 719 388" stroke-opacity="0.3" stroke-width="1"/>
            <path d="M700 358 H730 M700 402 H730 M700 358 V402 M730 358 V402" stroke-opacity="0.6"/>
          </g>

          <!-- prod-to-tiller lashing -->
          <g class="g-lash" stroke="currentColor" stroke-opacity="0.45" stroke-width="1">
            <path d="M700 360 L728 396 M700 368 L728 404 M700 376 L728 412 M698 356 L726 392 M696 384 L724 420 M704 354 L732 390"/>
          </g>

          <!-- string (double, with loops) -->
          <g class="g-string" stroke="currentColor" stroke-width="1.4">
            <path d="M760 98 L 560 380 L 760 662" stroke-opacity="0.85"/>
            <path d="M758 104 L 567 380 L 758 656" stroke-opacity="0.45" stroke-width="1"/>
            <circle cx="760" cy="98" r="4" stroke-opacity="0.7"/>
            <circle cx="760" cy="662" r="4" stroke-opacity="0.7"/>
            <path d="M548 374 L548 386 M572 374 L572 386" stroke-opacity="0.8"/>
          </g>

          <!-- trigger nut / lock -->
          <g class="g-nut" stroke="currentColor" stroke-opacity="0.9" stroke-width="1.4">
            <circle cx="560" cy="380" r="15"/>
            <path d="M560 365 A 15 15 0 0 1 573 373" stroke-opacity="0.55"/>
            <path d="M551 392 L551 404 L560 404"/>
            <circle cx="560" cy="380" r="2.3"/>
            <path d="M556 395 C 551 424 540 450 549 470"/>
            <path d="M520 452 C 516 490 588 490 584 450" stroke-opacity="0.6"/>
            <circle cx="556" cy="408" r="2" stroke-opacity="0.6"/>
          </g>

          <!-- bolt / quarrel -->
          <g class="g-bolt" stroke="currentColor" stroke-opacity="0.85" stroke-width="1.3">
            <path d="M566 376 H1066 M566 384 H1066"/>
            <path d="M560 376 H566 M560 384 H566 M557 380 H566"/>
            <path d="M580 376 L626 359 L646 361 L600 376 Z" stroke-opacity="0.7"/>
            <path d="M580 384 L626 401 L646 399 L600 384 Z" stroke-opacity="0.7"/>
            <path d="M584 380 H650" stroke-opacity="0.5"/>
            <path d="M576 374 V386 M640 376 V384" stroke-opacity="0.5"/>
            <path d="M1066 380 L1092 365 L1106 380 L1092 395 Z"/>
            <path d="M1058 376 H1066 M1058 384 H1066" stroke-opacity="0.6"/>
            <path d="M1079 372 V388" stroke-opacity="0.6"/>
          </g>

          <!-- stirrup (foot loop) -->
          <g class="g-stir" stroke="currentColor" stroke-opacity="0.55" stroke-width="1.3">
            <path d="M720 366 C 754 358 776 370 776 380 C 776 390 754 402 720 394"/>
            <path d="M724 372 C 750 366 768 374 768 380 C 768 386 750 394 724 388" stroke-opacity="0.4"/>
          </g>

          <!-- callouts -->
          <g class="g-call" stroke="currentColor" stroke-opacity="0.4" stroke-width="1" fill="none">
            <circle cx="852" cy="148" r="12"/><line x1="843" y1="156" x2="744" y2="190"/>
            <circle cx="648" cy="150" r="12"/><line x1="657" y1="158" x2="700" y2="210"/>
            <circle cx="452" cy="476" r="12"/><line x1="461" y1="468" x2="552" y2="396"/>
            <circle cx="958" cy="306" r="12"/><line x1="950" y1="314" x2="980" y2="382"/>
            <circle cx="300" cy="476" r="12"/><line x1="300" y1="464" x2="300" y2="400"/>
          </g>
          <g class="g-call" fill="currentColor" fill-opacity="0.55" stroke="none" font-size="13" text-anchor="middle">
            <text x="852" y="153">1</text>
            <text x="648" y="155">2</text>
            <text x="452" y="481">3</text>
            <text x="958" y="311">4</text>
            <text x="300" y="481">5</text>
          </g>

          <!-- detail magnifier (lock, 3:1) -->
          <g class="g-det" stroke="currentColor" stroke-opacity="0.4" stroke-width="1">
            <circle cx="560" cy="380" r="26"/>
            <line x1="582" y1="394" x2="922" y2="556"/>
          </g>
          <g class="g-det" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.3">
            <circle cx="1000" cy="588" r="92" stroke-opacity="0.45"/>
            <circle cx="990" cy="576" r="44"/>
            <path d="M990 532 A 44 44 0 0 1 1028 555" stroke-opacity="0.5"/>
            <path d="M964 612 L964 648 L990 648"/>
            <circle cx="990" cy="576" r="5"/>
            <path d="M978 620 C 968 660 944 700 962 736" stroke-opacity="0.8"/>
            <path d="M1006 564 L1066 540" stroke-opacity="0.5"/>
            <path d="M978 540 L1002 540" stroke-opacity="0.5"/>
          </g>
          <g class="g-det" fill="currentColor" fill-opacity="0.5" stroke="none" font-size="12" letter-spacing="1.5" text-anchor="middle">
            <text x="1000" y="700">DETAIL A · 3:1</text>
          </g>

          <!-- title block -->
          <g class="g-title" fill="currentColor" fill-opacity="0.5" stroke="none" text-anchor="end">
            <text x="1150" y="716" font-size="13" letter-spacing="3">FIG. 1 — CROSSBOW · PLAN VIEW</text>
          </g>
        </svg>
      </div>
```

- [ ] **Step 2: Replace the `.hero__grid` CSS rule in `assets/styles.css`**

The current rule (lines 360-369) is:

```css
/* architectural line grid */
.hero__grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px);
  background-size: clamp(80px, 9vw, 140px) clamp(80px, 9vw, 140px);
  mask-image: radial-gradient(120% 120% at 60% 40%, #000 35%, transparent 85%);
  -webkit-mask-image: radial-gradient(120% 120% at 60% 40%, #000 35%, transparent 85%);
}
```

Replace it entirely with:

```css
/* crossbow schematic — drawn on by main.js (self-drafting effect) */
.hero__crossbow {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  color: #dce6fb;
  opacity: 0;                 /* revealed by the draw-on; final target 0.5 */
  -webkit-mask-image: radial-gradient(125% 118% at 58% 46%, #000 30%, transparent 88%);
  mask-image: radial-gradient(125% 118% at 58% 46%, #000 30%, transparent 88%);
}
/* no JS / reduced motion: show the finished drawing, no animation */
@media (prefers-reduced-motion: reduce) {
  .hero__crossbow { opacity: 0.5; }
}
```

- [ ] **Step 3: Verify the schematic renders correctly (forced visible)**

The default `opacity: 0` keeps it hidden under normal motion until Task 2, so verify against a scratch copy with the schematic forced visible:

```bash
cd /Users/johnseter/Desktop/Odin/crossbow-advisors
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
S="$(pwd)/.scratch-hero1.html"
sed 's#class="hero__crossbow"#class="hero__crossbow" style="opacity:.5"#' index.html > "$S"
"$CHROME" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1440,900 --screenshot="/tmp/hero1.png" "file://$S"
rm -f "$S"
open /tmp/hero1.png
```

Expected: the full crossbow schematic (prod, tiller, string, lock, bolt, callouts ①–⑤, DETAIL A, FIG. 1) renders faintly behind the unchanged headline `Capital. Strategy. Alignment.`

- [ ] **Step 4: Verify no horizontal overflow (DOM probe, not screenshot)**

```bash
cd /Users/johnseter/Desktop/Odin/crossbow-advisors
python3 -m http.server 8123 >/dev/null 2>&1 &
SRV=$!; sleep 1
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu \
  --window-size=1440,900 --dump-dom "http://localhost:8123/index.html" >/dev/null
kill $SRV
echo "Manually confirm in a real browser at http://localhost:8123/ that the page has no horizontal scrollbar; the SVG is clipped by .hero overflow:hidden and must not widen the document."
```

Expected: the SVG sits inside `.hero` (which is `overflow: hidden`); document width is unchanged. If a real-browser check is available, confirm `document.documentElement.scrollWidth <= window.innerWidth` returns `true`.

- [ ] **Step 5: Commit**

```bash
cd /Users/johnseter/Desktop/Odin/crossbow-advisors
git add index.html assets/styles.css
git commit -m "$(printf 'Add static hero crossbow schematic, replace line grid\n\nInline SVG patent-plate crossbow in the homepage hero .hero__bg, replacing\n.hero__grid. Hidden by default (opacity:0) pending the draw-on; reduced-motion\nshows the finished drawing.\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

### Task 2: Draw-on animation + parallax cleanup (`main.js`)

Adds the self-drafting routine and removes the now-dead grid parallax reference.

**Files:**
- Modify: `assets/main.js:85-102` (hero parallax block — drop the grid reference)
- Modify: `assets/main.js` (append the draw-on routine before the IIFE's closing `})();` on line 138)

**Interfaces:**
- Consumes: `#heroCrossbow` and its `g-*` group classes (Task 1); the `prefersReduced` boolean already defined at `main.js:5`.
- Produces: no exported symbols (self-contained side effect on load).

- [ ] **Step 1: Remove the dead grid parallax reference**

The hero parallax block (lines 85-102) currently is:

```js
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
```

Replace it with (drops `grid`; the schematic is not parallaxed, to avoid transforms fighting the draw-on):

```js
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
```

- [ ] **Step 2: Append the draw-on routine before the IIFE close**

Insert this block immediately before the final `})();` (currently line 138):

```js
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
      "g-cons":   { d: 0,    t: 600 },
      "g-tiller": { d: 320,  t: 480 },
      "g-prod":   { d: 620,  t: 540 },
      "g-string": { d: 980,  t: 420 },
      "g-lash":   { d: 1010, t: 300 },
      "g-stir":   { d: 1120, t: 320 },
      "g-nut":    { d: 1240, t: 420 },
      "g-bolt":   { d: 1480, t: 520 },
      "g-call":   { d: 1780, t: 460 },
      "g-det":    { d: 1950, t: 520 },
      "g-title":  { d: 2200, t: 420 }
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
```

- [ ] **Step 3: Verify the draw-on sequence (deterministic frames via virtual time)**

```bash
cd /Users/johnseter/Desktop/Odin/crossbow-advisors
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
python3 -m http.server 8123 >/dev/null 2>&1 &
SRV=$!; sleep 1
for ms in 700 1500 2700; do
  "$CHROME" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --window-size=1440,900 --virtual-time-budget=$ms \
    --screenshot="/tmp/draw-$ms.png" "http://localhost:8123/index.html"
done
kill $SRV
open /tmp/draw-700.png /tmp/draw-1500.png /tmp/draw-2700.png
```

Expected progression: ~700ms construction + tiller drawing; ~1500ms prod + string + bolt extending; ~2700ms complete drawing including the wiped-on numbers, DETAIL A, and FIG. 1 — settled at the same finished image as Task 1 Step 3. (Total runtime ~2.6s.)

- [ ] **Step 4: Verify reduced-motion + interior pages are unaffected (code + visual)**

```bash
cd /Users/johnseter/Desktop/Odin/crossbow-advisors
# reduced-motion fallback is pure CSS + a JS guard — confirm both exist:
grep -n "prefers-reduced-motion" assets/styles.css
grep -n "crossbow && !prefersReduced" assets/main.js
# interior page has no #hero / #heroCrossbow, so the routine is skipped:
grep -c "heroCrossbow" team/index.html contact.html
```

Expected: the CSS media rule and the JS guard both print a match (so reduced-motion users get the static drawing and the animation never runs for them); `grep -c` prints `0` for both interior pages (routine skipped, pages untouched).

- [ ] **Step 5: Commit**

```bash
cd /Users/johnseter/Desktop/Odin/crossbow-advisors
git add assets/main.js
git commit -m "$(printf 'Add hero crossbow self-drafting draw-on animation\n\nTraces each stroked element via stroke-dashoffset and wipes text labels on;\nnothing fades. Plays once per load, reuses the existing prefersReduced guard,\nand drops the now-dead .hero__grid parallax reference.\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>')"
```

---

## Self-Review

**Spec coverage:**
- Replace grid with crossbow schematic → Task 1 Steps 1-2. ✓
- Full linework (prod, tiller, string, lock, bolt, stirrup, lashing, callouts, dimensions, scale bar, DETAIL A, FIG. 1) → Task 1 Step 1 SVG (verbatim from approved `scratchpad/cb.svg`). ✓
- Styling tokens (color `#dce6fb`, opacity `0.5`, mask `125% 118% at 58% 46% / #000 30% / 88%`) → Task 1 Step 2. ✓
- Copy unchanged → headline/lede are not touched by any step; verified visually in Task 1 Step 3. ✓
- Everything draws, nothing fades (pen-trace + text wipe) → Task 2 Step 2. ✓
- Sequence/timings table → Task 2 Step 2 `seq` object matches the spec table exactly. ✓
- Plays once per load → no scroll re-trigger; runs once in the IIFE. ✓
- Reduced-motion safe → CSS media override (Task 1 Step 2) + JS guard reusing `prefersReduced` (Task 2 Step 2). ✓
- No flash of finished drawing → CSS default `opacity: 0` + JS sets draw-state before revealing (deferred script + double-rAF). ✓
- Interior pages untouched → verified Task 2 Step 4. ✓
- Three files only (`index.html`, `assets/styles.css`, `assets/main.js`) → matches. ✓

**Placeholder scan:** No TBD/TODO; all SVG and JS shown in full; commands have expected output. ✓

**Type/name consistency:** `id="heroCrossbow"` and group classes `g-cons/g-tiller/g-prod/g-string/g-lash/g-stir/g-nut/g-bolt/g-call/g-det/g-title` are identical between the Task 1 SVG and the Task 2 `seq` keys / selectors. `prefersReduced` matches the existing `main.js:5` variable. ✓
