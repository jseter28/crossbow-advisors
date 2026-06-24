# Design: Merge Capabilities + Investment Focus into one section

**Date:** 2026-06-24
**Files touched:** `index.html`, `assets/styles.css`, and the shared nav in all other
pages (`contact.html`, `team/index.html`, 7 advisor pages) — 11 HTML files total for the
nav-link cleanup.
**Goal:** Tighten the homepage — collapse two stacked sections (Capabilities #02,
Investment Focus #03) into a single two-column section to cut scroll length while keeping
both lists clearly legible.

## Background

The homepage currently runs: Hero → Firm Overview (01) → Skyline band → Capabilities (02)
→ Investment Focus (03) → Philosophy → Footer.

Capabilities and Investment Focus are two different axes:

- **Capabilities** = *what we do* — 6 services, each with a one-line description.
- **Investment Focus** = *where we do it* — 7 sectors/situations, titles only, plus a
  closing "Selective by mandate" bento CTA cell.

They sit one above the other with the pinned skyline band between them.

## Target design

Replace the two sections with **one section, two columns**.

```
─── 02 / Capabilities & Focus ──────────────────────────────

CAPABILITIES                      INVESTMENT FOCUS
i   Capital Formation             01  Vertically integrated multifamily platforms
    Equity & debt across the      02  Commercial real estate development
    full capital stack.           03  Single-family rental (SFR) platforms
ii  GP / LP Advisory              04  Hospitality, office & mixed-use assets
    ...                           05  Distressed & mispriced opportunities
vi  Recapitalizations & Restr.    06  CRE credit & structured products
    ...                           07  Strategic partnerships & acquisitions
```

### Content decisions

- **Left column — Capabilities (unchanged content):** 6 items, roman numerals `i`–`vi`,
  each keeps its `<h3>` title and description `<p>`.
  1. Capital Formation
  2. GP / LP Advisory
  3. Structured Finance & Credit
  4. Platform-Level Capital Strategy
  5. Joint Ventures & Partnerships
  6. Recapitalizations & Restructuring
- **Right column — Investment Focus (unchanged content):** 7 items, numbers `01`–`07`,
  titles only (no descriptions), in current order.
  1. Vertically integrated multifamily platforms
  2. Commercial real estate development
  3. Single-family rental (SFR) platforms
  4. Hospitality, office & mixed-use assets
  5. Distressed & mispriced opportunities
  6. CRE credit & structured products
  7. Strategic partnerships & acquisitions
- **"Selective by mandate" CTA cell — DROPPED.** The bento closing cell
  (`.focus-cell--cta`) is removed entirely.

### Heading

- Section index: `02` (reuses `.index`).
- Section title: **"Capabilities & Focus"** (`.section__title`).
- Column labels: **"Capabilities"** and **"Investment Focus"** as small per-column
  headings/eyebrows above each list.

### Skyline band

- **Kept.** Default placement: the lead-in *above* the combined section, i.e.
  `Firm Overview → Skyline band → Capabilities & Focus → Philosophy`.
- This is provisional — after rendering, evaluate whether it reads better below the
  combined section (`Firm → Combined → Skyline → Philosophy`) and move if so. No content
  change to the band itself.

### Section numbering

- Sections today: `01` Firm, `02` Capabilities, `03` Focus, Philosophy (unnumbered).
- After merge: `01` Firm, `02` Capabilities & Focus, Philosophy (unnumbered). The old `03`
  disappears; nothing downstream is renumbered.

### Navigation (all 11 pages)

The `#focus` anchor is removed when the Investment Focus section is merged in. The nav
currently carries two items — "Capabilities" (→ `#capabilities`) and "Focus" /
"Investment Focus" (→ `#focus`) — in both the **desktop nav** and the **mobile menu**, on
every page.

- **Drop the separate "Focus" / "Investment Focus" nav item entirely**, in both the
  desktop nav and mobile menu, on all 11 pages. Keep the single **"Capabilities"** item
  pointing to `#capabilities`.
- On non-homepage pages these are `index.html#focus` / `../index.html#focus` links — same
  removal applies.
- After this, **no `#focus` reference should remain anywhere** in the repo.

## Layout & CSS

- New section (`id="capabilities"`, keep the existing anchor so nav/links still resolve)
  with a two-column body: `grid-template-columns: 1fr 1fr` on desktop.
- The two columns are **independent lists**, not row-aligned. Left has 6 taller
  (title + description) items; right has 7 terser ones — roughly balanced height.
- Reuse existing item styling: `.cap` markup for the left list, `.focus-cell` markup for
  the right list (minus the `--cta` variant).
- **Mobile** (single-column breakpoint, same as existing grid breakpoints): columns stack
  — Capabilities first, then Investment Focus. This preserves the original reading order.
- CSS is **additive**: add a two-column wrapper rule + responsive stack. After the markup
  change, prune any `.section--capabilities` / `.section--focus` / `.focus-cell--cta` /
  `.col-label` / `.col-body` rules that are no longer referenced, and the now-unused
  `#focus` section. Do not touch unrelated styles.

## Verification

No test suite — verify visually with headless Chrome at desktop (1440px) and a narrow
width, forcing `.reveal{opacity:1!important}` for static captures. Confirm:

- Two columns render side by side on desktop, stack on mobile.
- All 6 capabilities (with descriptions) and all 7 focus items present; "Selective by
  mandate" gone.
- Section reads `02 / Capabilities & Focus`; Philosophy unchanged.
- Skyline band still renders; no horizontal overflow (DOM probe
  `scrollWidth <= innerWidth`); no console errors.
- `#capabilities` anchor still resolves from every page's nav.
- `grep -rn '#focus' .` (excluding `.git` and `docs/`) returns **nothing** — the nav item
  is gone from all 11 pages, desktop and mobile.

## Out of scope

- No copy rewrites to the capability/focus items themselves.
- No new imagery.
- No changes to Hero, Firm Overview, Philosophy, or Footer content (the footer "Capabilities"
  link stays; footers carry no "Focus" link).
