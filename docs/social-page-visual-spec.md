# SOCIAL PAGE — VOLLEDIGE VISUELE SPECIFICATIE

*(Bron-document, bewaard als referentie voor de redesign — afvinklijst onderaan.)*

De Social Page is een volledig visueel managementsysteem. De gebruiker moet hier niet door lijsten met records werken. Data moet worden vertaald naar: kaarten, grafieken, tijdlijnen, relationship maps, netwerken, visuele states, tijdblokken, clusters, meters, chips, interactieve objecten, drag & drop, inline editing, detail overlays, connected visualisations. De pagina moet aanvoelen als een levende visualisatie van Salvo's sociale wereld, niet als een CRM voor vrienden.

## 01 — OVERVIEW · THE WHOLE SOCIAL SYSTEM
- **1.1 Social State** — grote visuele state indicator (CONNECTED / ACTIVE / QUIETER THAN USUAL / A LOT HAPPENING / OPEN / BALANCED / OVERLOADED / UNKNOWN) met subtiel veranderende vorm. ✅ ademende orb + concentrische straalringen
- **1.2 Social Activity** — visuele tijdreeks deze week (intensiteit, type interactie, betekenisvolle momenten, gepland vs spontaan). ✅ stacked bars + type-legende
- **1.3 Personal Baseline** — current vs baseline golf → verdict MORE ACTIVE / ON PACE / QUIETER. ✅
- **1.4 Social Space** — horizontale dag-tijdlijn met blokken (work/social/free/recovery/protected). ✅ DayTimeline
- **1.5 Important People** — horizontale People Cards (avatar, naam, state, laatste meaningful contact, verandering, mini activity indicator), klik → Relationship Detail. ✅
- **1.6 Upcoming Social** — visuele tijdlijn (dag+tijd, titel, persoon, status-chip). ✅
- **1.7 Opportunities** — aparte visuele zone + PLAN SOMETHING. ✅
- **1.8 Notable Changes** — visuele change-chips (↑↓→). ✅
- **1.9 Quick Management** — add person, add moment, create intention, create plan, add time (inline forms/overlays). ✅ moment + intention modals

## 02 — RELATIONSHIPS · WHO MATTERS?
- **2.1 Relationship Map** — interactieve network graph (nodes=people, edges=relaties, clusters, orbit). ✅ d3-force canvas netwerk
- **2.2 Map Interaction** — hover (naam, state, last meaningful, activity), click (focus), dubbelklik (detail), drag (alleen visueel). ✅ hover popover + click → drawer
- **2.3 Relationship Clusters** — groepen herkennen + filter-chips. ✅ cluster-filters
- **2.4 Relationship State** — visuele state per persoon. ✅ via node-kleur/gloed
- **2.5 Relationship Signals** — compacte signal bar (connection/recency/rhythm/reciprocity/quality/change — dots, geen score). ✅ SignalDots in popover + drawer
- **2.6 Relationship Rhythm** — typical vs current golf. ✅ RhythmWave in drawer
- **2.7 Relationship Timeline** — 6-maands timeline per persoon met bron-iconen. ✅ RelationshipTimeline in drawer
- **2.8 Relationship Context** — visueel (type, shared projects/hobbies). ✅ pattern note in drawer
- **2.9 Relationship Patterns** — visuele analyse (recurring/change/deviation/context). ⚠️ pattern note getoond, sankey/chord nog te bouwen
- **2.10 Relationship Management** — inline type/context/importance/rhythm aanpassen, intention/plan/moment maken. ✅ type + (basis)

## 03 — SOCIAL PULSE · WHAT'S HAPPENING?
- **3.1 Current Pulse** — grote centrale visualisatie (vorm verandert met activiteit) + dots + counts. ✅ SocialStateOrb
- **3.2 Activity Timeline** — interactieve timeline vandaag met bron-iconen (WhatsApp/Email/Calendar/SocialPlan/manual). ✅
- **3.3 Meaningful Moments** — visuele kaarten (openen/corrigeren/toevoegen/verwijderen/koppelen). ✅ kaarten + detail drawer (openen; koppelen/corrigeren nog open)
- **3.4 Social Intensity** — periode-schakelbare tijdreeks (vandaag/week/maand/langer) area/stream. ✅ nivo line + periode-toggle
- **3.5 Social Heatmap** — 3-4 weken × 7 dagen, patronen zichtbaar. ✅ echarts heatmap (4 weken)
- **3.6 Invitations** — aparte laag (van wie/wat/wanneer/status/deadline + accept/decline/respond/convert). ⚠️ getoond als lijst; acties nog te bouwen (approval-flow)
- **3.7 Social Change** — visuele week-over-week vergelijking (+/-%). ✅

