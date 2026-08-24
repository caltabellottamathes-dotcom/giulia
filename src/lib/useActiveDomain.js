import { useState, useEffect } from "react";
import { usePanel } from "@/lib/PanelContext";
import { useLocation } from "react-router-dom";
import { WIDGETS } from "@/lib/widgetRegistry";
import { getActiveBoard } from "@/lib/useDashboardBoard";

/**
 * useActiveDomain — bepaalt het actieve OS-domein (giulia/focus/life/self/
 * system) op basis van het open paneel, de huidige route en het actieve
 * dashboard-bord. Geeft ook de bijbehorende accentkleur (dezelfde tokens als
 * de WorkspaceToolbar) terug, zodat panelen/chat dezelfde kleur tonen als de
 * taakbalk.
 */
const ROUTE_DOMAIN = [
  [/^\/self/, "self"], [/^\/wake$/, "self"],
  [/^\/life/, "life"],
  [/^\/(agenda|projects|tasks|email|whatsapp|documents|people|planning|timetracker)/, "focus"],
  [/^\/knowledge/, "system"],
  [/^\/(chat|voice|approvals|insights|updates|briefing|wants-to-know|activity|memory|agents)/, "giulia"],
  [/^\/(search|integrations|settings|profile)/, "system"],
];
const MODULE_DOMAIN_FALLBACK = {
  chat: "giulia", voice: "giulia", settings: "system", profile: "system", integrations: "system",
};

export const DOMAIN_ACCENT = {
  giulia: "hsl(var(--d-giulia-deep))",
  focus: "hsl(var(--d-focus-deep))",
  life: "hsl(var(--ridge))",
  self: "hsl(var(--self-burgundy))",
  system: "hsl(var(--d-system-deep))",
};

/** Tekstkleur voor verzonden chat-bubbles per domein (licht accent → donkere tekst). */
export const DOMAIN_BUBBLE_TEXT = {
  giulia: "text-ivory",
  focus: "text-ivory",
  life: "text-charcoal",
  self: "text-ivory",
  system: "text-ivory",
};

export function resolveDomain(board, activeModule, pathname) {
  if (activeModule) {
    const d = WIDGETS[activeModule]?.domain || MODULE_DOMAIN_FALLBACK[activeModule];
    if (d) return d;
  }
  if (pathname === "/") {
    const b = (board || "").toLowerCase();
    if (b === "focus") return "focus";
    if (b === "self") return "self";
    if (b === "life") return "life";
    if (b === "system") return "system";
    return "giulia";
  }
  for (const [re, d] of ROUTE_DOMAIN) if (re.test(pathname)) return d;
  return "giulia";
}

export function useActiveDomain(board) {
  const { activeModule } = usePanel();
  const loc = useLocation();
  const [sessionBoard, setSessionBoard] = useState(board ?? getActiveBoard());
  useEffect(() => {
    if (board != null) { setSessionBoard(board); return; }
    const h = (e) => setSessionBoard(e.detail);
    window.addEventListener("giulia:board-change", h);
    return () => window.removeEventListener("giulia:board-change", h);
  }, [board]);
  const domain = resolveDomain(sessionBoard, activeModule, loc.pathname);
  const accent = DOMAIN_ACCENT[domain] || DOMAIN_ACCENT.giulia;
  const bubbleText = DOMAIN_BUBBLE_TEXT[domain] || "text-ivory";
  return { domain, accent, bubbleText };
}