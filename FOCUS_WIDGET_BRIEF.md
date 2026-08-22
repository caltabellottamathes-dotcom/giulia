# FOCUS · Widget-herontwerp — Blaupauw

Doel: alle Focus-widgets opnieuw ontwerpen in de Giulia-"skelet"-stijl, ontworpen naar hun functie, met de Focus-kleuren en Focus-beelden (brutalist editorial: burgundy / olijf / beton / geborsteld metaal).

## 1 · Het skelet (gedeelde primitieven — `src/system/widgets/primitives/`)

Eén stijl; variatie alleen in **vorm, elementen, plaatsing**.

**Productcode** (`shellCode.js`): `<Optie>·<Vorm>·<Plaats>·<Soort>`
- Optie: `G` = GlassShell + PhotoCard · `P` = PhotoShell + GlassCard
- Vorm: `1x1 · 4x3 · 3x4 · 16x9 · 9x16 · 21x9 · 3x2 · 2x3 · 4x5`
- Plaats: `L · R · T · B`
- Soort: `SIDE · STRIP · BEHIND`

**Laag-primitieven**: `GlassPhotoLayeredWidget` (G), `PhotoGlassLayeredWidget` (P), `GlassPhotoBehindWidget` (behind).
**WidgetHeader** — 6 emblemen op functie: `social · agenda · energy · tasks · briefing · pulse`.
**Bouwstenen**: `CountUp`, `CheckList`, `ProgressRing`, `FillBar`, `BarPulse`, `Sparkline`, `MiniStat`, `BrandPhoto`.
**Glas**: `rgba(120,122,128,0.14)` + `blur(48px) saturate(1.4)` + witte rand/inset; ivory tekst op de foto; accent-lijntje boven de glass-card (uit `--tile-accent`).

## 2 · Focus-kleuren (nieuw, uit de referentiebeelden)

| Rol | Hex | Token |
|-----|-----|-------|
| Deep / accent (burgundy) | `#7a3340` ≈ | `--d-focus-deep: 350 40% 28%` |
| Light / soft (cream) | `#f0ead8` ≈ | `--d-focus-light: 46 28% 88%` |
| Urgent | `#d5e24a` | `--d-focus-urgent` |
| Concrete / beton (structuur) | `#a8a8a8` | in widget-glas/overlay |
| Geborsteld metaal (paneel) | `#b8b8b8–#d0d0d0` | overlay/reflectie |
| Olijf (tweed, secundair) | `#5c6344` | secundair accent |

`accentFor("focus")` levert automatisch burgundy + cream — bestaande primitieven werken direct.
Materialiteit: zacht textiel vs. koud beton/metaal → foto-shell = Focus-beeld, glass-card = geborsteld-metalen vlak met burgundy accent-lijn. Hoge negative space, verticale lijnen, asymmetrie/peek.

## 3 · Focus-beelden (toegevoegd aan `IMAGES`, `focus*`)

`focusPillar` · `focusCarrels` · `focusConcreteHand` · `focusMetalGloves` · `focusSuspended` · `focusMoodboard` · `focusLeanPanel` · `focusCorridor` · `focusAlcove` · `focusCoat` · `focusOliveYarn` · `focusTrousers`.

## 4 · Per-widget ontwerp (naar functie)

| # | Widget | Code | Header | Signatuur-element | Foto |
|---|--------|------|--------|-------------------|------|
| 01 | **Agenda** — What's Happening? | P·16x9·L·SIDE | agenda | dag-tijdlijn + bewegende "now"-marker; volgende afspraak badge | `focusPillar` |
| 02 | **Tasks** — To Do! | P·2x3·B·SIDE | tasks | afvinkbare checklist + staven (active→burgundy), zoals What Matters | `focusCarrels` |
| 03 | **Projects** — What I'm Building. | G·3x2·R·SIDE | tasks | XL CountUp + project-rij met voortgangsblokken | `focusConcreteHand` |
| 04 | **Email** — Online Postoffice. | P·9x16·B·SIDE | social | unread-telling + afzender-stapel; urgent geel | `focusMetalGloves` |
| 05 | **WhatsApp** — Who's Texting? | P·1x1·B·STRIP | social | bericht-bellen + laatste chat preview | `focusSuspended` |
| 06 | **Knowledge** — What I Know. | G·4x3·L·SIDE | energy | notitie/polaroid-kaarten op "mood board" | `focusMoodboard` |
| 07 | **Documents** — Files to Share. | P·4x3·R·SIDE | tasks | bestandstegels + CountUp; type-pictogrammen | `focusLeanPanel` |
| 08 | **People** — People Around Me. | P·3x4·B·SIDE | social | twee figuren achter paneel; relatie-ring | `focusCorridor` |
| 09 | **TimeTracker** — Where My Time Goes. | G·21x9·L·SIDE | briefing | klok + uren-blokken vandaag; aftelcurve | `focusAlcove` |

Elke widget: foto-shell = Focus-beeld, glass-card = de data, één signatuur-element, accent uit `domain="focus"`, klik opent het bijbehorende module-paneel.

## 5 · Galerij

`/widgets-focus` — masonry `columns-1 lg:columns-2`, ware dashboard-grootte, label-regels `NN · NAAM — code · signatuur`. Spiegel van `/widgets-giulia`.

## 6 · Aanpak

Herbruik de laag-primitieven 1-op-1 met `domain="focus"`, kies per widget vorm/plaatsing + header-embleem + signatuur, koppel Focus-foto, behoud data-wiring (zelfde entiteiten/hocks als de huidige widgets).