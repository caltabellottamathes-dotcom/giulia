// SELF editorial photos + palette + mock demo data.
// Hoofdkleur: #301728 (donker plum). 2e kleur: #d8dab3 (sage). Geen geel.
// Fotos zijn losse kaarten met 4 ronde hoeken, zonder overlay.

export const SELF_PHOTO = {
  dailyState: "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/66a7f3110_An_emotionally_ambiguous_wide_shot_2026062622311.jpeg",
  routines: "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/30a15f7eb_A_striking_surreal_editorial_photograph_202606262301.jpeg",
  wake: "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/d9f47727d_A_medium_shot_from_behind_202606262232.jpeg",
  therapy: "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/e90d53d56_An_emotionally_ambiguous_close-up_of_202606262301.jpeg",
  journal: "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/2cd956e5c_A_striking_composition_of_graphic_202606262301.jpeg",
  development: "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/b2f8d6b92_A_graphic_minimalist_photograph_exploring_2026062623011.jpeg",
  personalTime: "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/79e3eeaf0_A_graphic_minimalist_photograph_exploring_202606262301.jpeg",
  insights: "https://media.base44.com/images/public/6a7608690d4ea2c9edc3d59b/fdb845d44_A_deadpan_horizontal_profile_shot_202606262244.jpeg",
};

export const PLUM = "#301728";
export const SAGE = "#d8dab3";
export const PLUM_FAINT = "rgba(48,23,40,0.12)";

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