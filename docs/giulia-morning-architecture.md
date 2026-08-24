# GIULIA — Good Morning / Morning Briefing / What Matters

**Functionele architectuur — vastgelegd vóór UI-ontwerp.**

Dit document is de source of truth voor drie samenhangende maar **technisch
gescheiden** GIULIA-systemen. De UI wordt pas ontworpen nadat deze grenzen
vaststaan, zodat de interface geen beslissingen gaat maken die in de
architectuur thuishoren.

---

## 0. Kernprincipe: drie zelfstandige systemen

```text
GIULIA
│
├── GOOD MORNING!        ── WakeSession
├── MORNING BRIEFING     ── BriefingSession
└── WHAT MATTERS?        ── CalendarEvent + Task (+ projectcontext)
```

**Regel:** deze systemen mogen elkaar logisch openen, maar **niet in elkaar
genest worden**.

- Good Morning is **niet** de parent van Morning Briefing.
- Morning Briefing is **niet** de parent van What Matters.
- Elk systeem heeft eigen state, eigen sessie en eigen interacties.
- Alle drie lezen uit dezelfde OS-data-laag; geen systeem bezit de data van een
  ander.

---

## 1. GOOD MORNING!

Volledig ochtend-opstart-systeem. Begeleidt de gebruiker van
**net wakker → klaar voor de dag**.

### 1.1 Fullscreen experience

De Wake Experience opent **fullscreen** en is gedurende de sessie de enige
toegankelijke interface:

- geen terug naar dashboard
- geen andere widgets
- geen andere panels
- alle fases vormen één doorlopende sessie
- blijft actief tot het proces klaar is

### 1.2 Fases

```text
GOOD MORNING
│
├── WAKE
├── ORIENT
├── GET UP
├── ROUTINE
└── READY
```

#### WAKE
Fullscreen wekker.
- sfeervol ontwakingsscherm, geleidelijk lichtende achtergrond
- voice recognition direct actief
- gesproken commando's: `"snooze"`, `"more minutes"`, `"awake"`
- snooze wordt geregistreerd
- **Wake Session start hier**

#### ORIENT
GIULIA oriënteert de gebruiker op de ochtend. Gebruikt:
- huidige tijd
- geplande wektijd
- eerste afspraak
- beschikbare tijd
- travel/preparation context indien relevant

Bepaalt een ochtendstatus: `quiet` · `appointment` · `busy` · `running tight`.

**Geen briefing, geen volledige dagplanning.**

#### GET UP
Begeleide fysieke overgang uit bed, één stap tegelijk:

```text
SIT UP → FEET ON THE FLOOR → I'M UP
```

Voice en interface zijn beide bruikbaar.

#### ROUTINE
Gebruikt `MorningRoutineStep`. Voorbeelden: water, badkamer, koffie,
aankleden, ontbijt.

Per step minimaal: volgorde, duur, verplicht/optioneel, status.

Wanneer de ochtend `running tight` is, mag GIULIA **optionele** stappen
automatisch overslaan.

#### READY
Eindstatus. Betekent: wakker · uit bed · routine afgehandeld · klaar voor de
dag. Daarna verlaat de gebruiker de fullscreen experience → dashboard.

**READY is geen briefingfase.**

### 1.3 Data

| Entiteit | Rol |
|---|---|
| `MorningSettings` | Configuratie (wake time, wake style, max snoozes, voice enabled, routine config, briefing/transition preference) |
| `MorningRoutineStep` | Persoonlijke ochtendroutine (template + per-step status) |
| `WakeSession` | Eén uitgevoerde ochtendsessie (zie 1.4) |

#### 1.4 WakeSession-velden (architectuur)

```text
WakeSession
├── date
├── scheduled_wake_time
├── actual_wake_time
├── snooze_count
├── snooze_duration
├── wake_duration
├── orient_duration
├── get_up_duration
├── routine_duration
├── routine_steps_completed
├── routine_steps_skipped
├── session_status
└── completion_time
```

Doel: patronen in ochtendgedrag herkennen.

> **Legacy-koppeling (te verwijderen bij rebuild):** de huidige `WakeSession`
> bevat nog een `phase: "briefing"` en `briefing_started`. Volgens deze
> architectuur hoort briefing **niet** in Good Morning. Deze velden worden
> verwijderd zodra de fullscreen Wake Experience wordt herbouwd (fase 01).

