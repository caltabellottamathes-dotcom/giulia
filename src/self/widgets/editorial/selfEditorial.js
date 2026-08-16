// SELF editorial photos + palette + mock demo data.
// Hoofdkleur: #5c7584 (blauw — was LIFE blauw, na kleur-swap). 2e kleur: #d8dab3 (sage). Geen geel.
// Fotos zijn losse kaarten met 4 ronde hoeken, zonder overlay.

export const SELF_PHOTO = {
  dailyState: "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/f7bdee9b6_Apply_a_consistent_editorial_documentary_2026062122294.jpeg",
  routines: "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/3ff819d08_Apply_a_highly_realistic_editorial_202606212230.jpeg",
  wake: "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/76c891531_A_surreal_editorial_photograph_of_a_202606270239.jpeg",
  therapy: "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/0bea9ecdf_Apply_a_consistent_editorial_documentary_202606212036.jpeg",
  journal: "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/6f93aecac_Apply_a_consistent_editorial_documentary_2026062122141.jpeg",
  development: "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/5ed99c12d_An_extreme_surrealist_editorial_photograph_202606270306.jpeg",
  personalTime: "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/28b7b375d_Deadpan_performance-art_photograph_in_an_202606270250.jpeg",
  insights: "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/42cf228fa_Extreme_close-up_macro_photograph_of_202606270247.jpeg",
};

export const PLUM = "#5c7584";
export const SAGE = "#d8dab3";
export const PLUM_FAINT = "rgba(92,117,132,0.12)";

// ── mock demo content ──
export const MOCK = {
  dailyState: { state: "calm", energy: 78, capacity: 64, timeline: [62, 55, 70, 48, 80, 78, 72, 81], need: "rust", mood: "good" },
  routines: [
    { id: "m1", title: "Ochtend ademruimte", streak_count: 12, status: "completed" },
    { id: "m2", title: "Stretches", streak_count: 7, status: "completed" },
    { id: "m3", title: "Lezen 10 min", streak_count: 3, status: "active" },
    { id: "m4", title: "Geen schermen na 22u", streak_count: 21, status: "active" },
  ],
  wake: { done: 2, total: 4, lastDone: "07:12" },
  therapy: { active: 2, avg: 45, goals: 5, next: "vr 21 aug · 14:00" },
  journal: [
    { id: "j1", title: "Stilte voor de dag begon", type: "reflection", is_highlight: true },
    { id: "j2", title: "Wandeling langs het water", type: "moment", is_highlight: false },
    { id: "j3", title: "Een oude gedachte teruggekomen", type: "entry", is_highlight: false },
    { id: "j4", title: "Gesprek met M. over grenzen", type: "thread", is_highlight: true },
    { id: "j5", title: "Vroeg naar bed, opgelucht", type: "entry", is_highlight: false },
  ],
  development: {
    goals: [
      { id: "g1", title: "Hardloopschema 10km", progress: 80, area: "Fysiek" },
      { id: "g2", title: "Wekelijks schrijven", progress: 55, area: "Creatief" },
      { id: "g3", title: "Lezen: 12 boeken", progress: 30, area: "Groei" },
    ],
    areas: ["Fysiek", "Creatief", "Groei"],
    avg: 55,
  },
  personalTime: {
    blocks: [
      { id: "p1", type: "protected", start: "2026-08-16T07:00:00", duration_min: 90 },
      { id: "p2", type: "rest", start: "2026-08-16T13:00:00", duration_min: 30 },
      { id: "p3", type: "recovery", start: "2026-08-16T20:30:00", duration_min: 60 },
    ],
    total: 180, protected: 90,
  },
  insights: {
    items: [
      { type: "balance", n: 2 }, { type: "pattern", n: 2 }, { type: "capacity", n: 1 },
      { type: "overload", n: 1 }, { type: "under_recovery", n: 1 },
    ],
    pos: 5, neg: 2, balance: 71,
  },
};