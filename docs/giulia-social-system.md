# GIULIA OS — SOCIAL SYSTEM

## Architectuur, Data Model, Intelligence & Data Flow

> **Permanente referentie.** Dit document is de bron van waarheid voor het Social-systeem binnen LIFE. Elke Social-gerelateerde uitvoering (entiteiten, socialEngine, backend-functies, workflows, UI) moet hiermee consistent zijn. Wijzig de architectuur hier eerst, dan de code.

---

# 01 — DOEL VAN HET SOCIAL SYSTEEM

Social is één geïntegreerd systeem binnen **LIFE**. Het bestaat niet uit losse functies (Social Pulse, Social Planner, Personal Time) maar uit lagen binnen één sociaal systeem.

GIULIA registreert niet alleen wat er sociaal gebeurt, maar begrijpt: wie belangrijk is, hoe relaties zich ontwikkelen, wat er nu gebeurt, welke mogelijkheden/verplichtingen bestaan, welke intenties Salvo heeft, hoeveel ruimte er is, hoe sociale activiteit zich verhoudt tot energie/capaciteit/werk/herstel, en welke patronen betekenisvol zijn.

> **Relationship + Connection + Intention + Time System.**

Centrale vraag: **"Hoe staat je sociale wereld ervoor, wat gebeurt er, wat betekent het en wat zou nu relevant kunnen zijn?"**

Social is niet normatief: meer activiteit ≠ beter, minder contact ≠ probleem, een vrije avond hoeft niet gevuld te worden. Interpretatie gebeurt altijd t.o.v. persoonlijke patronen, context, intenties, tijd en actuele toestand.

---

# 02 — SOCIAL ARCHITECTUUR

```text
SOCIAL
├── 2.1 RELATIONSHIPS      → WHO MATTERS?
├── 2.2 SOCIAL PULSE       → WHAT'S HAPPENING?
├── 2.3 SOCIAL PLANNER     → WHAT COULD HAPPEN?
└── 2.4 PERSONAL TIME      → DO I HAVE SPACE?
```

Alle vier gebruiken dezelfde Social Data Layer — geen vier databases.

## 2.1 RELATIONSHIPS — WHO MATTERS?
Relationele fundering: wie de mensen zijn, hun betekenis, hoe de verbinding zich ontwikkelt. Bron: `Contact` + WhatsApp/Email/Calendar/SocialPlans/SocialMoments/Memory/projecten/hobby's. Eigenaar van: Relationship Map, Relationship State, Relationship Health, Relationship Patterns, relationship context/history/intelligence. Relationship Map en Patterns horen hier, niet bij Social Pulse.

## 2.2 SOCIAL PULSE — WHAT'S HAPPENING?
Actuele sociale toestand: Social Activity, Social Moments, meaningful interactions, open invitations, active/upcoming SocialPlans, social intensity/quietness, recente veranderingen. Niet verantwoordelijk voor Relationship Map/Health/Patterns.

## 2.3 SOCIAL PLANNER — WHAT COULD HAPPEN?
Kijkt vooruit — niet "wat staat in mijn agenda" (Calendar) maar "wat zou Salvo sociaal willen laten gebeuren". Werkt met Social Intentions, Social Opportunities, open invitations, relationship context, recente Pulse, patterns, beschikbare tijd, Personal Time, Calendar, energie/capaciteit, bestaande SocialPlans. Een voorstel is geen commitment.

## 2.4 PERSONAL TIME — DO I HAVE SPACE?
Ruimte-laag van Social (voorheen SELF-laag, nu in LIFE/Social). Gebruikt `PersonalTimeBlock` (rest/recovery/free/protected). Bepaalt niet wat Salvo moet doen, alleen hoeveel werkelijke ruimte er is en wat al beschermd is. **Free ≠ available for social ≠ should be filled.**

---

# 03 — SOCIAL DATA MODEL

## 3.1 Personen — `Contact` (persoon). Relationship-data = de verbinding met die persoon.

## 3.2 Relationships
Aard van de relatie, belang, context, contactritme, laatste betekenisvolle interactie, gewenste frequentie, state, veranderingen, patronen.

### Relationship Health — géén score.
```text
RELATIONSHIP HEALTH
├── CONNECTION  ├── RECENCY  ├── RHYTHM  ├── RECIPROCITY
├── QUALITY     ├── CONTEXT  ├── INTENTION  └── CHANGE
```
Niet elk signaal moet altijd beschikbaar zijn. Ontbrekende data → geen aannames.

## 3.3 Social Activity
Wat er daadwerkelijk gebeurt (WhatsApp, Email, Calendar, handmatig, SocialPlan, andere OS-events), geregistreerd via de centrale Activity-laag.

