# OS Page Template — Canonical Reference

**Source of truth:** `src/life/pages/PaginaOntwerp.jsx` + `src/life/pages/PaginaOntwerpCard.jsx`
**DO NOT modify these files.** When asked to create a new page or redo an existing page, COPY this design and adjust content/tabs only.

---

## Anatomy (desktop, lg+)

Fixed viewport region `fixed inset-x-0 top-14 bottom-0 overflow-visible z-[30]`.

1. **Hero PhotoCard (left)** — always rendered, never hidden.
   - `absolute left-0 top-[14%] bottom-0 w-[34%]`, `rounded-r-[24px]`, `z-[5]`
   - Entry: `initial x:"-118%" → x:0`, duration 0.7, EASE.
   - `<img>` full-cover + `bg-gradient-to-t from-charcoal/65 via-charcoal/15 to-charcoal/10`.
   - It stays open when the glass panel slides — it shows through the translucent glass.

2. **Title block (left, over photo)** — top-left, hidden only when a stage is active.
   - `absolute left-[2.5%] top-[3%] z-[2]`, eyebrow (10px uppercase tracked, `text-life-olive`) + `<h1>` (34px display, `text-foreground`).

3. **GlassPanel (right)** — the main stage. `absolute right-0 top-[78px] bottom-[94px] w-full lg:w-[76%] glass-2 rounded-l-[32px]`, `z-[15]`.
   - Slides left by `-24vw` when a stage opens; rests at `x:0` otherwise.
   - `backdropFilter: blur(16px) saturate(1.25)`.

4. **Left glass rail (inside panel)** — `w-[88px]`, vertical icon column, `z-30`:
   - Top: toggle arrow button (`ArrowLeft`, rotates 180° when open) → `setPanelOpen(o => !o)`.
   - **TABS** (content tabs): dark ink — active `bg-foreground/12 text-foreground`, inactive `text-foreground/55 hover:text-foreground/85`. Active marker: left rail `h-6 w-1 bg-foreground/70`.
   - Divider: `h-px w-6 bg-foreground/15`.
   - **STAGE_TABS** (Chat/Voice/Doc/Media): WHITE — active `bg-white/15 text-white`, inactive `text-white/70 hover:bg-white/10 hover:text-white`. Active marker `bg-white/80`.
   - Bottom: vertical label `[writing-mode:vertical-rl] rotate-180`, shows domain/agent name, `text-white`.

5. **Content wrapper** — `relative flex-1 ml-[2.5%] -mt-[134px] -mb-[70px]`:
   - **Stage column**: when `isStage`, `absolute top-[134px] bottom-[70px] left-0 w-[24vw] z-10`. Own back arrow top-left (`ArrowLeft` → `setPanelOpen(false)`). Renders the active stage component.
   - **White card**: `absolute inset-0 z-20`, slides `x:24vw` when stage open so it stays put visually. Hosts the editorial `OntwerpWhiteCard`.

6. **Stages** route via `window` event `giulia:ontwerp-stage` (detail: "chat"|"voice"|"doc"|"media") from the workspace toolbar on this page. Toolbar stays collapsed here.

## White card editorial pattern (`PaginaOntwerpCard.jsx`)

- `bg-white`, `rounded-bl-[20px]`, splits 42% editorial left / rest bento right.
- Left: mono eyebrow `N°1` / display title with glowing shadow + bouncing dot accent / indented subtitle+body / "What needs your attention" heading with `BounceBalls` / `N°2` line / action items (number + BounceBalls, cumulative color: 01 one color, 02 two, 03 three) / "The rest can wait" (`#abab69`) footer.
- Right: 4 floating bento cards (`#f5f5f4`, soft shadow), same layout per tab.
- Item buttons navigate to the relevant detail page with `?tab=`.

## Tokens / classes used

- EASE curve: `[0.16, 1, 0.3, 1]`.
- Glass: `glass-1`, `glass-2` (defined in `src/index.css`).
- Palette: `text-foreground`, `text-life-olive`, `text-ivory`, `bg-foreground/12`, `bg-white/15`, `text-white/70`.
- BounceBalls: `ontwerp-dot-bounce` keyframe (in index.css).
- Fonts: `font-display`, `font-mono`, `font-body`.

## Toolbar behavior on template pages

`src/system/components/WorkspaceToolbar.jsx` detects `location.pathname === "/Pagina-Ontwerp"` (`onPaginaOntwerp`):
- Toolbar stays collapsed; domain label + Chat/Voice icons render WHITE to match the page's white-on-glass language.
- Chat/Voice buttons dispatch `giulia:ontwerp-stage` → opens the panel stage instead of the global ChatWindow/VoiceWindow.

## How to use this template for a new page

1. Copy `PaginaOntwerp.jsx` → new page file. Change `TABS` (content sections) and the stage routing name if needed.
2. Copy `PaginaOntwerpCard.jsx` → new card file. Replace `TAB_CONTENT` map with the page's editorial copy + items, keep the layout/typography/BounceBalls/bento exactly.
3. Reuse the four stage components (`ChatStage`, `VoiceStage`, `DocStage`, `MediaStage`) as-is.
4. Add the route in `src/App.jsx` and, if the toolbar should stay collapsed + white on it, add the path to the `stayCollapsed` / `onPaginaOntwerp` checks in `WorkspaceToolbar.jsx`.
5. Keep motion, easing, z-index layering, and the glass/white split identical — only content and tab set change.