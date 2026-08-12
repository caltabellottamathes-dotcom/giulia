// Accent → CSS-var helper for the widget-gallery-2 alternative designs.
// Sets --tile-accent / --tile-on-accent so the same accent system as the real
// widgets works inside the alt layouts.
export const ACCENT_HSL = {
  olive: "60 14% 46%",
  sand: "58 23% 47%",
  ridge: "204 18% 73%",
  storm: "60 6% 94%",
  charcoal: "60 12% 16%",
};
export const ON_HSL = {
  olive: "60 7% 95%",
  sand: "60 7% 95%",
  ridge: "60 12% 16%",
  storm: "60 12% 16%",
  charcoal: "60 7% 95%",
};
export const accentVars = (accent) => ({
  "--tile-accent": `hsl(${ACCENT_HSL[accent] || ACCENT_HSL.olive})`,
  "--tile-on-accent": `hsl(${ON_HSL[accent] || ON_HSL.olive})`,
});