---

## 2. MORNING BRIEFING

Zelfstandig systeem. **Geen fase van Good Morning.**

Kan logisch na Good Morning worden geopend, maar heeft eigen state en eigen
interacties.

### 2.1 Doel

GIULIA's interactieve kennismaking met de dag. Informatie als **kaarten**:

```text
CARD ← SWIPE → CARD ← SWIPE → CARD …
```

Kaarten kunnen komen uit: Calendar · Tasks · Projects · Email · WhatsApp ·
Administration · GIULIA Insights.

**Morning Briefing bepaalt zelf** welke informatie als briefing-item wordt
aangeboden (via `BriefingItem` als bron).

### 2.2 Interactie per kaart

- links swipen
- rechts swipen
- openen/tappen
- detail tonen
- eventueel actie aanbieden

### 2.3 Eigen sessie — `BriefingSession`

```text
BriefingSession
├── date
├── cards_presented
├── cards_viewed
├── cards_swiped_left
├── cards_swiped_right
├── cards_opened
├── actions_taken
└── completed
```

Doel: leren welke informatie de gebruiker relevant vindt.

### 2.4 Belangrijk

- hoeft niet via Good Morning gestart te worden
- kan zelfstandig geopend worden
- heeft **geen** invloed op de WakeSession
- is geen onderdeel van de ochtendroutine
- kan ná Good Morning aangeboden worden als volgende ervaring

---

## 3. WHAT MATTERS?

Zelfstandig systeem. De concrete briefing en operationele planning van de dag.

Centrale vraag:

> **Wat gebeurt er vandaag en wat moet ik daadwerkelijk doen?**

Gebruikt: `CalendarEvent` · `Task` · deadlines · projectcontext · preparation
time · travel time · prioriteiten · actuele status/progress.

### 3.1 Onderscheid met Morning Briefing

| | Vraag | Actief |
|---|---|---|
| **Morning Briefing** | *What does GIULIA want me to know?* | sessie-gebonden |
| **What Matters?** | *What does my day actually require?* | **hele dag** |

### 3.2 Hele dag actief

What Matters verandert wanneer:

- een taak wordt afgerond
- een afspraak begint
- een afspraak uitloopt
- een deadline dichterbij komt
- een taak verschuift
- nieuwe informatie binnenkomt
- de planning verandert

---

## 4. Relatie tussen de drie

```text
GOOD MORNING!
      │
      │ READY
      ▼
DASHBOARD
      │
      ├── MORNING BRIEFING
      │
      └── WHAT MATTERS?
```

- Technisch drie aparte systemen.
- Mogen elkaar logisch openen.
- **Niet in elkaar nesten.**
- Lezen dezelfde OS-data-laag; geen systeem bezit het data van een ander.

---

## 5. Dashboard-widget

Na afronden van Good Morning verschijnt de gebruiker weer op het dashboard.
De **Good Morning! Widget** toont dan een **samenvatting van de laatst
voltooide WakeSession** — niet de fullscreen Wake-interface opnieuw.

Voorbeeldwidget-inhoud:

```text
GOOD MORNING!

READY AT 08:04

WAKE ─ GET UP ─ ROUTINE ─ READY
07:30   07:37     07:42    08:04

1× SNOOZE · 34 MIN
4/4 ROUTINE STEPS

YOUR MORNING
Usually ready in ~28 min

WAKE MODE
07:30 · Weekdays · Voice ON
```

De widget is dus: **post-session summary + toegang tot Good Morning
settings/page**. De fullscreen Wake Experience zelf bestaat alleen tijdens de
daadwerkelijke ochtendopstart.

---

## 6. Ontwerpvolgorde

1. **01 → GOOD MORNING!** — fullscreen Wake Experience, daarna dashboard Panel.
2. **02 → MORNING BRIEFING** — kaartgebaseerde briefing.
3. **03 → WHAT MATTERS?** — concrete dagplanning.
4. Pas daarna: **transities tussen de drie**.

Deze volgorde houdt de systemen inhoudelijk schoon en voorkomt dat de UI
voortijdig architecturale beslissingen gaat maken.