import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { isTauri, setFocusItems } from "@/lib/nativeBridge";

/**
 * TauriFocusSync — mounts once in the Layout. When running inside Tauri it
 * reads today's DailyPlan and pushes the focus items to the Windows tray
 * (via the Rust `update_tray_focus` command). Re-syncs every 5 min. Renders
 * nothing; a no-op outside Tauri.
 */
export default function TauriFocusSync() {
  useEffect(() => {
    if (!isTauri) return;
    let cancelled = false;

    const sync = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const plans = await base44.entities.DailyPlan.filter({ date: today });
        if (cancelled || !plans?.length) return;
        const plan = plans[0];
        const pd = plan.plan_data || {};
        const focus = Array.isArray(pd.focus_items)
          ? pd.focus_items.map((f) => (typeof f === "string" ? f : f?.title || "")).filter(Boolean)
          : [];
        const priorities = Array.isArray(plan.priorities) ? plan.priorities.filter(Boolean) : [];
        const items = [...priorities, ...focus].slice(0, 8);
        if (items.length) setFocusItems(items);
      } catch { /* noop */ }
    };

    sync();
    const id = setInterval(sync, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return null;
}