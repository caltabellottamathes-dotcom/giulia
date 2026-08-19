import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import WidgetShell from "../../system/widgets/WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";
import { fetchUnifiedAttention, DOMAIN_META } from "@/lib/unifiedStream";

const greetingWord = () => {
  const h = new Date().getHours();
  return h < 12 ? "Goedemorgen" : h < 18 ? "Goedemiddag" : "Goedenavond";
};

/**
 * GiuliaWidget — "Je dag · alles". Versmolten ochtendbriefing: de drie dingen
 * die er vandaag toe doen, getrokken uit Focus (plan/overdue), Life (sociale
 * afspraken/huishouden) én Self (routines/behoeften). Elk item draagt zijn domein.
 */
export default function GiuliaWidget() {
  const { openModule } = usePanel();
  const [priorities, setPriorities] = useState([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const now = new Date();
    const today = now.toLocaleDateString("sv-SE");
    const [plans, tasks, att] = await Promise.all([
      base44.entities.DailyPlan.filter({ date: today }).catch(() => []),
      base44.entities.Task.list().catch(() => []),
      fetchUnifiedAttention(),
    ]);
    const p = plans[0];
    const focusItems = Array.isArray(p?.plan_data?.focus_items) ? p.plan_data.focus_items : [];
    const prio = [];

    // FOCUS: plan-prioriteiten of overdue taken
    if (focusItems.length) {
      focusItems.slice(0, 2).forEach((f) => prio.push({ label: f?.title || "Taak", to: "/tasks", domain: "focus" }));
    } else {
      const overdue = (tasks || []).filter((t) => t.status === "overdue").sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0));
      overdue.slice(0, 1).forEach((t) => prio.push({ label: `Afronden — ${t.title}`, to: t.project_id ? `/projects/${t.project_id}` : "/tasks", domain: "focus" }));
    }

    // LIFE: sociale afspraken vandaag + huishouden dat aandacht vraagt
    (att.eventsByDomain.life || []).slice(0, 1).forEach((e) => prio.push({ label: `${e.title}${e.participants ? ` · ${e.participants}` : ""}`, to: "/life/social-planner", domain: "life" }));
    att.lifeItemsDue.slice(0, 1).forEach((h) => prio.push({ label: h.title, to: "/life/household", domain: "life" }));

    // SELF: routines die vandaag klaarstaan + dringende behoeften
    att.routinesDueToday.slice(0, 1).forEach((r) => prio.push({ label: r.title, to: "/self/routines", domain: "self" }));
    att.selfNeeds.filter((n) => n.priority === "high").slice(0, 1).forEach((n) => prio.push({ label: n.title, to: "/self/daily-state", domain: "self" }));

    // FOCUS fallback: werk-afspraken vandaag
    (att.eventsByDomain.focus || []).slice(0, 1).forEach((e) => prio.push({ label: e.title, to: "/agenda", domain: "focus" }));

    setPriorities(prio.slice(0, 3));
    setSummary(prio.length ? "Versmolten over Focus, Life en Self — wat er nu telt." : "Een rustige dag — niets dringends.");
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const i = setInterval(load, 5 * 60000); return () => clearInterval(i); }, [load]);

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("jedag")} className="min-h-[320px]">
      <div className="flex flex-row h-full">
        <div className="relative w-[34%] shrink-0 overflow-hidden rounded-r-[24px]">
          <img src={IMAGES.portraitBootFace} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent" />
          <div className="absolute left-3 bottom-3">
            <p className="text-[9px] uppercase tracking-[0.3em] font-semibold text-ivory/75">Giulia · alles</p>
            <p className="text-[11px] text-ivory/60">je dag</p>
          </div>
        </div>

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
                {priorities.map((p, i) => {
                  const meta = DOMAIN_META[p.domain] || DOMAIN_META.giulia;
                  return (
                    <li key={i} className="animate-fade-up" style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
                      <Link to={p.to} onClick={(e) => e.stopPropagation()} className="flex items-stretch gap-3 glass-1 rounded-xl px-3 py-2 hover:bg-white/5 transition text-left">
                        <span className="text-[24px] leading-none font-display font-bold tabular-nums w-7 shrink-0" style={{ color: meta.color }}>{String(i + 1).padStart(2, "0")}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] uppercase tracking-wider font-bold" style={{ color: meta.color }}>{meta.label}</span>
                          <p className="text-[12px] leading-snug text-current/90">{p.label}</p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
                {priorities.length === 0 && (
                  <li className="text-[12px] text-current/55 glass-1 rounded-xl px-3 py-3">Een rustige dag — niets dringends.</li>
                )}
              </ol>
            </>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}