// FINALE DOMEIN-KLEUREN — per domein deep/mid/light/urgent (hex bronwaarden).
// SYSTEM = neutraal. Urgent (#d5e24a) verschijnt alleen wanneer iets urgent is.
export const TRACK = "rgba(255,255,255,0.08)";

export const GIULIA = {
  deep: "#595f34",   // EARTH OLIVE
  mid: "#94925d",    // Olive
  light: "#d8dab3",  // Whipped Pistachio
  urgent: "#d5e24a", // Urgent
  track: TRACK,
  // legacy keys (backward-compat) → nieuwe palette
  coral: "#595f34",
  dust: "#94925d",
  pistachio: "#d8dab3",
  plum: "#595f34",
};

export const FOCUS = {
  deep: "#301728",   // Plum
  mid: "#d8dab3",     // Whipped Pistachio (geen aparte mid → light)
  light: "#d8dab3",  // Whipped Pistachio
  urgent: "#d5e24a", // Urgent
  track: TRACK,
};

export const LIFE = {
  deep: "#b1bec6",   // Ridge Sky
  mid: "#cfd9dd",     // Morning dew
  light: "#d8dab3",   // Whipped Pistachio
  urgent: "#d5e24a",  // Urgent
  track: TRACK,
};

export const SYSTEM = {
  deep: "#3a3a35",   // neutraal dark
  mid: "#8a8a82",    // smoke
  light: "#d9d9d4",  // stone
  urgent: "#d5e24a", // Urgent
  track: TRACK,
};