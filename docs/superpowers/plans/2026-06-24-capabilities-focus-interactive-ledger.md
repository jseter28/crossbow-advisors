# Capabilities & Focus — Interactive Ledger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage `#capabilities` section with a consolidated, interactive "ledger" — 4 capabilities that reveal a description on hover (desktop) / tap (mobile), plus a 5-tag Investment Focus strip.

**Architecture:** Native `<details>`/`<summary>` rows give a click/tap/keyboard accordion that works with no JavaScript. CSS styles the rows on-brand and animates the reveal. A small enhancement in the existing `main.js` IIFE adds desktop hover-open/close and single-open behavior on hover-capable devices.

**Tech Stack:** Static HTML + CSS (custom properties already defined in `assets/styles.css`) + vanilla JS (one IIFE in `assets/main.js`). No build, no dependencies, no test framework.

## Global Constraints

- **No new dependencies, no build step.** Plain `.html` / `.css` / `.js` edited in place.
- **Palette is fixed:** use only existing tokens (`--ink`, `--paper`, `--paper-2`, `--steel`, `--steel-dk`, `--line`, `--navy`, `--navy-soft`, `--serif`, `--ease`, `--muted`). **No new color hues.**
- **Accessibility / graceful degradation (project rule):** must work with JS disabled; keyboard-operable; respects `prefers-reduced-motion`.
- **Keep `id="capabilities"`** on the section (the header nav links to `index.html#capabilities`).
- **No test suite exists.** Verify visually with headless Chrome per `CLAUDE.md`:
  - Inject `.reveal{opacity:1!important}` (or set reveal elements visible) for static shots, or scroll-reveal elements render invisible.
  - Headless Chrome clamps `innerWidth` to ~500px, so a cropped PNG lies about overflow — use a DOM probe (`documentElement.scrollWidth <= innerWidth`) for true overflow checks.
  - Screenshot command:
    ```bash
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
      --headless --disable-gpu --hide-scrollbars --window-size=1440,2400 \
      --screenshot=out.png "file://$PWD/index.html"
    ```
- **Content is final (from the approved spec).** Capability titles/descriptions and the 5 focus tags are copied verbatim in Task 1 — do not paraphrase.
- **Branch:** work on the current `firstedits` branch (not `main`). Commit per task.

---

## File Structure

| File | Change | Responsibility |
|------|--------|----------------|
| `index.html` | Modify (replace lines 186–245) | The section markup: 4 `<details>` capability rows + Investment Focus tag list. |
| `assets/styles.css` | Modify (replace ~lines 434–531) | Remove dead `.work-grid/.cap-grid/.focus-grid` rules; add `.ledger/.cap-row/.focus-tags` styles. |
| `assets/main.js` | Modify (line 73 + insert ~line 81) | Swap stagger group `.cap-grid`→`.ledger`; add hover-reveal + single-open enhancement. |

Tasks must be done **in order** (1 → 2 → 3 → 4): markup defines the class names CSS and JS target; CSS makes it on-brand; JS adds the desktop enhancement; Task 4 is the integration gate.

---

## Task 1: Replace section markup with the interactive ledger

**Files:**
- Modify: `index.html` (replace the block currently at lines 186–245)

**Interfaces:**
- Produces (the contract Tasks 2 & 3 depend on):
  - Section `<section class="section section--work" id="capabilities">` (unchanged hooks).
  - Container `.ledger` holding four `<details class="cap-row" data-reveal>` elements, each with `<summary class="cap-row__summary">` containing `.cap-row__num`, `.cap-row__title`, `.cap-row__icon`, followed by `<div class="cap-row__detail"><p>…</p></div>`.
  - `.focus` block with `.focus-label` and `<ul class="focus-tags"><li>…</li></ul>` (5 items).

- [ ] **Step 1: Establish the current state (the "failing" check)**