## 04 — SOCIAL PLANNER · WHAT SHOULD HAPPEN?
- **4.1 Social Intentions** — losse intention cards met PLAN-knop. ✅
- **4.2 Opportunity Field** — open time + aandachtscontact + capacity → SOCIAL OPPORTUNITY als connection tussen signalen. ✅ OpportunityDiagram
- **4.3 Proposed Plans** — kaarten met CONFIRM/EDIT/DISMISS. ✅ CONFIRM + DISMISS (EDIT open)
- **4.4 Planning Board** — drag&drop (INTENTIONS → POSSIBILITIES → PROPOSED → CONFIRMED → COMPLETED). ✅ SocialPlanBoard
- **4.5 Social Calendar Overlay** — relevante agenda-ruimte met social-opportunity marking. ✅ week-grid
- **4.6 Social Load** — toekomstige weekbelasting + beschikbare ruimte. ✅

## 05 — PERSONAL TIME · DO I HAVE SPACE?
- **5.1 Time Field** — horizontale tijdlijn met blokken (free/social/recovery/protected/work). ✅ TimeField
- **5.2 Time Types** — duidelijke visuele states. ✅
- **5.3 Personal Time Blocks** — interactief (edit/move/resize/protect-unprotect/delete) met drag&drop. ✅ edit + delete (move/resize via board, nog open)
- **5.4 Available Space** — grote visuele meter (geen simpele %, engine houdt rekening met alles). ✅ count-up meter
- **5.5 Capacity** — HIGH/LOW meter uit How I'm Doing, als context. ✅
- **5.6 Space vs Capacity** — 4 situaties (HH→opportunity, HL→recovery, LH→load, LL→protect). ✅ QuadrantMatrix
- **5.7 Conflict Detection** — protected-recovery ↔ social-plan botsing visueel (⚠ CONFLICT) + acties. ✅ conflict banner + dismiss (move plan/recovery nog open)

## 06 — GECOMBINEERDE VISUAL INTELLIGENCE
- Cross-object opportunity-diagram (person → state + open time + capacity → SOCIAL OPPORTUNITY). ✅ OpportunityDiagram in Planner

## 07 — LIVE DATA CONNECTIONS
- Realtime: nieuwe WhatsApp/email/SocialPlan/CalendarEvent → visuals herkalkuleren. ✅ base44 realtime subscriptions in SocialPage

## 08 — HOW I'M DOING CONNECTION
- Capacity-context aan Personal Time/Planner. ✅ capacityFromCheckIn in beide secties

## 09 — VISUELE INTERACTIEPRINCIPES
- Blokken/dots/netwerk boven numerieke waarden. ✅

## 10 — FILTERS
- Per sectie die visuals echt veranderen (time period, relationship type/state, activity, invitations, plans, protected time). ⚠️ cluster-filter in Relationships + periode-toggle in Pulse; verdere filters nog open

## 11 — DETAIL VIEWS
- Overlays/drawers voor Person/Moment/Plan/Block/Invitation/Pattern. ✅ Person (bestaand) + Moment + Block (nieuw); Plan/Invitation/Pattern nog open

## 12 — INLINE MANAGEMENT
- Klik-op-waarde correctie, sleep-plan, klik-lege-zone intention, + moment. ⚠️ moment + intention modals; klik-op-waarde/sleep-plan nog open

## 13 — EMPTY STATES
- Visueel (OPEN SPACE / YOUR NETWORK / QUIET), geen kale tekst. ✅ EmptyState-component

## ONTWERPSTANDAARD
- Licht OS-glas over foto's; één overkoepelende glas-container; framer-motion enter; count-up; strokeDashoffset-tekenen; balken-groei; rAF live; custom herstijlde charts; per metric eigen mini-viz; grote headings + tracking labels + ghost-index; whileHover/active:scale; geanimeerde empty states. ✅

## NOG OPEN (vervolgstappen)
1. §2.9 Relationship Patterns als d3 sankey/chord-stream visualisatie
2. §3.6 Invitation-acties (accept/decline/respond/convert via approval-flow)
3. §4.3 Proposed Plan EDIT-knop
4. §5.3 Block move/resize drag&drop naar andere dag
5. §5.7 Conflict move-plan/move-recovery acties
6. §10 Aanvullende sectie-filters (relationship state, activity, protected time)
7. §11 Plan/Invitation/Pattern detail drawers
8. §12 Klik-op-waarde inline correctie + sleep-plan-naar-tijd