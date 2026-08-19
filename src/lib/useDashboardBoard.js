import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { WIDGETS } from "@/lib/widgetRegistry";

/**
 * useDashboardBoard — laadt en beheert de widgets van één dashboard-board.
 *
 * Gedrag:
 *  • Eerste opstart van de dag (nieuwe kalenderdag): alle dashboards
 *    behalve NOW tonen al hun eigen widgets volledig.
 *  • Doorheen de dag blijven widgets zoals de gebruiker ze het laatst
 *    gebruikte — verwijderde widgets komen NIET terug bij een refresh.
 *  • Bij volledige afsluit en nieuwe dagopstart: weer alle widgets.
 *  • NOW toont altijd de widgets met de meest urgente info (urgency-filter).
 *
 * De "laatste reset-datum" wordt in localStorage bijgehouden. Is de datum
 * anders dan vandaag → volledige reset (behalve NOW).
 */

const NOW_WIDGET_TYPES = ["approvals", "tasks", "notifications", "email", "whatsapp", "household", "personaladmin", "dailystate", "giuliaquestions"];

export const DEFAULT_BOARDS = [
  { id: "now", label: "NOW", domain: "now" },
  { id: "giulia", label: "GIULIA", domain: "giulia" },
  { id: "focus", label: "FOCUS", domain: "focus" },
  { id: "life", label: "LIFE", domain: "life" },
  { id: "system", label: "SYSTEM", domain: "system" },
];

export function isDefaultBoard(id) {
  return DEFAULT_BOARDS.some((b) => b.id === id);
}

export function domainWidgetTypes(domain) {
  if (domain === "now") return NOW_WIDGET_TYPES;
  return Object.values(WIDGETS).filter((w) => w.domain === domain).map((w) => w.type);
}

// ── active board (session) ──
export function getActiveBoard() {
  const b = sessionStorage.getItem("giulia_active_board") || "now";
  // SELF-board is verwijderd als domein — remap naar GIULIA.
  return b === "self" ? "giulia" : b;
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

let _boardsEnsured = false;
/**
 * ensureAllBoards — eenmalig per opstart:
 *  • Nieuwe dag → volledige reset van alle boards (behalve NOW): alle
 *    domein-widgets worden opnieuw gezaaid.
 *  • Dezelfde dag → boards blijven zoals ze zijn; alleen lege default-boards
 *    worden hersteld (bug-herstel zonder gebruikerskeuze weg te halen).
 *  • Alle boards → duplicaten worden verwijderd (houd eerste exemplaar).
 *  • NOW → altijd de volledige widget-set garanderen (urgency-gebaseerd).
 */
export async function ensureAllBoards() {
  if (_boardsEnsured) return;
  _boardsEnsured = true;
  try {
    const today = todayKey();
    const lastReset = localStorage.getItem("giulia_last_reset_date");
    const isNewDay = lastReset !== today;

    if (isNewDay) {
      localStorage.setItem("giulia_last_reset_date", today);
      // Volledige reset voor alle boards behalve NOW
      for (const b of DEFAULT_BOARDS) {
        if (b.id === "now") continue;
        await base44.entities.DashboardWidget.deleteMany({ board_id: b.id }).catch(() => {});
        const types = domainWidgetTypes(b.domain);
        await base44.entities.DashboardWidget.bulkCreate(
          types.map((t, i) => ({ widget_type: t, position: i, visible: true, board_id: b.id }))
        ).catch(() => {});
      }
    }

    // Voor elk board: deduplicate + aanvullen (NOW altijd, anderen alleen als leeg)
    for (const b of DEFAULT_BOARDS) {
      const recs = await base44.entities.DashboardWidget.filter({ board_id: b.id }, "position").catch(() => []);
      const types = domainWidgetTypes(b.domain);

      // Verwijder duplicaten (houd eerste exemplaar van elk type)
      const seen = new Set();
      const toDelete = [];
      for (const r of (recs || [])) {
        if (seen.has(r.widget_type)) {
          toDelete.push(r.id);
        } else {
          seen.add(r.widget_type);
        }
      }
      if (toDelete.length) {
        await base44.entities.DashboardWidget.deleteMany({ id: { $in: toDelete } }).catch(() => {});
      }

      // NOW: altijd aanvullen; anderen: alleen als board volledig leeg is
      const isNow = b.id === "now";
      const isEmpty = (recs || []).length === 0;
      if (isNow || isEmpty) {
        const missing = types.filter((t) => !seen.has(t));
        if (missing.length) {
          await base44.entities.DashboardWidget.bulkCreate(
            missing.map((t, i) => ({ widget_type: t, position: (recs || []).length + i, visible: true, board_id: b.id }))
          ).catch(() => {});
        }
      }
    }
  } catch {}
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
        setWidgets((recs || []).filter((r) => r.visible !== false));
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