Run:
```bash
cd /Users/johnseter/Desktop/Odin/crossbow-advisors
grep -c "cap-row" index.html; grep -c "focus-cell" index.html
```
Expected: `0` then `7` — i.e. the new markup is absent and the old focus cells are still present. This confirms you're starting from the un-migrated state.

- [ ] **Step 2: Replace the markup**

In `index.html`, replace the entire block from the comment `<!-- ============ CAPABILITIES & FOCUS ============ -->` through its closing `</section>` (currently lines 186–245) with exactly:

```html
    <!-- ============ CAPABILITIES & FOCUS ============ -->
    <section class="section section--work" id="capabilities">
      <div class="container">
        <div class="section__head reveal" data-reveal>
          <span class="index">02</span>
          <h2 class="section__title">Capabilities &amp; Focus</h2>
        </div>

        <div class="ledger">
          <details class="cap-row reveal" data-reveal>
            <summary class="cap-row__summary">
              <span class="cap-row__num">i</span>
              <span class="cap-row__title">Capital Formation</span>
              <span class="cap-row__icon" aria-hidden="true"></span>
            </summary>
            <div class="cap-row__detail">
              <p>Equity and debt raised and structured across the full capital stack.</p>
            </div>
          </details>

          <details class="cap-row reveal" data-reveal>
            <summary class="cap-row__summary">
              <span class="cap-row__num">ii</span>
              <span class="cap-row__title">Advisory &amp; Alignment</span>
              <span class="cap-row__icon" aria-hidden="true"></span>
            </summary>
            <div class="cap-row__detail">
              <p>GP/LP advisory, joint-venture structuring, and governance that align sponsors with the right capital partners.</p>
            </div>
          </details>

          <details class="cap-row reveal" data-reveal>
            <summary class="cap-row__summary">
              <span class="cap-row__num">iii</span>
              <span class="cap-row__title">Structured Finance &amp; Credit</span>
              <span class="cap-row__icon" aria-hidden="true"></span>
            </summary>
            <div class="cap-row__detail">
              <p>Bespoke credit, recapitalizations, and structured solutions tailored to asset and platform needs.</p>
            </div>
          </details>

          <details class="cap-row reveal" data-reveal>
            <summary class="cap-row__summary">
              <span class="cap-row__num">iv</span>
              <span class="cap-row__title">Platform Capital Strategy</span>
              <span class="cap-row__icon" aria-hidden="true"></span>
            </summary>
            <div class="cap-row__detail">
              <p>Programmatic, platform-level capital architecture designed to scale an institution over time.</p>
            </div>
          </details>
        </div>

        <div class="focus reveal" data-reveal>
          <p class="focus-label">Investment Focus</p>
          <ul class="focus-tags">
            <li>Multifamily &amp; SFR platforms</li>
            <li>Commercial development &amp; mixed-use</li>
            <li>CRE credit &amp; structured products</li>
            <li>Distressed &amp; special situations</li>
            <li>Strategic partnerships &amp; M&amp;A</li>
          </ul>
        </div>
      </div>
    </section>
```

- [ ] **Step 3: Verify the swap (the "passing" check)**

Run:
```bash
grep -c "cap-row" index.html; grep -c "focus-cell" index.html; grep -c 'id="capabilities"' index.html
```
Expected: `9` (4 rows × `cap-row` on `<details>` + 4 `cap-row__summary`/etc. — any value ≥ 8), `0` (old focus cells gone), `1` (anchor preserved).

- [ ] **Step 4: Confirm native accordion works without CSS/JS yet**

