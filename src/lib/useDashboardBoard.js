import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { WIDGETS } from "@/lib/widgetRegistry";

/**
 * useDashboardBoard — laadt en beheert de widgets van één dashboard-board.
 *
 * Gedrag:
 *  • Eerste opstart van de dag (nieuwe kalenderdag): alle dashboards
 *    tonen al hun eigen widgets volledig.
 *  • Doorheen de dag blijven widgets zoals de gebruiker ze het laatst
 *    gebruikte — verwijderde widgets komen NIET terug bij een refresh.
 *  • Bij volledige afsluit en nieuwe dagopstart: weer alle widgets.
 *
 * De "laatste reset-datum" wordt in localStorage bijgehouden. Is de datum
 * anders dan vandaag → volledige reset (behalve NOW).
 */

export const DEFAULT_BOARDS = [
  { id: "giulia", label: "GIULIA", domain: "giulia" },
  { id: "focus", label: "FOCUS", domain: "focus" },
  { id: "life", label: "LIFE", domain: "life" },
  { id: "system", label: "SYSTEM", domain: "system" },
];

export function isDefaultBoard(id) {
  return DEFAULT_BOARDS.some((b) => b.id === id);
}

export function domainWidgetTypes(domain) {
  return Object.values(WIDGETS).filter((w) => w.domain === domain).map((w) => w.type);
}

// ── active board (session) ──
export function getActiveBoard() {
  const b = sessionStorage.getItem("giulia_active_board") || "giulia";
  // SELF- en NOW-boards zijn verwijderd — remap naar GIULIA.
  return (b === "self" || b === "now") ? "giulia" : b;
}
export function setActiveBoard(id) {
  sessionStorage.setItem("giulia_active_board", id);
}

// ── custom (temporary) boards ──
export function loadCustomBoards() {
  try { return JSON.parse(sessionStorage.getItem("giulia_custom_boards") || "[]"); } catch { return []; }
}
function saveCustomBoards(list) {
  sessionStorage.setItem("giulia_custom_boards", JSON.stringify(list));
}
export function createCustomBoard(label) {
  const list = loadCustomBoards();
  const id = "custom_" + Date.now();
  list.push({ id, label: label || `Dashboard ${list.length + 1}` });
  saveCustomBoards(list);
  sessionStorage.setItem("giulia_board_" + id, "[]");
  return id;
}
export function renameCustomBoard(id, label) {
  const list = loadCustomBoards().map((b) => (b.id === id ? { ...b, label: label || b.label } : b));
  saveCustomBoards(list);
}
export function deleteCustomBoard(id) {
  const list = loadCustomBoards().filter((b) => b.id !== id);
  saveCustomBoards(list);
  sessionStorage.removeItem("giulia_board_" + id);
}
function sessionWidgets(boardId) {
  try { return JSON.parse(sessionStorage.getItem("giulia_board_" + boardId) || "[]"); } catch { return []; }
}
function saveSessionWidgets(boardId, types) {
  sessionStorage.setItem("giulia_board_" + boardId, JSON.stringify(types));
}
function sessionRecords(boardId) {
  return sessionWidgets(boardId).map((t, i) => ({ id: `sess_${boardId}_${i}_${t}`, widget_type: t, position: i, visible: true }));
}

function todayKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

let _boardsEnsurePromise = null;
/**
 * ensureAllBoards — eenmalig per opstart:
 *  • Nieuwe dag → volledige reset van alle boards (behalve NOW): alle
 *    domein-widgets worden opnieuw gezaaid.
 *  • Dezelfde dag → boards blijven zoals ze zijn; alleen lege default-boards
 *    worden hersteld (bug-herstel zonder gebruikerskeuze weg te halen).
 *  • Alle boards → duplicaten worden verwijderd (houd eerste exemplaar).
 *  • NOW → altijd de volledige widget-set garanderen (urgency-gebaseerd).
 */