## 3.4 Social Moments
Een betekenisvol sociaal moment (lang gesprek, diner, onverwacht bezoek, belangrijke ontmoeting, bijzondere gebeurtenis). Niet elke interactie wordt een Social Moment — geen opblazen van trivialiteit.

## 3.5 Social Patterns
Afgeleid uit historische data: contactritme, structureel actieve/stillere relaties, vaak uitgestelde mensen, terugkerende context, groeps-/initiatiepatronen, veranderingen in intensiteit. Types: Pattern, Pattern Shift, Recurring Pattern, Deviation, Baseline vs Current.

## 3.6 Social Intentions
Iets dat Salvo wil/mogelijk wil laten gebeuren (someone see/call/invite, reconnect, respond to invitation, spend time socially, spontaneous activity, protect social time, alone time). Geen agenda-afspraak.

## 3.7 Social Plans
```text
Dinner with Sophie
status: proposed
date: Saturday
participants: Sophie
```
States: proposed → planned → confirmed → completed / cancelled. Pas gekoppeld aan Calendar wanneer bevestigd.

## 3.8 Personal Time Blocks
`PersonalTimeBlock` types: rest, recovery, free, protected. Gebruikt door Personal Time, Social Planner, FOCUS planning, LIFE balance.

## 3.9 Social Insights
Afgeleide observatie, niet ruwe data. Bijv. "Your social activity has been increasing for three weeks." Opgeslagen in de centrale Insight-laag.

---

# 04 — SOCIAL DATA FLOW

## 4.1 Data Input
CONTACTS, WHATSAPP, EMAIL, CALENDAR, SOCIAL PLANS, PERSONAL TIME, HOW I'M DOING, MEMORY, HOBBIES, PROJECTS, MANUAL INPUT. Niet elke bron wordt hetzelfde geïnterpreteerd.

## 4.2 Data Normalisatie
```text
WhatsApp: "Zin om zaterdag te eten?"
→ Person: Sophie · Interaction: WhatsApp · Intent: invitation · Possible SocialPlan: Saturday dinner
```
Maakt NIET automatisch een CalendarEvent. Uitnodiging ≠ bevestigde afspraak.

## 4.3 Activity Layer
```text
WhatsApp received → Activity created → Social interpretation
```
Gebruikt de centrale event-laag (emitEvent/propagate) — geen eigen event-versies per systeem.

## 4.4 Relationship Processing
```text
Activity → Contact identified → Relationship context loaded → Relationship data updated
```
Kijkt naar recent contact, normaal ritme, meaningful interactions, bestaande context, eventuele verandering.

## 4.5 Social Pulse Processing
```text
5 meaningful interactions + 2 upcoming plans + 1 open invitation → Social Pulse: ACTIVE
very little activity + below personal baseline → Social Pulse: QUIETER THAN USUAL
```

## 4.6 Relationship Intelligence
```text
PERSONAL BASELINE → CURRENT STATE → CHANGE
```
Vergelijking met persoonlijke baseline, nooit een universele norm. Kan leiden tot "Relationship Pattern Shift", nooit automatisch tot "unhealthy".

## 4.7 Social Opportunity Detection
```text
Relationship + Social Pulse + Personal Time + Calendar + Capacity + Intentions
→ Sophie important + 24 dagen geen contact + zaterdagmiddag vrij + capacity goed + geen conflict
→ OPPORTUNITY: "Saturday afternoon is open. You haven't seen Sophie in a while."
```
Een mogelijkheid, geen taak.

## 4.8 Social Plan
```text
Opportunity → Salvo accepts → SocialPlan created → status = proposed/planned
```

## 4.9 Calendar
```text
SocialPlan confirmed → CalendarEvent (domain = life)
```

## 4.10 Personal Time Update
```text
CalendarEvent created → available time recalculated → Personal Time updated
```

## 4.11 Capacity Input
How I'm Doing beïnvloedt Personal Time en Social Planner. Lage capaciteit → protect recovery → reduce social suggestions. Goede capaciteit + ruimte → social opportunity possible. **High energy ≠ automatisch "go see people."**

---

# 05 — RELATIONSHIP INTELLIGENCE

## 5.1 Relationship States (beschrijvend, niet diagnostisch)
ACTIVE, CLOSE, QUIET, QUIETER THAN USUAL, EMERGING, RECONNECTING, CHANGING, UNKNOWN.

## 5.2 Relationship Map
Volledig binnen Relationships. Toont personen, categorie, nabijheid, gedeelde context, verbindingen, clusters, recente activiteit, veranderingen. Vormen: nodes, connections, clusters, orbit, network graph, timeline. De positie is een datavisualisatie — nooit letterlijke psychologische afstand.

