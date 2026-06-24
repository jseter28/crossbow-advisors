# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The marketing site for **Crossbow Capital Advisors**, a boutique real estate capital
advisory firm in NYC (crossbowadvisors.net). It is **static HTML/CSS/JS with no build
step, no dependencies, and no framework**. Every page opens directly via `file://` or any
static host.

## Run & verify

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

There is **no test suite**. Changes are verified *visually* with headless Chrome. Two
gotchas to account for:

- Scroll-reveal elements start at `opacity:0` (`.reveal` / `[data-reveal]`). For static
  screenshots, inject `.reveal{opacity:1!important}` or they render invisible.
- Headless Chrome clamps `innerWidth` to ~500px, so a cropped PNG lies about overflow. For
  true horizontal-overflow checks use a DOM probe (`document.documentElement.scrollWidth <= window.innerWidth`) rather than trusting the image.

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --hide-scrollbars --window-size=1440,2400 \
  --screenshot=out.png "file://$PWD/index.html"
```

## Architecture

Each HTML file is **fully self-contained** — its own `<title>`, meta description, canonical
URL, Open Graph/Twitter tags, and JSON-LD structured data live inline in that file's
`<head>`. There is no templating or include system; shared structure (header, footer,
mobile menu) is duplicated across pages by hand. Editing site-wide chrome means editing
every page.

- `index.html` — homepage. Sections in order: Hero → Firm Overview → Skyline band →
  Capabilities → Investment Focus → Philosophy → Footer.
- `contact.html` — dedicated contact page. Contact is **a page, not a form**:
  **Alan@crossbowadvisors.net** / **404.790.6434**, also repeated in every footer.
- `team/index.html` — advisor grid. `team/<slug>.html` — one self-contained bio page per
  advisor (full bio, Education/Affiliations/Licenses sidebar, `Person` JSON-LD). To edit a
  bio, edit that one file.
- `assets/styles.css` — the entire design system + all section styling + responsive rules.
- `assets/main.js` — all interactivity (header state, mobile menu, scroll reveals, hero
  parallax). One IIFE, no modules.
- `assets/img/` — imagery; see `assets/img/README.md` for skyline drop-zone conventions.

Only three shared assets exist (`styles.css`, `main.js`, `favicon.svg`); the homepage links
them as `assets/...` and interior pages as `../assets/...`.

### Page conventions (don't break these)

- **Interior pages** (everything except the homepage) set `<body class="interior">` so the
  header renders solid instead of overlaying a dark hero. `main.js` keys off the presence of
  the `#hero` element to decide header behavior.
- IDs `main.js` depends on: `#siteHeader`, `#hero`, `#navToggle`, `#mobileMenu`, `#year`.
- All motion respects `prefers-reduced-motion` and degrades gracefully — keep it that way.

### Adding/removing an advisor

Add or remove `team/<slug>.html` **and** the matching `<a class="team-card">` in **both**
`index.html` and `team/index.html`.

## Design system

Defined as CSS custom properties at the top of `assets/styles.css` (`:root`). Palette: ink
`#0E0F12`, paper `#F4F2ED`, steel `#8A9099`, navy `#243352`. Type: **Fraunces** (serif
headlines) + **Inter** (body) via Google Fonts. Editorial minimalism — heavy whitespace,
12-column grid, hairline borders. When styling, use the existing tokens (`--ink`, `--paper`,
`--navy`, `--serif`, `--container`, etc.); add CSS additively and prune dead rules rather
than letting them pile up.

## Deployment

Two deployment paths exist in this repo — confirm which is live before touching DNS:

- **GitHub Pages** (current git state): `CNAME` (`crossbowadvisors.net`) + `.nojekyll`
  (serves raw static files, bypassing Jekyll).
- **GoDaddy cPanel**: see `DEPLOY-GODADDY.md` for the full cutover runbook, including the
  hosts-file preview trick to verify before flipping DNS. `.htaccess` (forces HTTPS,
  www→non-www, extensionless URLs, gzip, caching, security headers) is Apache-specific and
  only takes effect on cPanel/Apache hosting.

`robots.txt` and `sitemap.xml` are committed; keep `sitemap.xml` in sync when adding pages.

> **Image licensing:** `assets/img/skyline-01.jpg` is a licensed AdobeStock photo
> (AdobeStock_270116468). Keep the repo private and confirm the license covers the deploy
> context — or swap the image — before any public launch.

## Images

For image generation, use the **nano-banana** skill. Per the brand brief, imagery must be
**abstract and institutional** — architecture, financial-district geometry, structural
light/shadow. **No stock photos of smiling people.**
