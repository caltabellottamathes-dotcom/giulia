import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WidgetShell from "@/system/widgets/WidgetShell";
import { usePanel } from "@/lib/PanelContext";
import { base44 } from "@/api/base44Client";
import { fetchUnifiedAttention, DOMAIN_META } from "@/lib/unifiedStream";
import { Plus } from "lucide-react";
import DagplanningCard from "./jedag/DagplanningCard";
import UrgentCard from "./jedag/UrgentCard";
import VoortgangCard from "./jedag/VoortgangCard";

const EASE = [0.22, 1, 0.36, 1];

const dayBounds = () => {
  const s = new Date(); s.setHours(0, 0, 0, 0);
  const e = new Date(); e.setHours(23, 59, 59, 999);
  return [s.toISOString(), e.toISOString()];
};

/**
 * GiuliaWidget — "Giulia · je dag". Drie uitklapbare glas-kaarten die samen
 * één vraag beantwoorden: Waar ben ik? Wat vraagt aandacht? Hoe gaat mijn dag?
 *
 *  1. Dagplanning — visuele tijdlijn met afspraken + bewegende nu-indicator
 *  2. Urgent — groot aantal + lijst van meest tijdsgevoelige items
 *  3. Voortgang — groot percentage + geanimeerde voortgangsbalk
 *
 * Eén sectie tegelijk open; Framer Motion regelt hoogte, opacity en progress.
 */
export default function GiuliaWidget() {
  const { openModule } = usePanel();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(0); // 0=Dagplanning, 1=Urgent, 2=Voortgang, -1=alle dicht

  const load = useCallback(async () => {
    const [start, end] = dayBounds();
    const [events, tasks, att] = await Promise.all([
      base44.entities.CalendarEvent.filter({ start: { $gte: start, $lt: end } }).catch(() => []),
      base44.entities.Task.list().catch(() => []),
      fetchUnifiedAttention(),
    ]);
    const todayEvents = (events || []).filter((e) => e.start).sort((a, b) => new Date(a.start) - new Date(b.start));
    const allTasks = tasks || [];
    const completed = allTasks.filter((t) => t.status === "completed");
    const active = allTasks.filter((t) => t.status !== "completed" && t.status !== "archived");

    // Urgent items — versmolten over alle domeinen
    const urgent = [];
    (att.approvals || []).slice(0, 2).forEach((a) => urgent.push({ label: `Goedkeuring — ${a.title || a.description || "open"}`, domain: "giulia", to: "/approvals" }));
    active.filter((t) => t.status === "overdue").slice(0, 3).forEach((t) => urgent.push({ label: t.title, domain: "focus", to: t.project_id ? `/projects/${t.project_id}` : "/tasks" }));
    (att.unreadEmails || []).filter((e) => e.important).slice(0, 2).forEach((e) => urgent.push({ label: e.subject || "Email", domain: "focus", to: "/email" }));
    (att.unreadWhatsapps || []).slice(0, 2).forEach((w) => urgent.push({ label: `WhatsApp — ${w.sender_name || "bericht"}`, domain: "focus", to: "/whatsapp" }));
    (att.lifeItemsDue || []).slice(0, 2).forEach((h) => urgent.push({ label: h.title || h.name || "Huishouden", domain: "life", to: "/life/household" }));
    (att.selfNeeds || []).filter((n) => n.priority === "high").slice(0, 1).forEach((n) => urgent.push({ label: n.title, domain: "self", to: "/self/daily-state" }));

    // Progress
    const totalTasks = allTasks.length;
    const doneTasks = completed.length;
    const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    setData({ events: todayEvents, urgent, progressPct, doneTasks, totalTasks, routines: att.routinesDueToday || [] });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const i = setInterval(load, 5 * 60000); return () => clearInterval(i); }, [load]);

  const sections = [
    { id: "dagplanning", label: "Dagplanning" },
    { id: "urgent", label: "Urgent" },
    { id: "voortgang", label: "Voortgang" },
  ];

  const dateStr = new Date().toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" });

  return (
    <WidgetShell size="2x2" radius="large" interactive onClick={() => openModule("jedag")} className="min-h-[340px] p-3.5">
      <div className="flex flex-col gap-2.5 h-full">
        {/* Header — clicking opens the full "Je Dag" panel */}
        <div className="flex items-center justify-between px-1 shrink-0">
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-current/55">Giulia · je dag</p>
            <p className="text-[13px] font-display font-medium text-current/85 mt-0.5 capitalize">{dateStr}</p>
          </div>
          <div className="h-2 w-2 rounded-full bg-olive animate-pulse-soft shrink-0" />
        </div>

        {/* Accordion — stopPropagation so toggles don't open the panel */}
        <div className="flex flex-col gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
          {loading ? (
            <div className="flex-1 flex items-center justify-center py-8">
              <div className="h-6 w-6 border-2 border-current/20 border-t-current rounded-full animate-spin" />
            </div>
          ) : (
            sections.map((s, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={s.id}
                  className={"rounded-[20px] border overflow-hidden transition-colors duration-500 " + (isOpen ? "glass-1 border-white/20" : "border-white/10 bg-current/[0.04]")}
                >
                  <button
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="flex items-center justify-between w-full px-3.5 py-2.5 text-left"
                  >
                    <span className={"text-[12px] font-display font-medium transition-colors " + (isOpen ? "text-current" : "text-current/70")}>{s.label}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 135 : 0 }}
                      transition={{ duration: 0.4, ease: EASE }}
                      className="shrink-0"
                    >
                      <Plus className={"h-4 w-4 transition-colors " + (isOpen ? "text-current" : "text-current/40")} />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <div className="px-3.5 pb-3.5">
                          {i === 0 && <DagplanningCard events={data.events} />}
                          {i === 1 && <UrgentCard items={data.urgent} />}
                          {i === 2 && <VoortgangCard pct={data.progressPct} done={data.doneTasks} total={data.totalTasks} routines={data.routines} />}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </div>
    </WidgetShell>
  );
}