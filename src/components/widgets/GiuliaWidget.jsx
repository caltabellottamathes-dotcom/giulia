import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import WidgetShell from "./WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";

const greetingWord = () => {
  const h = new Date().getHours();
  return h < 12 ? "Goedemorgen" : h < 18 ? "Goedemiddag" : "Goedenavond";
};

/**
 * GiuliaWidget — "Je dag". An editorial morning briefing: a layered photo on the
 * left (with an inset second photo) and a glass content card on the right where
 * the three things that matter today stand out as graphic, numbered elements.
 * Left-aligned, quiet, elegant. Pulls today's DailyPlan; synthesises a plan
 * from the live situation when none exists.
 */
export default function GiuliaWidget() {
  const { openModule } = usePanel();
  const [priorities, setPriorities] = useState([]);
  const [summary, setSummary] = useState("");
  const [updated, setUpdated] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const now = new Date();
    const today = now.toLocaleDateString("sv-SE");
    const [plans, tasks, events, emails, approvals] = await Promise.all([
      base44.entities.DailyPlan.filter({ date: today }).catch(() => []),
      base44.entities.Task.list().catch(() => []),
      base44.entities.Event.list().catch(() => []),
      base44.entities.Email.filter({ status: "unread" }).catch(() => []),
      base44.entities.Approval.filter({ status: "pending" }).catch(() => []),
    ]);
    const p = plans[0];
    const focusItems = Array.isArray(p?.plan_data?.focus_items) ? p.plan_data.focus_items : [];
    if (p && focusItems.length) {
      setPriorities(focusItems.slice(0, 3).map((f) => ({ label: f?.title || "Taak", to: "/tasks" })));
      setSummary("Ik heb je dag heringericht op wat vandaag telt.");
      setUpdated(p.last_updated || p.updated_date || null);
    } else {
      const todayEvents = events
        .filter((e) => (e.start || "").slice(0, 10) === today && new Date(e.end || e.start) >= now)
        .sort((a, b) => new Date(a.start) - new Date(b.start));
      const overdue = tasks
        .filter((t) => t.status === "overdue")
        .sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0));
      const todayTasks = tasks.filter((t) => t.status === "today");
      const prio = [];
      overdue.slice(0, 2).forEach((t) => prio.push({ label: `Afronden — ${t.title}`, to: t.project_id ? `/projects/${t.project_id}` : "/tasks" }));
      todayEvents.slice(0, 1).forEach((e) => prio.push({ label: `Voorbereiden — ${e.title}`, to: "/agenda" }));
      todayTasks.slice(0, 2).forEach((t) => prio.push({ label: t.title, to: t.project_id ? `/projects/${t.project_id}` : "/tasks" }));
      if (emails.length && prio.length < 3) prio.push({ label: `${emails.length} belangrijke berichten beantwoorden`, to: "/email" });
      if (approvals.length && prio.length < 3) prio.push({ label: `${approvals.length} goedkeuringen afhandelen`, to: "/approvals" });
      setPriorities(prio.slice(0, 3));
      setSummary("Ik heb je dag opgebouwd op basis van wat er nu speelt.");
      setUpdated(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  // Zonder dit blijft de kaart uren stilstaan alsof het nog ochtend is.
  useEffect(() => {
    const i = setInterval(load, 5 * 60000);
    return () => clearInterval(i);
  }, [load]);

  const updatedStr = updated
    ? new Date(updated).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("jedag")} className="min-h-[320px]">
      <div className="flex flex-row h-full">
        {/* Editorial photo — touches the glass edges */}
        <div className="relative w-[34%] shrink-0 overflow-hidden rounded-r-[24px]">
          <img src={IMAGES.portraitBootFace} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent" />
          <div className="absolute left-3 bottom-3">
            <p className="text-[9px] uppercase tracking-[0.3em] font-semibold text-ivory/75">Giulia</p>
            <p className="text-[11px] text-ivory/60">je dag</p>
          </div>
        </div>

        {/* Glass content — left-aligned editorial */}
        <div className="flex-1 p-5 flex flex-col text-current min-h-0">
          {loading ? (
            <div className="flex-1 flex items-center justify-center"><div className="h-7 w-7 border-2 border-current/20 border-t-current rounded-full animate-spin" /></div>
          ) : (
            <>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-[0.26em] font-semibold text-current/60">Giulia · je dag</p>
                <h3 className="text-lg font-display font-semibold text-current leading-tight mt-0.5">{greetingWord()}.</h3>
                <p className="text-[11px] text-current/65 mt-1 text-balance line-clamp-2">{summary}</p>
              </div>

              <ol className="mt-3.5 space-y-2 flex-1">
                {priorities.map((p, i) => (
                  <li key={i} className="animate-fade-up" style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
                    <Link to={p.to} onClick={(e) => e.stopPropagation()} className="flex items-stretch gap-3 glass-1 rounded-xl px-3 py-2 hover:bg-white/5 transition text-left">
                      <span className="text-[24px] leading-none font-display font-bold tabular-nums w-7 shrink-0" style={{ color: "var(--tile-accent)" }}>{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-[12px] leading-snug text-current/90 pt-1">{p.label}</span>
                    </Link>
                  </li>
                ))}
                {priorities.length === 0 && (
                  <li className="text-[12px] text-current/55 glass-1 rounded-xl px-3 py-3">Een rustige dag — niets dringends.</li>
                )}
              </ol>

              <div className="mt-2 text-[9px] text-current/40 text-left">
                {updatedStr ? `Bijgewerkt om ${updatedStr}` : "Nog geen planning vandaag"}
              </div>
            </>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}