export function ensureAllBoards() {
  if (_boardsEnsurePromise) return _boardsEnsurePromise;
  _boardsEnsurePromise = (async () => {
  try {
    const today = todayKey();
    const lastReset = localStorage.getItem("giulia_last_reset_date");
    const isNewDay = lastReset !== today;

    if (isNewDay) localStorage.setItem("giulia_last_reset_date", today);

    for (const b of DEFAULT_BOARDS) {
      const recs = await base44.entities.DashboardWidget.filter({ board_id: b.id }, "position").catch(() => []);
      const types = domainWidgetTypes(b.domain);

      // 1. Deduplicate (houd eerste exemplaar per widget_type) — ruimt
      //    legacy-duplicaten op. Kan niet meer terugkomen: de new-day
      //    reset hieronder creëert alleen nog ontbrekende types (idempotent),
      //    dus de deleteMany+bulkCreate-race die stapeling veroorzaakte is weg.
      const seen = new Set();
      const toDelete = [];
      for (const r of (recs || [])) {
        if (seen.has(r.widget_type)) toDelete.push(r.id);
        else seen.add(r.widget_type);
      }
      if (toDelete.length) {
        await base44.entities.DashboardWidget.deleteMany({ id: { $in: toDelete } }).catch(() => {});
      }

      // 2. Aanvullen — idempotent, nooit duplicaten:
      //    • Nieuwe dag → alle domein-widgets die ontbreken weer toevoegen
      //      (alleen create als het type er nog NIET is).
      //    • Dezelfde dag → alleen vullen als het board volledig leeg is.
      const missing = isNewDay
        ? types.filter((t) => !seen.has(t))
        : ((recs || []).length === 0 ? types : []);
      if (missing.length) {
        await base44.entities.DashboardWidget.bulkCreate(
          missing.map((t, i) => ({ widget_type: t, position: (recs || []).length + i, visible: true, board_id: b.id }))
        ).catch(() => {});
      }
    }
  } catch (e) { _boardsEnsurePromise = null; throw e; }
  })();
  return _boardsEnsurePromise;
}

export function useDashboardBoard(boardId, ready = true) {
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const custom = !isDefaultBoard(boardId);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (custom) {
        setWidgets(sessionRecords(boardId));
      } else {
        const recs = await base44.entities.DashboardWidget.filter({ board_id: boardId }, "position").catch(() => []);
        const seen = new Set();
        const dedup = (recs || []).filter((r) => r.visible !== false && (seen.has(r.widget_type) ? false : (seen.add(r.widget_type), true)));
        setWidgets(dedup);
      }
    } catch {
      setWidgets([]);
    } finally {
      setLoading(false);
    }
  }, [boardId, custom]);

  // Alleen laden zodra de eenmalige opstart-ensure klaar is (vaste boards);
  // tijdelijke boards laden direct.
  useEffect(() => { if (custom || ready) load(); }, [load, custom, ready]);

  const addWidget = useCallback(async (type) => {
    if (widgets.some((w) => w.widget_type === type)) return; // nooit twee dezelfde widget
    if (custom) {
      const types = sessionWidgets(boardId);
      if (types.includes(type)) return;
      const next = [...types, type];
      saveSessionWidgets(boardId, next);
      setWidgets(sessionRecords(boardId));
    } else {
      const rec = await base44.entities.DashboardWidget.create({ widget_type: type, position: widgets.length, visible: true, board_id: boardId }).catch(() => null);
      if (rec) setWidgets((w) => [...w, rec]);
    }
  }, [boardId, custom, widgets]);

  const removeWidget = useCallback(async (id) => {
    if (custom) {
      const w = widgets.find((x) => x.id === id);
      const next = sessionWidgets(boardId).filter((t) => t !== w?.widget_type);
      saveSessionWidgets(boardId, next);
      setWidgets(sessionRecords(boardId));
    } else {
      await base44.entities.DashboardWidget.delete(id).catch(() => {});
      setWidgets((w) => w.filter((x) => x.id !== id));
    }
  }, [boardId, custom, widgets]);

  const patchWidget = useCallback((id, patch) => {
    setWidgets((ws) => ws.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  }, []);

  const reset = useCallback(async () => {
    if (custom) {
      saveSessionWidgets(boardId, []);
      setWidgets([]);
    } else {
      await base44.entities.DashboardWidget.deleteMany({ board_id: boardId }).catch(() => {});
      const types = domainWidgetTypes(boardId);
      const recs = await base44.entities.DashboardWidget.bulkCreate(types.map((t, i) => ({ widget_type: t, position: i, visible: true, board_id: boardId }))).catch(() => []);
      setWidgets(recs || []);
    }
  }, [boardId, custom]);

  return { widgets, loading, addWidget, removeWidget, patchWidget, reset, reload: load, isCustom: custom };
}