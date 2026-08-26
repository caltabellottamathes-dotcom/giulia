// checkInConfig.js — drie check-in momenten (10:00 / 16:00 / 20:00) met per
// moment een eigen set van 5 vragen. Data-gedreven: CheckInFlow leest deze
// config en rendert de juiste input-types. GIULIA slaat gestandaardiseerde
// velden op maar laat Salvo natuurlijk antwoorden.

export const WINDOWS = {
  orient: {
    key: "orient",
    label: "ORIENT",
    time: "10:00",
    subtitle: "Hoe kom ik mijn dag binnen?",
    accent: "#b1bec6",
    questions: [
      {
        key: "mood", prompt: "Hoe voel je je op dit moment, emotioneel?", type: "single",
        options: ["Rustig", "Goed", "Blij", "Energiek", "Nieuwsgierig", "Neutraal", "Onrustig", "Gespannen", "Verdrietig", "Geïrriteerd", "Overprikkeld", "Moe", "Anders"],
      },
      {
        key: "battery", prompt: "Hoeveel energie en mentale ruimte heb je nu?", type: "battery",
        options: [
          { v: 100, l: "Vol", d: "Veel energie en mentale ruimte." },
          { v: 75, l: "Goed", d: "Goede energie, prima capaciteit." },
          { v: 50, l: "Halfvol", d: "Redelijk. Bewaak je energie." },
          { v: 25, l: "Laag", d: "Beperkte energie of mentale ruimte." },
          { v: 0, l: "Leeg", d: "Nauwelijks energie of capaciteit." },
        ],
      },
      {
        key: "body", prompt: "Wat merk je op dit moment in je lichaam?", type: "text",
        placeholder: "Bijv. 'Ontspannen schouders.' of 'Druk op mijn borst.'",
      },
      {
        key: "stress", prompt: "Waar zit je hoofd nu het meest?", type: "single",
        options: ["Rustig", "Helder", "Gefocust", "Nieuwsgierig", "Vol ideeën", "Een beetje chaotisch", "Onrustig", "Gespannen", "Overprikkeld", "Moe / traag", "Moeilijk te zeggen"],
      },
      {
        key: "need", prompt: "Wat heb je vandaag het meest nodig om goed door je dag te komen?", type: "single",
        options: ["Focus", "Structuur", "Rust", "Beweging", "Creatieve ruimte", "Sociaal contact", "Alleen zijn", "Iets afronden", "Plezier", "Tijd om op gang te komen", "Niets bijzonders", "Anders"],
      },
    ],
  },
  check: {
    key: "check",
    label: "CHECK",
    time: "16:00",
    subtitle: "Wat heeft de dag met mij gedaan?",
    accent: "#d8dab3",
    questions: [
      {
        key: "moodDir", prompt: "Hoe voel je je nu, en wat is er veranderd sinds vanochtend?", type: "composite",
        parts: [
          { key: "mood", type: "single", label: "Hoe voel je je?", options: ["Goed", "Rustig", "Energiek", "Blij", "Geïnspireerd", "Neutraal", "Onrustig", "Gespannen", "Moe", "Overprikkeld", "Geïrriteerd", "Laag", "Anders"] },
          { key: "direction", type: "direction", label: "Vergeleken met vanochtend", options: ["Beter", "Ongeveer hetzelfde", "Moeilijker", "Anders"] },
        ],
      },
      {
        key: "trigger", prompt: "Wat heeft vandaag tot nu toe de meeste invloed gehad op hoe je je voelt?", type: "multi", max: 2,
        options: ["Iets waar ik trots op ben", "Iets dat me plezier gaf", "Een goed gesprek", "Sociale verbinding", "Creatief bezig zijn", "Iets dat gelukt is", "Een project / werk", "Rust / tijd voor mezelf", "Beweging", "Een onverwachte gebeurtenis", "Druk / deadline", "Conflict of spanning", "Te veel prikkels", "Te veel tegelijk", "Iets lichamelijks", "Niets bijzonders", "Anders"],
      },
      {
        key: "trajectory", prompt: "Hoe is je energie en mentale capaciteit nu vergeleken met vanochtend?", type: "composite",
        parts: [
          { key: "energy_trajectory", type: "trajectory", label: "Energie", options: ["Veel hoger", "Iets hoger", "Ongeveer hetzelfde", "Iets lager", "Veel lager"] },
          { key: "capacity_trajectory", type: "trajectory", label: "Mentale ruimte", options: ["Veel meer", "Iets meer", "Ongeveer hetzelfde", "Iets minder", "Veel minder"] },
        ],
      },
      {
        key: "behaviour", prompt: "Heb je vandaag ergens vanuit een impuls gereageerd, of juist bewust een andere keuze gemaakt?", type: "single",
        options: ["Ik reageerde bewust in plaats van impulsief", "Ik heb even gepauzeerd voordat ik handelde", "Ik stelde een grens", "Ik koos bewust voor rust", "Ik koos bewust voor iets positiefs", "Ik heb een impuls gevolgd", "Ik heb iets vermeden", "Ik moest mezelf achteraf bijsturen", "Ik gebruikte bewust een vaardigheid", "Er waren geen sterke impulsen", "Moeilijk te zeggen"],
      },
      {
        key: "coping", prompt: "Wat heeft je vandaag geholpen, en wat maakte het juist moeilijker?", type: "composite",
        parts: [
          { key: "helped", type: "multi", label: "Wat hielp?", options: ["Rust / pauze", "Structuur", "Planning", "Beweging", "Creatief bezig zijn", "Een gesprek", "Sociale verbinding", "Alleen zijn", "Iets afronden", "Plezier", "DGT / een vaardigheid", "Niets in het bijzonder", "Anders"] },
          { key: "harder", type: "multi", label: "Wat maakte het moeilijker?", optional: true, options: ["Tijdsdruk", "Te veel prikkels", "Te veel tegelijk", "Onverwachte verandering", "Conflict", "Vermoeidheid", "Onduidelijkheid", "Sociale druk", "Uitstel", "Negatieve gedachten", "Lichamelijke spanning", "Niets in het bijzonder", "Anders"] },
        ],
      },
    ],
  },
  reflect: {
    key: "reflect",
    label: "REFLECT",
    time: "20:00",
    subtitle: "Wat neem ik mee uit vandaag?",
    accent: "#94925d",
    questions: [
      {
        key: "moodDir", prompt: "Hoe voel je je nu, en hoe is dat veranderd ten opzichte van vanochtend?", type: "composite",
        parts: [
          { key: "mood", type: "single", label: "Hoe voel je je nu?", options: ["Rustig", "Goed", "Blij", "Tevreden", "Energiek", "Trots", "Verbonden", "Neutraal", "Onrustig", "Gespannen", "Moe", "Verdrietig", "Geïrriteerd", "Overprikkeld", "Anders"] },
          { key: "direction", type: "direction", label: "Ten opzichte van vanochtend", options: ["Beter", "Hetzelfde", "Moeilijker", "Anders"] },
        ],
      },
      {
        key: "difficult_moment", prompt: "Wat was vandaag het moeilijkste moment, en wat gebeurde er toen?", type: "text", optional: true,
        placeholder: "Alleen invullen als er iets was…", noneOption: "Geen bijzonder moeilijk moment",
      },
      {
        key: "coping", prompt: "Hoe ben je uiteindelijk met dat moment omgegaan?", type: "single", optional: true,
        options: ["Ik bleef rustig en handelde bewust", "Ik nam even afstand", "Ik gebruikte een vaardigheid", "Ik praatte erover", "Ik stelde een grens", "Ik koos bewust voor iets anders", "Ik reageerde eerst impulsief, maar stuurde bij", "Ik vermeed het", "Het lukte me niet goed om ermee om te gaan", "Er was geen moeilijk moment"],
      },
      {
        key: "proudTomorrow", prompt: "Waar handelde je vandaag op een manier die goed bij je past, en waar zou je morgen iets anders willen doen?", type: "composite",
        parts: [
          { key: "proud", type: "multi", label: "Waar ben je tevreden over?", options: ["Ik heb goed voor mezelf gezorgd", "Ik heb iets afgerond", "Ik heb een grens gesteld", "Ik heb bewust gereageerd", "Ik heb rust genomen", "Ik heb iets gedaan waar ik plezier aan had", "Ik heb iets nieuws geprobeerd", "Ik heb verbinding gezocht", "Ik heb mijn eigen tempo gerespecteerd", "Ik heb iets gedaan waar ik trots op ben", "Anders"] },
          { key: "tomorrow", type: "text", label: "Wat wil je morgen anders doen?", optional: true, placeholder: "Optioneel…" },
        ],
      },
      {
        key: "memory", prompt: "Wat wil je dat GIULIA uit vandaag onthoudt?", type: "text",
        placeholder: "Bijv. 'Dat gesprek deed me goed.'",
      },
    ],
  },
};