## 5.3 Relationship Patterns
Pattern, Pattern Shift, Recurring Pattern, Deviation, Baseline vs Current.

## 5.4 Relationship Health
Samengestelde interpretatie: connection + recency + rhythm + reciprocity + quality + context + intention + change. Eén signaal veroorzaakt nooit alleen een negatieve conclusie.

---

# 06 — SOCIAL PULSE INTELLIGENCE

## 6.1 Social Activity
meaningful interactions, social activity, active plans, upcoming plans, open invitations, recent Social Moments, huidige intensiteit, rust, verandering door tijd.

## 6.2 Social Intensity
Tijdreeks, vergeleken met persoonlijke baseline — geen kwaliteitsmaatstaf.

## 6.3 Social Pulse States
CONNECTED, ACTIVE, QUIETER THAN USUAL, A LOT HAPPENING, OPEN, BALANCED, OVERLOADED, UNKNOWN.

---

# 07 — SOCIAL PLANNER INTELLIGENCE

## 7.1 Social Opportunities
Relationship patterns + Social Pulse + Calendar + Personal Time + Capacity + Intentions → **iets dat mogelijk betekenisvol kan zijn**, niet iets dat Salvo moet doen.

## 7.2 Social Suggestions
"You haven't seen Sophie in a while and Saturday is open." Wordt pas actie wanneer Salvo dat wil.

## 7.3 External Communication
```text
Suggestion → draft message → create_approval → Waiting on You
```
GIULIA verstuurt nooit zelfstandig WhatsApp/email.

## 7.4 Social Planning
```text
INTENTION → SOCIAL PLAN → CONFIRMATION → CALENDAR EVENT
```
Voorstel ≠ commitment.

---

# 08 — PERSONAL TIME & SOCIAL CAPACITY

## 8.1 Beschikbare tijd — vrije/bezette/protected/recovery/social-commitment blokken.
## 8.2 Beschermde tijd — mag niet zomaar opgeofferd worden; GIULIA signaleert conflicten, lost niet automatisch op.
## 8.3 Social Capacity
```text
available time + current capacity + existing commitments + recovery needs + social load
```
Niet hetzelfde als "agenda is leeg".

---

# 09 — CROSS-SYSTEM DATA FLOW

- **9.1 Social → Calendar**: SocialPlan confirmed → CalendarEvent.
- **9.2 Calendar → Social**: CalendarEvent → social commitment → Personal Time herzien → availability updated.
- **9.3 Social → Focus**: sociale commitments beïnvloeden werktijd; hoge sociale belasting kan herstelruimte verkleinen.
- **9.4 Focus → Social**: zwaar werkschema → minder tijd → minder sociale kansen. Betekent niet dat werk automatisch moet wijken.
- **9.5 How I'm Doing → Social**: state/energy/capacity/mood/needs beïnvloeden Planner, Personal Time, LIFE balance.
- **9.6 Social → Insights**: patroon uit meerdere gegevens → Insight.
- **9.7 Social → Memory**: Activity (wat gebeurde) ≠ Memory (wat blijft relevant) ≠ Insight (wat leert GIULIA) ≠ SocialPlan (wat willen we laten gebeuren).
- **9.8 Social → Notifications**: alleen wanneer Salvo iets daadwerkelijk moet zien (bv. wachtende uitnodiging), niet voor pure data (bv. "18 dagen niet gesproken").

---

# 10 — SOCIAL → GIULIA INTELLIGENCE

GIULIA is geen vijfde module maar de intelligentielaag boven de vier onderdelen: Relationships + Social Pulse + Social Planner + Personal Time + overige LIFE/FOCUS-data → Opportunity, Pattern, Change, Attention, Conflict, Insight — alleen wanneer de onderliggende data voldoende sterk is.

---

# 11 — VOLLEDIGE SOCIAL DATAFLOW

```text
PEOPLE → RELATIONSHIPS → (WhatsApp/Email/Calendar) → SOCIAL PULSE → (PATTERNS + CURRENT STATE)
→ SOCIAL PLANNER → SOCIAL INTENT → SOCIAL PLAN → CONFIRMED → CALENDAR → PERSONAL TIME
   ↑ ENERGY/CAPACITY ← HOW I'M DOING
→ GIULIA → INSIGHT / MEMORY / NOTIFICATION
```

---

# 12 — DATA OWNERSHIP

