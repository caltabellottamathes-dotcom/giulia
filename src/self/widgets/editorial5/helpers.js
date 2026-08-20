import { DOMAIN_META } from "@/lib/unifiedStream";

/** Gedeelde helpers voor de ultieme data-widgets (reeks 5). */
export const tFmt = (iso) => {
  try { return new Date(iso).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }); }
  catch { return "--:--"; }
};
export const dayStartIso = () => { const s = new Date(); s.setHours(0, 0, 0, 0); return s.toISOString(); };
export const domainColor = (d) => (DOMAIN_META[d] || DOMAIN_META.focus).color;
export const fmtEuro = (n) => `€${Math.round(n || 0)}`;
export const daysSince = (iso) => iso ? Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)) : 999;
export const stateHeadline = (state) => state === "calm" ? "IN RHYTHM" : state === "charged" ? "CHARGED" : state === "overwhelmed" ? "OVERLOAD" : state === "low" ? "DEPLETED" : "STEADY";