export const WINDOW_ORDER = ["orient", "check", "reflect"];

export function currentWindowKey(date = new Date()) {
  const h = date.getHours();
  if (h >= 9 && h < 14) return "orient";
  if (h >= 14 && h < 18) return "check";
  return "reflect"; // 18:00–09:00 — avond-check-in blijft open tot de ochtend
}

export function nextWindowInfo(date = new Date()) {
  const h = date.getHours();
  if (h >= 9 && h < 14) return { key: "check", ...WINDOWS.check };
  if (h >= 14 && h < 18) return { key: "reflect", ...WINDOWS.reflect };
  return { key: "orient", ...WINDOWS.orient, tomorrow: h >= 18 };
}

export function isCompletedForWindow(checkIns, windowKey, date = new Date()) {
  if (!windowKey) return false;
  const now = new Date(date);
  // Een check-in-cyclus loopt 09:00 → 09:00, zodat de overnight REFLECT
  // (18:00 → ochtend) bij dezelfde cyclus hoort als de ORIENT/CHECK van
  // die dag. Voor 09:00 hoort "nu" dus bij de vorige dag.
  const cycleStart = new Date(now);
  if (now.getHours() < 9) cycleStart.setDate(cycleStart.getDate() - 1);
  cycleStart.setHours(9, 0, 0, 0);
  const start = cycleStart.getTime();
  const end = now.getTime();
  return (checkIns || []).some((c) => {
    if (c.window !== windowKey) return false;
    const t = c.timestamp ? new Date(c.timestamp).getTime() : 0;
    return t >= start && t <= end;
  });
}

