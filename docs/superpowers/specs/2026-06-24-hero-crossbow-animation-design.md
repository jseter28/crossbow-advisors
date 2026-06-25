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
| construction (axis, dims, scale bar) | 0 | 900 |
| tiller / stock | 500 | 700 |
| prod (bow) | 950 | 800 |
| string | 1500 | 600 |
| lashing | 1550 | 400 |
| stirrup | 1700 | 450 |
| trigger nut / lock | 1900 | 600 |
| bolt (draws toward target — the payoff) | 2250 | 750 |
| callouts ①–⑤ | 2700 | 700 |
| DETAIL A magnifier | 2950 | 850 |
| FIG. 1 title block | 3300 | 700 |

Total ~4s. Easing `cubic-bezier(.45,0,.25,1)`. No glow / accent on completion — it just
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
- Pacing: **~4s**, understated finish (no glow).
- Everything **draws** (pen-trace or wipe); nothing fades.