Run:
```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --hide-scrollbars --window-size=1440,2400 \
  --screenshot=/tmp/cap-task1.png "file://$PWD/index.html"
```
Open `/tmp/cap-task1.png`. Expected: the four capability titles (Capital Formation, Advisory & Alignment, Structured Finance & Credit, Platform Capital Strategy) and the Investment Focus list are visible as plain text (default `<details>` triangles may show — that's fine; CSS comes in Task 2). The page is not broken.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: replace Capabilities & Focus with interactive ledger markup"
```

---

## Task 2: Style the ledger (remove dead CSS, add new rules)

**Files:**
- Modify: `assets/styles.css` (replace the "CAPABILITIES & FOCUS (combined two-column section)" block, currently ~lines 434–531, ending where the "SKYLINE BAND" block begins)

**Interfaces:**
- Consumes: the class names produced by Task 1 (`.ledger`, `.cap-row`, `.cap-row__summary`, `.cap-row__num`, `.cap-row__title`, `.cap-row__icon`, `.cap-row__detail`, `.focus`, `.focus-label`, `.focus-tags`).
- Produces: `.cap-row[open]` open-state styling that Task 3's JS toggles via the `open` property.

- [ ] **Step 1: Confirm the dead rules are present (the "failing" check)**

Run:
```bash
grep -n "\.work-grid\|\.cap-grid\|\.focus-cell\|\.focus-grid\|\.cap {" assets/styles.css
```
Expected: several matches in the ~434–531 range. These are the rules to remove.

- [ ] **Step 2: Remove the dead block and add the new styles**

In `assets/styles.css`, delete the entire block under the header comment
`/* ===… CAPABILITIES & FOCUS (combined two-column section) ===… */`
up to (but not including) the next header comment `/* ===… SKYLINE BAND …===*/`.
Removed selectors: `.work-grid`, `.work-col__label`, `.work-grid` media query, `.cap-grid`, `.cap`, `.cap:hover`, `.cap__num`, `.cap h3`, `.cap p`, `.focus-grid`, `.focus-cell`, `.focus-cell:hover`, `.focus-cell__n`, `.focus-cell h3`.
(Note: `.section--work` has **no** CSS rule — nothing to remove for it; the markup keeps the class as a hook.)

Replace that removed block with exactly:

```css
/* ============================================================
   CAPABILITIES & FOCUS — interactive ledger
   ============================================================ */
.ledger {
  margin-top: clamp(2.5rem, 5vw, 4rem);
  border-top: 1px solid var(--line);
}
.cap-row { border-bottom: 1px solid var(--line); }

/* Summary row (the always-visible part) */
.cap-row__summary {
  display: grid;
  grid-template-columns: clamp(2.5rem, 5vw, 4rem) 1fr auto;
  align-items: center;
  gap: clamp(0.75rem, 2vw, 1.5rem);
  padding: clamp(1.4rem, 3vw, 2rem) 0.25rem;
  cursor: pointer;
  list-style: none;                       /* remove default disclosure triangle */
  transition: background 0.4s var(--ease);
}
.cap-row__summary::-webkit-details-marker { display: none; }
.cap-row__summary:focus-visible { outline: 2px solid var(--navy); outline-offset: 3px; }
.cap-row[open] > .cap-row__summary,
.cap-row__summary:hover { background: var(--paper-2); }

.cap-row__num {
  font-family: var(--serif);
  font-style: italic;
  font-size: 0.95rem;
  color: var(--steel);
}
.cap-row__title {
  font-family: var(--serif);
  font-weight: 380;
  font-size: clamp(1.3rem, 2.4vw, 1.9rem);
  line-height: 1.12;
  letter-spacing: -0.01em;
}

/* "+" affordance drawn in CSS; rotates to "×" when open */
.cap-row__icon {
  position: relative;
  width: 18px; height: 18px;
  flex: none;
  color: var(--steel);
  transition: color 0.3s var(--ease), transform 0.3s var(--ease);
}
.cap-row__icon::before,
.cap-row__icon::after {
  content: "";
  position: absolute;
  background: currentColor;
}
.cap-row__icon::before { top: 8.25px; left: 0; width: 18px; height: 1.5px; }   /* horizontal bar */
.cap-row__icon::after  { left: 8.25px; top: 0; width: 1.5px; height: 18px; }   /* vertical bar */
.cap-row[open] > .cap-row__summary .cap-row__icon {
  color: var(--navy);
  transform: rotate(45deg);
}

/* Revealed detail — collapsed via grid-rows; animates open. */
.cap-row__detail {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.45s var(--ease);
}
.cap-row[open] > .cap-row__detail { grid-template-rows: 1fr; }
.cap-row__detail > p {
  min-height: 0;
  overflow: hidden;
  padding-left: clamp(2.5rem, 5vw, 4rem);
  color: var(--muted);
  font-size: 1rem;
  max-width: 60ch;
}
.cap-row[open] > .cap-row__detail > p { padding-bottom: clamp(1.2rem, 2.5vw, 1.75rem); }

/* Investment Focus tag strip */
.focus { margin-top: clamp(2.5rem, 5vw, 3.5rem); }
.focus-label {
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--steel-dk);
  margin-bottom: 1.25rem;
}
.focus-tags { display: flex; flex-wrap: wrap; gap: 0.6rem 0.7rem; }
.focus-tags li {
  font-size: 0.86rem;
  color: var(--steel-dk);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0.5rem 1.1rem;
  transition: background 0.3s var(--ease), color 0.3s var(--ease), border-color 0.3s var(--ease);
}
.focus-tags li:hover {
  background: var(--navy);
  color: var(--paper);
  border-color: var(--navy);
}
```

- [ ] **Step 3: Verify dead rules are gone**

Run:
```bash
grep -c "\.cap-grid\|\.focus-cell\|\.focus-grid\|\.work-grid" assets/styles.css
```
Expected: `0`.

- [ ] **Step 4: Visual check — default (closed) state**

Create a temp copy with reveals forced visible, screenshot the section, and clean up:
```bash
INJ='<style>.reveal{opacity:1!important;transform:none!important}.hero__light{animation:none}</style>'
perl -pe "s{</head>}{$INJ</head>}" index.html > _shot.html
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --hide-scrollbars --window-size=1440,2600 \
  --screenshot=/tmp/cap-task2-closed.png "file://$PWD/_shot.html"
