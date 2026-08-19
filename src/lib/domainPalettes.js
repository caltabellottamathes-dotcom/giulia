// Domain color palettes for GIULIA OS overview panels
// FOCUS = #595f34, #94925d, #d8dab3, urgent #d5e24a
// LIFE  = #301728, #d8dab3, urgent #d5e24a
// GIULIA = Coral Sunset #f2513b, Dust #e0ded3, Whipped Pistachio #d8dab3, urgent #d5e24a

export const TRACK = "rgba(255,255,255,0.08)";

export const FOCUS = {
  deep: "#595f34",
  mid: "#94925d",
  light: "#d8dab3",
  urgent: "#d5e24a",
  track: TRACK,
};

export const LIFE = {
  deep: "#301728",
  light: "#d8dab3",
  urgent: "#d5e24a",
  track: TRACK,
};

export const GIULIA = {
  // GIULIA domain — Coral Sunset (primary), Dust, Whipped Pistachio, Urgent
  coral: "#f2513b",
  dust: "#e0ded3",
  pistachio: "#d8dab3",
  urgent: "#d5e24a",
  // legacy keys (backward-compat) → nieuwe palette
  deep: "#f2513b",
  mid: "#e0ded3",
  light: "#d8dab3",
  plum: "#f2513b",
  track: TRACK,
};