# Capabilities & Focus — Interactive Ledger Redesign

**Date:** 2026-06-24
**Page:** `index.html` (homepage), section `#capabilities`
**Status:** Approved design — ready for implementation planning

## Goal

Completely redo the homepage **Capabilities & Focus** section as an interactive,
consolidated "ledger." Replace the current static two-column block (6 capabilities +
7 focus areas) with a fewer, punchier set of items where each capability reveals its
description on interaction — hover on desktop, tap on mobile — while staying within the
existing institutional-minimalist brand (paper / ink / steel / navy, Fraunces + Inter,
hairline borders).

This is a self-contained front-end change to one homepage section. No new dependencies,
no build step, no new pages.

## Non-goals

- No new color hues or imagery. Stay on the existing palette and tokens.
- No changes to other homepage sections, the header/footer, or other pages.
- No new service lines invented — content is consolidated from what exists, not expanded.
- Not a form, not a CMS, no data fetching. Pure static markup + CSS + a small JS enhancement.

## Content (final consolidation)

Every original item remains represented; items are merged, not dropped.

### Capabilities — 4 items (title + revealed description)

1. **Capital Formation** — Equity and debt raised and structured across the full capital stack.
2. **Advisory & Alignment** — GP/LP advisory, joint-venture structuring, and governance that
   align sponsors with the right capital partners. *(merges old "GP/LP Advisory" + "Joint
   Ventures & Partnerships")*
3. **Structured Finance & Credit** — Bespoke credit, recapitalizations, and structured
   solutions tailored to asset and platform needs. *(merges old "Structured Finance & Credit"
   + "Recapitalizations & Restructuring")*
4. **Platform Capital Strategy** — Programmatic, platform-level capital architecture designed
   to scale an institution over time.

Capability numbering uses lowercase roman numerals (`i`–`iv`) to match the existing
`.cap__num` editorial style.

### Investment Focus — 5 tags

- Multifamily & SFR platforms
- Commercial development & mixed-use
- CRE credit & structured products
- Distressed & special situations
- Strategic partnerships & M&A

Mapping from the original 7: (multifamily + SFR) → "Multifamily & SFR platforms";
(commercial development + hospitality/office/mixed-use) → "Commercial development & mixed-use";
(CRE credit & structured products) → kept; (distressed & mispriced) → "Distressed & special
situations"; (strategic partnerships & acquisitions) → "Strategic partnerships & M&A".

## Layout & structure

Full-width section, keeping the existing section header:

```
02 — Capabilities & Focus
─────────────────────────────────────────────
i    Capital Formation                      +
ii   Advisory & Alignment                   +
iii  Structured Finance & Credit            +
iv   Platform Capital Strategy              +
─────────────────────────────────────────────
INVESTMENT FOCUS
[Multifamily & SFR] [Commercial development & mixed-use]
[CRE credit & structured products] [Distressed & special situations]
[Strategic partnerships & M&A]
```

When a row is active, its description appears indented directly beneath the title, between
hairlines, pushing the rows below down.

### Markup contract

- The section keeps `id="capabilities"` (the header nav links to `index.html#capabilities`),
  and keeps the existing `.section__head` block (`<span class="index">02</span>` +
  `<h2 class="section__title">Capabilities &amp; Focus</h2>`).
- The capability ledger is a list of **native `<details>` elements**, one per capability:

  ```html
  <div class="ledger">
    <details class="cap-row" data-reveal>
      <summary class="cap-row__summary">
        <span class="cap-row__num">i</span>
        <span class="cap-row__title">Capital Formation</span>
        <span class="cap-row__icon" aria-hidden="true"></span>
      </summary>
      <div class="cap-row__detail">
        <p>Equity and debt raised and structured across the full capital stack.</p>
      </div>
    </details>
    <!-- ii, iii, iv … -->
  </div>
  ```

- Investment Focus is a labeled tag strip (non-interactive content, decorative hover only):

  ```html
  <p class="focus-label">Investment Focus</p>
  <ul class="focus-tags">
    <li>Multifamily &amp; SFR platforms</li>
    <li>Commercial development &amp; mixed-use</li>
    <li>CRE credit &amp; structured products</li>
    <li>Distressed &amp; special situations</li>
    <li>Strategic partnerships &amp; M&amp;A</li>
  </ul>
  ```

- The `+ / ×` affordance is drawn in CSS (`.cap-row__icon`), rotating to indicate open state.
  No icon font; reuse the existing hairline/CSS aesthetic.

## Interaction & accessibility

Behavior is layered as progressive enhancement over the native `<details>` element:

- **No JavaScript:** rows work as a native click/tap/keyboard accordion. Fully usable. This
  satisfies the project's "degrades gracefully" rule.
- **Touch / coarse pointer / no-hover:** native tap toggles a row open/closed. **One open at a
  time** — opening a row closes any other open row (managed by the JS enhancement; if JS is
  off, native multi-open is acceptable).
- **Desktop (`(hover: hover) and (pointer: fine)`):** the JS enhancement opens a row on
  `mouseenter` and closes it on `mouseleave`, producing the "hover reveal" feel. Clicking still
  works (native). Keyboard focus on the summary also reveals the detail (CSS `:focus-within` or
  native open on Enter).
- **Keyboard:** native `<summary>` semantics — `Tab` to focus, `Enter`/`Space` to toggle,
  `aria-expanded` handled by the browser. No custom ARIA needed.
- **Reduced motion:** when `prefers-reduced-motion: reduce`, the expand/collapse height
  transition is skipped (instant open/close). Matches existing `main.js` / CSS conventions.

### JS enhancement (in `assets/main.js`, same IIFE)

- Guard on `window.matchMedia('(hover: hover) and (pointer: fine)').matches` for the hover
  open/close handlers — only attach on hover-capable, fine-pointer devices.
- On open (whether via hover, click, or tap), close sibling `<details>` in the same `.ledger`
  to enforce single-open.
- Respect `prefers-reduced-motion`: no JS-driven animation; rely on CSS which already gates
  transitions under the reduced-motion media query.
- No new globals; follow the existing IIFE structure and feature-detect before binding.

### Height animation note

Native `<details>` does not animate open by default. The reveal animation is achieved with CSS
on `.cap-row__detail` (e.g. a grid-rows `0fr → 1fr` or max-height transition on
`details[open]`), kept subtle and disabled under reduced motion. The animation is a nicety, not
required for function — correctness does not depend on it.

## File changes

- **`index.html`** — replace the entire `.section--work` block (currently lines 186–245,
  `<section class="section section--work" id="capabilities"> … </section>`) with the new
  ledger markup described above. Keep `data-reveal` on appropriate elements for the existing
  scroll-reveal system.
- **`assets/styles.css`** — remove the now-dead rules in the "CAPABILITIES & FOCUS (combined
  two-column section)" block (currently ~lines 434–531, ending where the "SKYLINE BAND" block
  begins): `.work-grid`, `.work-col__label`, `.cap-grid`, `.cap`, `.cap__num`, `.focus-grid`,
  `.focus-cell`, `.focus-cell__n`, and their responsive variants. (`.section--work` has **no**
  CSS rule — it is only a markup hook; the new `<section>` keeps `class="section section--work"`
  so section spacing and the `#capabilities` anchor are unchanged.) Add new rules: `.ledger`,
  `.cap-row`,
  `.cap-row__summary`, `.cap-row__num`, `.cap-row__title`, `.cap-row__icon`, `.cap-row__detail`,
  `.focus-label`, `.focus-tags`. Reuse existing tokens (`--ink`, `--navy`, `--line`, `--serif`,
  `--steel`, etc.). Before deleting any class, grep the codebase to confirm it is not used on
  another page.