rm -f _shot.html
```
Open `/tmp/cap-task2-closed.png`. Expected: four hairline-separated rows, each with an italic roman numeral, a serif title, and a thin "+" at the right; below them an "INVESTMENT FOCUS" label and 5 pill tags. On-brand (paper background, ink text, hairlines). No default triangles.

- [ ] **Step 5: Visual check — open state**

Force the second row open and screenshot:
```bash
INJ='<style>.reveal{opacity:1!important;transform:none!important}.hero__light{animation:none}</style>'
perl -pe "s{</head>}{$INJ</head>}" index.html \
  | perl -0pe 's{(<details class="cap-row reveal" data-reveal>\s*<summary class="cap-row__summary">\s*<span class="cap-row__num">ii)}{<details class="cap-row reveal" data-reveal open>\n            <summary class="cap-row__summary">\n              <span class="cap-row__num">ii}s' \
  > _shot.html
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --hide-scrollbars --window-size=1440,2600 \
  --screenshot=/tmp/cap-task2-open.png "file://$PWD/_shot.html"
rm -f _shot.html
```
Open `/tmp/cap-task2-open.png`. Expected: the "Advisory & Alignment" row shows its description indented beneath the title, the row has a subtle `--paper-2` background, and its icon is navy and rotated to an "×". (If the perl open-injection doesn't match, instead manually add `open` to the second `<details>` in a scratch copy and screenshot — the goal is to confirm the open-state styling.)

- [ ] **Step 6: Horizontal-overflow probe (desktop + mobile)**

```bash
PROBE='<script>addEventListener("load",function(){var d=document.documentElement;document.title="PROBE "+d.scrollWidth+" x "+window.innerWidth;});</script>'
perl -pe "s{</head>}{$PROBE</head>}" index.html > _probe.html
for w in 390 1440; do
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    --headless --disable-gpu --window-size=$w,1400 --virtual-time-budget=2000 \
    --dump-dom "file://$PWD/_probe.html" 2>/dev/null | grep -o 'PROBE [0-9]* x [0-9]*' | head -1
