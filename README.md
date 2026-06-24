# Crossbow Capital Advisors — crossbowadvisors.net

Ultra-premium, institutional marketing site for a boutique real estate capital advisory
firm in New York. **Static HTML/CSS/JS — no build step, no dependencies, no framework.**
Opens directly via `file://` or any static host.

## Structure

```
crossbow-advisors/
├── index.html              # Homepage: all sections, SEO meta, JSON-LD structured data
├── contact.html            # Dedicated contact page (email + phone)
├── team/
│   ├── index.html          # Team landing page (grid of all advisors)
│   ├── alan-purser.html    # One self-contained page per advisor (full bio)
│   ├── jay-weaver.html
│   ├── evan-marks.html
│   ├── rick-coppola.html
│   ├── chris-seter.html
│   ├── eric-rosen.html
│   └── sanjeev-handa.html
└── assets/
    ├── styles.css          # Design system + all section styling + responsive
    ├── main.js             # Header state, mobile menu, scroll reveals
    ├── favicon.svg         # Brand mark
    └── img/                # Imagery (see assets/img/README.md)
        ├── skyline-01.jpg          # Pinned skyline band photo
        ├── skyline-placeholder.svg # On-brand fallback until a photo is added
        └── README.md               # Drop-zone conventions for skyline photos
```

## Homepage sections

Hero → Firm Overview (01) → **Skyline band** → Capabilities (02) → Investment Focus (03)
→ Philosophy → Footer.

> Contact is a **dedicated page** (`contact.html`) — **Alan@crossbowadvisors.net** /
> **404.790.6434** (also in every footer). There is no on-page contact form.

## Graphics / imagery

- **Crossbow chevron motif** — a hand-authored inline SVG derived from the logo mark, used
  as a section accent in the Firm label column (`.section-accent` / `.accent-mark`). Vector,
  themeable via the palette tokens, zero external assets.
- **Pinned skyline band** — a full-bleed band whose photo is pinned to the viewport via
  `background-attachment: fixed`, so the page scrolls *over* a static skyline
  (`.skyband` / `.skyband--01`). Photo shows in **natural color** under a dark wash for text
  legibility. Degrades to a normal scrolling background on touch/small screens (iOS renders
  `fixed` inconsistently). To swap the photo, drop a new `assets/img/skyline-01.jpg` — see
  `assets/img/README.md` for sizing/mood specs.
- **Investment Focus** — a big-numeral **bento card grid** (`.focus-grid` / `.focus-cell`):
  ghost serif numerals behind each focus area, with a dark "Selective by mandate" closing cell.

> **Image note:** `assets/img/skyline-01.jpg` is a **licensed AdobeStock photo**
> (AdobeStock_270116468). Keep this repo **private** — do not redistribute the image publicly.
> Swap in a free-license or owned photo before any public deployment of the source.

## Design system

- **Palette:** deep charcoal `#0E0F12`, warm off-white `#F4F2ED`, steel gray `#8A9099`,
  subtle navy `#243352` (full token set at the top of `assets/styles.css`).
- **Type:** Fraunces (editorial serif headlines) + Inter (body), via Google Fonts.
- **Layout:** 12-column grid, heavy whitespace, hairline borders; interior pages use
  `body class="interior"` so the header renders solid (no dark hero).
- **Motion:** scroll-reveal via IntersectionObserver (`.reveal` / `data-reveal`), slow hero
  light drift — all disabled under `prefers-reduced-motion`.

## Run locally

Open `index.html` directly, or serve it:

```bash
cd crossbow-advisors
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Verify changes (visual)

No test suite — verify visually with headless Chrome. Scroll-reveal elements start at
`opacity:0`, so inject an override for static captures:

```bash
# render with reveals forced on
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --hide-scrollbars --window-size=1440,2400 \
  --screenshot=out.png "file://$PWD/index.html"
```

Headless clamps innerWidth to ~500px min — use a DOM probe (`scrollWidth <= innerWidth`)
for true overflow checks rather than trusting a cropped PNG.

## Deploy

Drop the folder on any static host (Netlify, Vercel, Cloudflare Pages, S3+CloudFront,
GitHub Pages). No build required. Point `crossbowadvisors.net` at the host. Confirm the
AdobeStock image is licensed for the deploy context (or replaced) before going live.

## Team pages

The **Team** grid links each advisor card to that person's own page under `team/<slug>.html`.
Each member page is a **self-contained static HTML file** — full bio, an Education /
Affiliations / Licenses sidebar, per-page SEO (`<title>`, description, canonical) and
`Person` JSON-LD. To edit a bio, open that one file. All team pages share
`../assets/styles.css` and `../assets/main.js`.

To add/remove an advisor: add/remove their `team/<slug>.html` and the matching
`<a class="team-card">` in both `index.html` and `team/index.html`.

---

© Crossbow Capital Advisors. All rights reserved. Proprietary — not for redistribution.