- **`assets/main.js`** — add the desktop hover-reveal + single-open enhancement inside the
  existing IIFE.

## Testing / verification

No automated test suite exists; verify visually with headless Chrome per `CLAUDE.md`:

1. **Static render** (inject `.reveal{opacity:1!important}` so reveal elements are visible):
   screenshot the section at desktop (1440) and confirm the 4-row ledger + focus tags render
   on-brand.
2. **Open-state render:** screenshot with one row forced open (`details[open]`) to confirm the
   revealed description styling.
3. **No-JS check:** load with JavaScript disabled (or confirm via reasoning) that rows still
   expand on click — native `<details>` guarantees this.
4. **Reduced-motion:** confirm transitions are gated under the existing reduced-motion media
   query.
5. **Horizontal overflow:** use the DOM probe
   (`documentElement.scrollWidth <= innerWidth`, accounting for the headless ~500px innerWidth
   clamp) at mobile and desktop widths — no horizontal overflow.
6. **Grep:** confirm no dangling references to removed class names remain in any HTML/CSS.

## Risks & mitigations

- **Hover open/close jitter** when the pointer crosses rows quickly. Mitigation: single-open
  logic + closing on `mouseleave` of the row; keep the hover region the full row, not just the
  summary text.
- **Animating native `<details>`** is historically awkward. Mitigation: treat animation as
  optional polish; function relies only on the native open/closed state, not the transition.
- **Deleting shared CSS by mistake.** Mitigation: grep each class name across all pages before
  removing; only `index.html` uses this section, but `.section--work` / tokens must be checked.