done
rm -f _probe.html
```
Expected: each line shows two equal numbers (e.g. `PROBE 500 x 500`, `PROBE 1440 x 1440`) — `scrollWidth == innerWidth`, no horizontal overflow. (Recall headless clamps `innerWidth` to ~500 at narrow widths; equality is what matters.)

- [ ] **Step 7: Commit**

```bash
git add assets/styles.css
git commit -m "style: ledger styling for Capabilities & Focus; remove dead grid rules"
```

---

## Task 3: Add desktop hover-reveal + single-open enhancement

**Files:**
- Modify: `assets/main.js` (update the stagger group list on line 73; insert a new block after the reveal-on-scroll section, ~after line 80)

**Interfaces:**
- Consumes: `.ledger` and `.cap-row` (`<details>`) elements from Task 1; `prefersReduced` variable already defined at `main.js:5`.
- Produces: no exports; attaches event listeners only.

- [ ] **Step 1: Confirm the stale stagger reference (the "failing" check)**

Run:
```bash
grep -n "cap-grid" assets/main.js
```
Expected: one match on line ~73 (`var groups = document.querySelectorAll(".cap-grid, …")`). This selector no longer exists in the DOM after Task 1, so the ledger currently gets no staggered reveal.

- [ ] **Step 2: Point the stagger group at the new ledger**

In `assets/main.js` line ~73, change the group selector string from:
```js
    var groups = document.querySelectorAll(".cap-grid, .focus-list, .approach-grid, .insights-grid, .philosophy__points, .firm__cols, .stats, .hero__inner");
```
to (replace `.cap-grid` with `.ledger`):
```js
    var groups = document.querySelectorAll(".ledger, .insights-grid, .firm__cols, .stats, .hero__inner");
```
(Dropped `.focus-list`, `.approach-grid`, `.philosophy__points` — those selectors match nothing in the current site.)

- [ ] **Step 3: Insert the ledger enhancement block**

In `assets/main.js`, immediately **after** the reveal-on-scroll block (after the closing `}` of the `else` at line ~80, before the `/* ---------- Subtle hero parallax ---------- */` comment), insert:

```js
  /* ---------- Capabilities ledger: hover-reveal + single-open ---------- */
  var ledger = document.querySelector(".ledger");
  if (ledger) {
    var rows = Array.prototype.slice.call(ledger.querySelectorAll(".cap-row"));

    // One row open at a time (applies to click/tap/keyboard and hover alike).
    rows.forEach(function (row) {
      row.addEventListener("toggle", function () {
        if (row.open) {
          rows.forEach(function (other) {
            if (other !== row) other.open = false;
          });
        }
      });
    });

    // Desktop hover reveal — only on hover-capable, fine-pointer devices.
    var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (finePointer.matches) {
      rows.forEach(function (row) {
        row.addEventListener("mouseenter", function () { row.open = true; });
        row.addEventListener("mouseleave", function () { row.open = false; });
        var summary = row.querySelector(".cap-row__summary");
        if (summary) {
          // Block mouse-click toggling (hover already controls open state),
          // but preserve keyboard toggling (Enter/Space fire click with detail 0).
          summary.addEventListener("click", function (e) {
            if (e.detail !== 0) e.preventDefault();
          });
        }
      });
    }
  }
```

- [ ] **Step 4: Syntax check**

Run:
```bash
node --check assets/main.js && echo "JS OK"
```
Expected: `JS OK` (no syntax errors). If `node` is unavailable, run `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --dump-dom "file://$PWD/index.html" >/dev/null 2>&1 && echo loaded` and confirm no console errors by loading the page in a real browser.

- [ ] **Step 5: Behavior check in a real browser**

Start the local server and open the homepage:
```bash
python3 -m http.server 8000 --bind 127.0.0.1   # if not already running
```
Visit `http://127.0.0.1:8000/#capabilities`. Verify:
1. **Desktop hover:** hovering a capability row opens it (description slides in); moving to another row closes the first and opens the second (single-open).
2. **Keyboard:** `Tab` to a row's summary, press `Enter` — it opens; arrowing/tabbing and Enter on another closes the first.
3. **Reduced motion:** with OS "reduce motion" on, the reveal is instant (no slide) but still functions.

