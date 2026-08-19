// Domain color palettes for GIULIA OS overview panels
// FOCUS = #595f34, #94925d, #d8dab3, urgent #d5e24a
// LIFE  = #301728, #d8dab3, urgent #d5e24a
// GIULIA = muted clay #8b8471, Dust #e0ded3, Whipped Pistachio #d8dab3, urgent #d5e24a

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
  // GIULIA domain — muted clay #8b8471 (primary), Dust, Whipped Pistachio, Urgent
  coral: "#8b8471",
  dust: "#e0ded3",
  pistachio: "#d8dab3",
  urgent: "#d5e24a",
  // legacy keys (backward-compat) → nieuwe palette
  deep: "#8b8471",
  mid: "#e0ded3",
  light: "#d8dab3",
  plum: "#8b8471",
  track: TRACK,
};