const STRESSED = ["Onrustig", "Gespannen", "Overprikkeld", "Verdrietig", "Geïrriteerd", "Laag", "Moe"];
const POSITIVE = ["Blij", "Energiek", "Goed", "Tevreden", "Trots", "Verbonden", "Geïnspireerd", "Rustig"];

export function deriveState(mood, energy) {
  if (mood && STRESSED.includes(mood) && (energy == null || energy <= 50)) return "overwhelmed";
  if (energy != null && energy <= 25) return "low";
  if (energy != null && energy >= 75 && (!mood || POSITIVE.includes(mood))) return "charged";
  if (mood && STRESSED.includes(mood)) return "low";
  if (mood && POSITIVE.includes(mood)) return "charged";
  return "neutral";
}

export function buildEntity(answers, windowKey) {
  const mood = answers.mood || undefined;
  const energy = answers.energy != null ? Number(answers.energy) : undefined;
  const capacity = answers.capacity != null ? Number(answers.capacity) : undefined;
  const state = deriveState(mood, energy);
  const entity = {
    state,
    window: windowKey,
    mood,
    energy,
    capacity,
    stress: answers.stress || undefined,
    need: answers.need || undefined,
    needs: answers.need ? [answers.need] : undefined,
    body: answers.body || undefined,
    direction: answers.direction || undefined,
    trigger: answers.trigger && answers.trigger.length ? answers.trigger : undefined,
    energy_trajectory: answers.energy_trajectory || undefined,
    capacity_trajectory: answers.capacity_trajectory || undefined,
    behaviour: answers.behaviour || undefined,
    helped: answers.helped && answers.helped.length ? answers.helped : undefined,
    harder: answers.harder && answers.harder.length ? answers.harder : undefined,
    difficult_moment: answers.difficult_moment || undefined,
    coping: answers.coping || undefined,
    proud: answers.proud && answers.proud.length ? answers.proud : undefined,
    tomorrow: answers.tomorrow || undefined,
    memory: answers.memory || undefined,
    reflection: answers.memory || answers.body || undefined,
    context: `${WINDOWS[windowKey]?.label || windowKey}: check-in`,
    source: "manual",
    check_in_type: "scheduled",
    timestamp: new Date().toISOString(),
  };
  Object.keys(entity).forEach((k) => entity[k] === undefined && delete entity[k]);
  return entity;
}