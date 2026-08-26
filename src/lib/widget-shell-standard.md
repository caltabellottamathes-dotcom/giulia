# Widget-shell standaard (GIULIA OS)

De canonieke opbouw voor **alle** dashboard-widgets. Zie `/shell-collection`
voor de visuele referentie. Hou je aan deze regels — wijzig ze niet per widget.

## Twee basisopties
1. **G — GlassShell + PhotoCard** (`GlassPhotoWidget`): glass shell, foto als
   zwevende kaart die zweeft/in-schuift.
2. **P — PhotoShell + GlassCard** (`PhotoGlassWidget`): foto full-bleed als
   shell, glasscard erin geplaatst. **Dit is de standaard voor LIFE-widgets.**

## Vormen (aspect-ratio's)
`21:9 · 16:9 · 3:2 · 4:3 · 1:1 · 4:5 · 3:4 · 2:3 · 9:16`

Het desktop-grid telt **25 kolommen** (`columnTiers` 1280→25 in Home.jsx);
1 span = 1/25. Een widget **behoudt altijd zijn oorspronkelijke ratio**. Bij
een "due"/groot moment groeit de widget uitsluitend van **5 span → 10 span**
(breder én hoger in dezelfde ratio). **Verander nooit de ratio, en schaal
andere widgets of tekst niet mee** — schakel daarvoor de masonry `fitHeight`
uit (zie Home.jsx: `fitHeight={howdoingDue ? undefined : fitH}`).

## Glasscard-regels (P-optie)
- **Flush** tegen de shellrand (geen floating inset): de kaart raakt de
  shellrand aan de open zijde(n).
- **4 afgeronde hoeken**: de kaart heeft `rounded-[28px]` op alle hoeken; de
  shell `overflow-hidden` + `rounded-[28px]` clippt de flush-hoeken zodat ze
  de shell-ronding volgen. Resultaat: 4 zichtbare ronde hoeken + flush.
- Schaduw naar de open kant (`SHELL_SHADOW`).
- Accent-haarlijn bovenaan de kaart in het domein-accent.

## Plaatsing
`L · R · T · B` (links/rechts/boven/onder) + optioneel `STRIP` (smalle band).

## Productcode
`Optie · Vorm · Plaats · Soort` — bijv. `P·2:3·B` = PhotoShell+GlassCard, 2:3,
onder.

## Domein-accenten (LIFE = lichtblauw ridge sky + whipped pistachio)
- life: `--d-life-deep` (lichtblauw), urgent = Whipped Pistachio `#d8dab3`.
- Overige domeinen via `accentFor(domain)`.

## Referentie-implementatie
`src/life/widgets/new/DinnerWidget.jsx` (G·16:9, inline) en
`src/life/widgets/new/HowDoingWidget.jsx` (P·2:3·B via `PhotoGlassWidget`).

## Primitieven
`src/system/widgets/primitives/index.js` → `PhotoGlassWidget`,
`GlassPhotoWidget`, `WidgetHeader`, `WidgetShell`, accenten.