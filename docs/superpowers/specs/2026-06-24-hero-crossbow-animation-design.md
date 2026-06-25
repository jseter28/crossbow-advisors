# Hero Crossbow Schematic — Design Spec

**Date:** 2026-06-24
**Scope:** Homepage hero (`index.html`) background only. Copy unchanged.
**Status:** Approved via live prototype (`scratchpad/hero-A3.html`).

## Goal

Replace the homepage hero's generic line-grid background with a detailed,
patent-plate **crossbow schematic** that **draws itself on load** (a self-drafting /
plotter effect). The crossbow is the firm's namesake and carries the
"precision + institutional" positioning. The motif sits faintly behind the existing
headline; the headline and one-liner are **unchanged**.

- Headline (unchanged): `Capital. Strategy. Alignment.`
- One-liner (unchanged): `Strategic capital advisory for real estate sponsors and institutional investors.`

## Visual design

A single inline SVG (`viewBox="0 0 1200 760"`, plan view, aimed right) placed inside
`.hero__bg`, layered with the existing drifting `.hero__light`. The uniform
`.hero__grid` is **removed** and replaced by this schematic.

**Hero composition (editorial / lower-left anchor):** the hero content is
bottom-anchored (`.hero { align-items: flex-end }`, `.hero__inner` padding-bottom
`clamp(3.5rem, 13vh, 9rem)`) so the headline grounds the lower-left, while the
crossbow is lifted into the upper space above it (`transform: translateY(-11%)
scale(1.02)`; phone `translateY(-13%) scale(0.92)`). This composes the type and
the motif together — text over the quiet tail of the drawing, the dense lock/
fletching kept up in the negative space — rather than parking both top-aligned.

**Linework (all hairline, technical-illustration style):**

- Buttstock + tiller/stock with pistol grip, bolt flight groove, faint wood grain
- Double-line **recurve prod (bow)** with limb laminations and recurve tip hooks
- Prod-to-tiller **lashing** (cord wrap) over the bridge block
- Drawn **string** (double line + serving) with limb-tip loops
- Detailed **trigger nut / lock** (string groove, sear notch, trigger lever + guard)
- Fletched **bolt / quarrel** with binding wraps and a two-blade **broadhead**
- Foot **stirrup** at the nose
- Drafting furniture: numbered **callouts ①–⑤** with leader rings, an overall-length
  **dimension line**, a prod-span dimension, a **scale bar**, a **DETAIL A · 3:1**
  magnifier of the lock, and a **FIG. 1 — CROSSBOW · PLAN VIEW** title block

**Styling tokens:**

- Color: light steel `#dce6fb` (via `currentColor`), whole schematic at `opacity: 0.5`
- Edge falloff: `mask-image: radial-gradient(125% 118% at 58% 46%, #000 30%, transparent 88%)`
  (with `-webkit-mask-image`)
- All strokes solid (no dashed strokes — they conflict with the draw-on technique)
- Decorative only: SVG is `aria-hidden="true"`

### Responsive framing (art direction, not cover-crop)

`preserveAspectRatio="xMidYMid meet"` — the SVG always shows the **whole**
crossbow scaled to fit, never a zoom-cropped fragment. On desktop the hero's
aspect ratio ≈ the drawing's (1.58), so `meet` looks the same as `slice` would.
On narrow/tall phones `slice` would over-zoom into the drawing's center (the
lock); `meet` instead shows the complete crossbow small. Per-breakpoint framing
is then deliberate, controlled in CSS:

- Levers, in order of reach: (1) `preserveAspectRatio` (fit behavior),
  (2) the `.hero__crossbow` box geometry / `transform` (size + position),
  (3) the radial `mask` (edge falloff), (4) breakpoint overrides.
- Phone (`@media (max-width: 560px)`): `transform: translateY(6%) scale(0.9)`
  seats it slightly lower and smaller as a composed motif beneath the stacked
  headline. **Use `transform`, not `opacity`** — the draw-on sets inline
  `opacity` at runtime, which overrides CSS `opacity` but never `transform`.

## Animation — "self-drafting" draw-on

On load the schematic plots itself line by line. **Nothing fades in.**

- **Stroked geometry** (paths, lines, circles): drawn by tracing — measure each element
  with `getTotalLength()`, set `stroke-dasharray`/`stroke-dashoffset` to that length, then
  transition `stroke-dashoffset` to `0`.
- **Text labels** (callout numbers, `DETAIL A`, `FIG. 1`): cannot be pen-traced, so they
  reveal with a quick **left-to-right wipe** via `clip-path: inset(...)` (reads as a pen
  writing them, not a fade). Outline-stroke tracing was considered and rejected (spindly at
  this weight, heavier).

**Sequence (group → delay / duration, ms):**

| Group | Delay | Dur |
|---|---|---|
| construction (axis, dims, scale bar) | 0 | 600 |
| tiller / stock | 320 | 480 |
| prod (bow) | 620 | 540 |
| string | 980 | 420 |
| lashing | 1010 | 300 |
| stirrup | 1120 | 320 |
| trigger nut / lock | 1240 | 420 |
| bolt (draws toward target — the payoff) | 1480 | 520 |
| callouts ①–⑤ | 1780 | 460 |
| DETAIL A magnifier | 1950 | 520 |
| FIG. 1 title block | 2200 | 420 |

Total ~2.6s. Easing `cubic-bezier(.45,0,.25,1)`. No glow / accent on completion — it just
settles into the final drawing.

**Behavior:**

- Plays **once per page load**. (No re-trigger on scroll-back for v1.)
- **`prefers-reduced-motion: reduce`** → skip animation entirely, render the finished
  drawing immediately. (Per site convention; the schematic must degrade gracefully.)
- The schematic is hidden (`opacity: 0`) until the script initializes draw state, to avoid
  a flash of the finished drawing before animation starts.

## Implementation notes

Static site, no build step. Three files change:

1. **`index.html`** — In the `#hero` `.hero__bg`: keep `.hero__light`, remove the
   `.hero__grid` div, add the inline crossbow `<svg id="heroCrossbow" aria-hidden="true">`
   (linework finalized in `scratchpad/cb.svg`; class the groups `g-cons`, `g-tiller`,
   `g-prod`, `g-string`, `g-lash`, `g-stir`, `g-nut`, `g-bolt`, `g-call`, `g-det`,
   `g-title`). Interior pages are unaffected (no hero).
2. **`assets/styles.css`** — Remove the now-dead `.hero__grid` rule. Add `#heroCrossbow`
   positioning, color, opacity, and mask rules. Keep `.hero__light` and `.hero::after`.
3. **`assets/main.js`** — Add the draw-on routine inside the existing IIFE, guarded by the
   presence of `#heroCrossbow` (homepage only) and gated on `prefers-reduced-motion`. Pure
   vanilla JS, no dependencies, consistent with the file's existing style.

**Verification:** visual, via headless Chrome. Use `--virtual-time-budget` to capture
animation frames deterministically. Confirm: (a) reduced-motion renders the static drawing,
(b) no horizontal overflow (DOM probe, not screenshot), (c) interior pages untouched.

## Decisions locked

- Variant **A** (full blueprint crossbow), maximum detail — not the abstract fragment (B).
- Keep the **DETAIL A** magnifier.
- Text labels: **wipe**, not outline-trace.
- Pacing: **~2.6s**, understated finish (no glow).
- Everything **draws** (pen-trace or wipe); nothing fades.