| Data | Eigenaar |
|---|---|
| Person | Contact |
| Relationship context/state/health/pattern/map | Relationships |
| Social activity/moment/intensity | Social Pulse |
| Social intention/opportunity/SocialPlan | Social Planner |
| Calendar commitment | Calendar |
| Available/protected/recovery time | Personal Time |
| Energy/capacity | How I'm Doing |
| Long-term fact | Memory |
| Cross-domain pattern | Insight |
| What happened | Activity |

**Niet dezelfde informatie op meerdere plaatsen opnieuw berekenen.**

---

# 13–19 — ACHTERGRONDPROCESSEN (SOCIAL BACKGROUND ENGINE)

| Proces | Trigger | Wat doet het? | Output |
|---|---|---|---|
| Social Activity Ingestion | WhatsApp/Email/Calendar event | Detecteert sociale interactie | Activity |
| Relationship Update | Nieuwe relevante Activity | Update contact/relationship context | Relationship update |
| Relationship Rhythm Check | Scheduled | Vergelijkt last contact met persoonlijk ritme | Pattern/state |
| Relationship Pattern Analysis | Scheduled | Analyseert historische relatie-data | Pattern/Insight |
| Social Pulse Update | Activity/Calendar/SocialPlan | Herberekent actuele sociale toestand | Pulse state |
| Social Intensity Analysis | Scheduled | Vergelijkt activiteit met baseline | Trend/Pattern |
| Social Opportunity Detection | Scheduled + event | Zoekt combinatie relatie+tijd+intentie | Opportunity |
| Invitation Detection | WhatsApp/Email | Detecteert uitnodigingen | Social intention/pending invitation |
| Social Plan Management | User/GIULIA action | Maakt/update/cancel SocialPlan | SocialPlan |
| Calendar Propagation | SocialPlan confirmed | Maakt/koppelt CalendarEvent | CalendarEvent |
| Calendar Cancellation Propagation | Event cancelled | Zet gekoppeld SocialPlan op cancelled | SocialPlan update |
| Personal Time Recalculation | Calendar change | Herberekent beschikbare ruimte | Personal Time state |
| Social Capacity Check | Daily State/Calendar | Combineert capaciteit+tijd+social load | Capacity signal |
| Social Balance Analysis | Scheduled | Vergelijkt Social met LIFE/FOCUS | Insight |
| Social Attention Guard | Scheduled | Zoekt sociale zaken die aandacht verdienen | Notification/Opportunity |
| Social Pattern Analysis | Scheduled | Langetermijnanalyse | Insight |
| Social Memory Candidate | Event/pattern | Detecteert potentieel duurzame info | Memory candidate |
| Social Cleanup/Deduplication | Event/scheduled | Voorkomt dubbele records | Clean data |

Deze workflows draaien op de achtergrond zonder handmatige trigger.

---

# 20 — SOCIAL AUTOMATION RULES (TRUST MODEL)

**GIULIA mag autonoom**: Activity registreren, bestaande Relationship-data bijwerken, Social Pulse bijwerken, patronen analyseren, Insights creëren, Opportunities detecteren, Personal Time herberekenen, SocialPlans intern bijwerken bij bestaande systeemtrigger, Calendar ↔ SocialPlan synchroniseren, data dedupliceren, informatie categoriseren.

**GIULIA mag niet autonoom**: WhatsApp/email sturen, iemand uitnodigen, externe agenda-uitnodiging sturen, een sociale afspraak namens Salvo bevestigen, een Social Opportunity als verplichting behandelen.

Externe acties lopen via **Approval** — onderdeel van het centrale trust-model.

---

# 21 — SOCIAL → CENTRAL EVENT ENGINE

```text
Social action → emitEvent() → Activity → propagate() → affected entities → Insight/notification/UI update
```
Gebruikt de bestaande centrale pipeline (`base44/shared/eventEngine.ts`) — geen eigen mini-event-systeem.

---

# 22 — SOCIAL → REALTIME UI

```text
SocialPlan confirmed → Propagation → CalendarEvent → Activity → realtime subscription → Social Widget → Social Panel
```
UI hoeft niet handmatig geverst te worden — realtime subscriptions + `useLearningSync`.

---

# KERNPRINCIPES

1. Contact frequency ≠ Relationship Health.
2. Free ≠ should be filled.
3. More social ≠ better.
4. Relationship Map ≠ psychological truth.
5. Suggestion ≠ task.
6. Intention ≠ Calendar event.
7. Activity ≠ Memory.
8. Data ≠ Insight.
9. Low capacity ≠ no social life.
10. GIULIA does not invent context — ontbrekende data blijft `UNKNOWN`.

## De centrale logica

- **Relationships** → Who matters?
- **Social Pulse** → What's happening?
- **Social Planner** → What could happen?
- **Personal Time** → Do I have space?
- **GIULIA** → What matters about all of this right now?