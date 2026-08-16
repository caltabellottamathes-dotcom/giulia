import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { WIDGETS } from "@/lib/widgetRegistry";

/**
 * useDashboardBoard — laadt en beheert de widgets van één dashboard-board.
 *
 * Vijf vaste boards (giulia / focus / life / self / system) worden server-side
 * bewaard (DashboardWidget.board_id). Een leeg board wordt bij eerste keer
 * gezaaid met álle widgets van zijn domein; daarna blijven alleen de widgets
 * staan die de gebruiker koos (verwijderen persisteert).
 *
 * Zelfgemaakte (lege) boards zijn tijdelijk: ze leven in sessionStorage en
 * verdwijnen bij afsluiten/herstart.
 */

export const DEFAULT_BOARDS = [
  { id: "giulia", label: "GIULIA", domain: "giulia" },
  { id: "focus", label: "FOCUS", domain: "focus" },
  { id: "life", label: "LIFE", domain: "life" },
  { id: "self", label: "SELF", domain: "self" },
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
  return sessionStorage.getItem("giulia_active_board") || "giulia";
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

let _boardsEnsured = false;
/**
 * ensureAllBoards — eenmalig per opstart: garandeert dat elk vast dashboard
 * exact zijn domein-widgets bevat (geen duplicaten, geen verkeerde widgets;
 * ontbrekende worden aangezaaid). Daarna worden boards nooit meer
 * automatisch aangevuld — verwijderde widgets blijven weg.
 */
export async function ensureAllBoards() {
  if (_boardsEnsured) return;
  _boardsEnsured = true;
  try {
    for (const b of DEFAULT_BOARDS) {
      const types = domainWidgetTypes(b.domain);
      let recs = await base44.entities.DashboardWidget.filter({ board_id: b.id }, "position").catch(() => []);
      recs = recs || [];
      const seen = new Set();
      const dupes = [];
      const keep = [];
      for (const r of recs) {
        if (seen.has(r.widget_type)) dupes.push(r);
        else { seen.add(r.widget_type); keep.push(r); }
      }
      const wrong = keep.filter((r) => !types.includes(r.widget_type));
      const toDelete = [...dupes, ...wrong];
      if (toDelete.length) await Promise.all(toDelete.map((r) => base44.entities.DashboardWidget.delete(r.id).catch(() => {})));
      const kept = keep.filter((r) => types.includes(r.widget_type));
      const present = kept.map((r) => r.widget_type);
      const missing = types.filter((t) => !present.includes(t));
      if (missing.length) {
        await base44.entities.DashboardWidget.bulkCreate(missing.map((t, i) => ({ widget_type: t, position: kept.length + i, visible: true, board_id: b.id }))).catch(() => {});
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