- [ ] **Step 6: Commit**

```bash
git add assets/main.js
git commit -m "feat: hover-reveal + single-open for Capabilities ledger"
```

---

## Task 4: Integration verification & cleanup gate

**Files:**
- Possibly modify: any file where a stray reference to a removed class remains (only if found).

**Interfaces:**
- Consumes: the completed work of Tasks 1–3.

- [ ] **Step 1: Repo-wide check for dangling references to removed classes**

Run:
```bash
cd /Users/johnseter/Desktop/Odin/crossbow-advisors
grep -rn "cap-grid\|focus-cell\|focus-grid\|work-grid\|work-col" --include="*.html" --include="*.css" --include="*.js" .
```
Expected: **no output**. If anything appears (other than inside `docs/`), it's a leftover — remove or update it, then re-run until clean.

- [ ] **Step 2: Confirm `<details>` works with JavaScript disabled (graceful degradation)**

Create a JS-stripped copy and screenshot with the second row open via the `open` attribute:
```bash
perl -0pe 's{<script src="assets/main\.js"[^>]*>\s*</script>}{}s' index.html > _nojs.html
# open the first row to prove native expansion works without JS
perl -0pe 's{<details class="cap-row reveal" data-reveal>}{<details class="cap-row reveal" data-reveal open>}' _nojs.html > _nojs2.html
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --hide-scrollbars --window-size=1440,2600 \
  --screenshot=/tmp/cap-task4-nojs.png "file://$PWD/_nojs2.html"
rm -f _nojs.html _nojs2.html
```
Open `/tmp/cap-task4-nojs.png`. Expected: even without `main.js`, the first row shows its description (native `<details open>` works). This proves the no-JS path.

- [ ] **Step 3: Final desktop + mobile screenshots**

```bash
INJ='<style>.reveal{opacity:1!important;transform:none!important}.hero__light{animation:none}</style>'
perl -pe "s{</head>}{$INJ</head>}" index.html > _shot.html
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --hide-scrollbars --window-size=1440,2600 --screenshot=/tmp/cap-final-desktop.png "file://$PWD/_shot.html"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --hide-scrollbars --window-size=500,2400 --screenshot=/tmp/cap-final-mobile.png "file://$PWD/_shot.html"
rm -f _shot.html
```
Open both. Expected: section reads cleanly at both widths; the ledger rows and focus tags stack/wrap without clipping; spacing matches the rest of the page's editorial rhythm.

- [ ] **Step 4: Final commit (only if Step 1 required edits)**

```bash
git add -A
git commit -m "chore: remove dangling references to old Capabilities classes"
```
If Step 1 produced no output and no other file changed, skip this commit — the feature is complete.

---

## Self-Review (completed during plan authoring)

- **Spec coverage:** content consolidation → Task 1 (verbatim copy); ledger layout/markup → Task 1; on-brand styling + dead-CSS removal → Task 2; hover/tap/keyboard/no-JS/reduced-motion interaction → Tasks 1 (native) + 3 (enhancement); `#capabilities` anchor preserved → Task 1 Step 3; headless-Chrome verification incl. overflow probe → Tasks 2 & 4. All spec sections mapped.
- **Placeholders:** none — every code step contains complete HTML/CSS/JS and exact commands with expected output.
- **Type/name consistency:** class names (`.ledger`, `.cap-row`, `.cap-row__summary`, `.cap-row__num`, `.cap-row__title`, `.cap-row__icon`, `.cap-row__detail`, `.focus`, `.focus-label`, `.focus-tags`) are identical across Tasks 1–3; the JS targets `.ledger`/`.cap-row` exactly as produced by Task 1; `prefersReduced` reuse matches `main.js:5`.
