// Productcode-systeem voor de twee shell-composities.
// Code:  <Optie>·<Vorm>·<Plaats>·<Soort>   bv. "G·16x9·L·SIDE"
//   Optie :  G = GlassShell + PhotoCard,  P = PhotoShell + GlassCard
//   Vorm  :  16x9 / 9x16 / 1x1 / 4x3 / 3x4 / 21x9 / 3x2 / 2x3 / 4x5
//   Plaats:  L (links) · R (rechts) · T (boven) · B (onder)
//   Soort :  SIDE (gebalanceerd) · STRIP (lange/smalle strip)

export const SHELL_OPT = { 1: "G", 2: "P" };
export const SHELL_OPT_REV = { G: 1, P: 2 };

export const SHELL_SHAPE = {
  "1:1": "1x1", "4:3": "4x3", "3:4": "3x4", "16:9": "16x9", "9:16": "9x16",
  "21:9": "21x9", "3:2": "3x2", "2:3": "2x3", "4:5": "4x5",
};
export const SHELL_SHAPE_REV = Object.fromEntries(
  Object.entries(SHELL_SHAPE).map(([k, v]) => [v, k])
);

export const SHELL_POS = { left: "L", right: "R", top: "T", bottom: "B" };
export const SHELL_POS_REV = Object.fromEntries(
  Object.entries(SHELL_POS).map(([k, v]) => [v, k])
);

// 6 unieke geanimeerde iconen (WidgetHeader-types), cyclus per widget.
export const SHELL_ICONS = ["tasks", "pulse", "agenda", "energy", "briefing", "social"];
export const iconFor = (i) => SHELL_ICONS[((i % SHELL_ICONS.length) + SHELL_ICONS.length) % SHELL_ICONS.length];
export const iconName = (t) => t.toUpperCase();

// Schaduw richting de open kant (afhankelijk van plaatsing van de card).
export const SHELL_SHADOW = {
  left: "16px 0 34px -10px rgba(0,0,0,0.50)",
  right: "-16px 0 34px -10px rgba(0,0,0,0.50)",
  top: "0 16px 34px -10px rgba(0,0,0,0.50)",
  bottom: "0 -16px 34px -10px rgba(0,0,0,0.50)",
};

export function buildShellCode({ opt, shape, pos, strip }) {
  return `${SHELL_OPT[opt]}·${SHELL_SHAPE[shape]}·${SHELL_POS[pos]}·${strip ? "STRIP" : "SIDE"}`;
}

export function parseShellCode(code) {
  const [o, s, p, k] = String(code).split("·").map((x) => x.trim());
  return {
    opt: SHELL_OPT_REV[o],
    shape: SHELL_SHAPE_REV[s],
    pos: SHELL_POS_REV[p],
    strip: k === "STRIP",
  };
}

// ── Gelaagd (layered) ────────────────────────────────────────────────
// De card zweeft over de shell-rand: overhangt buiten de shell met `overhang`
// en reikt `frac` naar binnen. 4 afgeronde hoeken; flush op de korte as.
export function layeredCardStyle(pos, frac, overhang = 0.1) {
  const o = `${overhang * 100}%`;
  const w = `${(frac + overhang) * 100}%`;
  switch (pos) {
    case "left":   return { left: `-${o}`, top: 0, bottom: 0, width: w };
    case "right":  return { right: `-${o}`, top: 0, bottom: 0, width: w };
    case "top":    return { top: `-${o}`, left: 0, right: 0, height: w };
    case "bottom": return { bottom: `-${o}`, left: 0, right: 0, height: w };
    default:       return { left: `-${o}`, top: 0, bottom: 0, width: w };
  }
}

// Padding voor content-op-glas (Optie 1 layered): houdt content vrij van de card.
export function layeredContentPad(pos, frac, base = 16) {
  const inset = `calc(${frac * 100}% + 12px)`;
  switch (pos) {
    case "left":   return { padding: `${base}px ${base}px ${base}px ${inset}` };
    case "right":  return { padding: `${base}px ${inset} ${base}px ${base}px` };
    case "top":    return { padding: `${inset} ${base}px ${base}px ${base}px` };
    case "bottom": return { padding: `${base}px ${base}px ${inset} ${base}px` };
    default:      return { padding: `${base}px` };
  }
}

// ── Achter de shell (behind) ──────────────────────────────────────────
// PhotoCard ligt achter de GlassShell en is verschoven (peek) zodat hij
// aan één kant/hoek erachter uit steekt.
export const SHELL_PEEK = { tl: "TL", tr: "TR", bl: "BL", br: "BR", t: "T", b: "B", l: "L", r: "R" };

export function peekTransform(peek, amount = 0.08) {
  const a = `${amount * 100}%`;
  const map = {
    tl: `translate(-${a}, -${a})`, tr: `translate(${a}, -${a})`,
    bl: `translate(-${a}, ${a})`,  br: `translate(${a}, ${a})`,
    t: `translate(0, -${a})`,       b: `translate(0, ${a})`,
    l: `translate(-${a}, 0)`,       r: `translate(${a}, 0)`,
  };
  return map[peek] || map.tl;
}

export function buildShellBehindCode({ shape, peek }) {
  return `G·${SHELL_SHAPE[shape]}·${SHELL_PEEK[peek]}·BEHIND`;
}