# Handoff — Crossbow Capital Advisors website (Graphics phase)

Paste the prompt below into a new session to continue the project. The phases after this
one are about **graphics and imagery throughout the site**.

---

## PROMPT (copy from here)

We're continuing work on the **Crossbow Capital Advisors** website — a premium, institutional
marketing site for a boutique real estate capital advisory firm in NYC. The build phase
(structure, copy, layout) is done. **This next phase is graphics: adding imagery and visual
assets across the whole site.**

### Where the code lives
- **Source of truth:** `/Users/johnseter/crossbow-advisors`
- **Mirror (keep identical):** `/Users/johnseter/Desktop/crossbow website`
- After every change: `cp -R /Users/johnseter/crossbow-advisors/. "/Users/johnseter/Desktop/crossbow website/"` then `diff -r` to confirm identical.

### Tech & conventions (don't break these)
- Static **HTML/CSS/JS, no build step**. Opens directly via `file://` in Chrome.
- Files: `index.html`, `contact.html`, `team/index.html` + 7 advisor pages, shared `assets/{styles.css,main.js,favicon.svg}`.
- Interior pages use `body class="interior"` (solid header). Scroll-reveal via IntersectionObserver (`.reveal` / `data-reveal`); everything respects `prefers-reduced-motion`.
- **Verify visually with headless Chrome screenshots** before claiming done. Note: `.reveal` starts at `opacity:0`, so for static captures inject `.reveal{opacity:1!important}`. Headless clamps innerWidth to ~500px min, so use a DOM probe (`scrollWidth <= innerWidth`) for true overflow checks rather than trusting a cropped PNG.

### Design language (match it)
- Type: **Fraunces** (serif headlines) + **Inter** (body).
- Palette: deep charcoal `#0E0F12`, warm off-white `#F4F2ED`, steel gray, subtle navy `#243352`.
- Editorial minimalism: heavy whitespace, 12-col grid, hairline borders, restrained motion.
- Aesthetic reference: elite investment bank meets architectural journal. **Quietly powerful, no hype.**

### Current state
- Homepage sections: Hero → Firm → Capabilities → Investment Focus → Approach → Philosophy → footer.
- Dedicated **Contact page** (`contact.html`): Email **Alan@crossbowadvisors.net**, Tel **404.790.6434** (also in every footer).
- **Team:** 7 Senior Advisors, each with their own bio page under `team/`.
- The site is currently **text + CSS only** — the hero is a CSS-generated light/grid composition; there are **no photographs, no headshots, no Open Graph images**.

### Graphics goals for this phase
Imagery must feel institutional and abstract — per the brand brief: **abstract architecture,
financial-district geometry, structural light/shadow. NO stock photos of smiling people.**
Likely work items (confirm priorities with me before generating en masse):
1. **Hero** — decide: keep/upgrade the CSS composition, or introduce a subtle abstract image/texture behind the headline.
2. **Section imagery** — tasteful abstract visuals or texture accents for Firm / Capabilities / Approach / Philosophy without cluttering the whitespace.
3. **Team** — headshot treatment (greyscale/duotone portrait style) with graceful placeholders until real photos arrive; define the image slot + styling now.
4. **Brand mark / favicon** — refine the crossbow logo if needed; ensure crisp at all sizes.
5. **Open Graph / social share images** — per-page `og:image` for link previews.
6. **Performance** — optimize assets (WebP, `srcset`, lazy-load, reserved space to avoid layout shift).

### How I work
- Keep the code **clean and separated** (one concern per file; additive CSS; no dead code piling up — prune when asked).
- Make a reasonable choice and proceed, but **ask before large/irreversible batches** (e.g., generating a full set of images).
- Image generation: use the **nano-banana** skill.

Start by reviewing the current site (open it / screenshot it), then propose a concrete
graphics plan with options for the hero and team treatment before producing assets.

## (end prompt)
