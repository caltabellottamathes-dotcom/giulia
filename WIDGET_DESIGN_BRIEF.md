# GIULIA OS — Widget Design Brief (persistent reference)

> Salvo asked me to save this so I stop re-asking the same questions every time
> we touch widget design. Read this file before designing/redesigning ANY
> dashboard widget or widget-gallery page.

## The ask, verbatim intent

- Start from the **current real widgets** on the OS (Home.jsx dashboard) — not
  an invented style. The real components ARE the design language.
- Aesthetic: **glass with rounded corners, combined with a large editorial
  photo with rounded corners that touches the edges of the glass**.
  - Sometimes the glass is layered ON TOP of the photo (glass floats over the
    photo, overlapping into it).
  - Sometimes the photo is layered ON TOP of the glass (photo band floats over
    the glass edge).
  - Both directions must be used across the widget set, not just one.
- **Bold typography** — big, confident display numbers/headlines, not small
  polite text.
- **Cool, animated graphics and infographics** — bespoke shapes (rings, bar
  stacks, timelines, meters), not generic icons.
- **Animations** throughout (count-up numbers, pulsing status, animated
  meters/equalizers, hover lift).
- **A lot of detail** — every widget should feel considered, not sparse.
- **Widgets must be interactive**: either multiple "pages" inside one widget
  (e.g. front/back, tabs, a pager) OR multiple distinct action buttons that do
  different things. Not just one click-through to a page.

## Real components already on the OS (the actual design system — reuse these)

- `WidgetShell` (`src/components/widgets/WidgetShell.jsx`) — the tile shell.
  `glass-3`/solid palette background, `rounded-[20–32px]`, a 3px accent strip
  on top (`--tile-accent`), hover `-translate-y-1`, adapts text color to tile.
- `BrandPhoto` (`src/components/widgets/BrandPhoto.jsx`) — photo block with a
  gradient overlay for legibility. Used as a **contained** design element
  (never full-bleed background) so the tile color still reads.
- `WidgetHeader` (`src/components/widgets/WidgetHeader.jsx`) — quiet label +
  a small animated 3-bar "equalizer" motif (framer-motion, pulses forever) —
  the OS's signature "alive" micro-motif. No icon.
- `Ring` (`src/components/widgets/Ring.jsx`) — bespoke animated radial dial,
  `currentColor` stroke, content centered inside.
- `CountUp` (`src/components/widgets/CountUp.jsx`) — numbers animate up to
  their value on mount/change. Used everywhere a stat appears.
- Layering patterns already in production:
  - **Glass-over-photo**: `TasksWidget` — glass card fills most of the tile,
    a short photo strip peeks below with `-mb-8` overlap and matching radius.
  - **Photo-over-glass**: `EmailWidget` — glass content fills the tile, a
    photo band sits on the TOP edge with `-mt-8 rounded-t-[24px]` overlap.
  - **Side-by-side editorial**: `GiuliaWidget` — a photo column
    (`rounded-r-[24px]`, ~34% width) beside a glass content column, numbered
    list items as the graphic (`01`, `02`, `03` in accent color).

## Design principles to keep applying (from the glanceable-graphic-widgets skill)

- One widget = one primary question, answered by the single largest graphic
  element (a number, ring, bar-stack, timeline — never a stock icon).
- Every widget keeps the manual color-toggle control (transparent / palette).
- Exactly one purposeful animation idea per widget, not decorative noise.
- The whole card is tappable; when there's a call to action it's a real pill
  button, sculpted and tactile — not a text link.

## Where this was last applied

`/widget-gallery` page (`src/pages/WidgetGallery.jsx`) — a private page (not
in OS nav) comparing 3 widget designs × all 17 widget types, all three rooted
in this real aesthetic (glass+photo layering, bold type, animation,
multi-page/multi-action interactivity), so Salvo can pick winners per widget.