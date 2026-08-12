import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { accentVars } from "@/lib/widgetAccent2";
import { IMAGES } from "@/lib/images";
import { Link } from "react-router-dom";

/* ANALYSE — Giulia (Je dag): begroeting, focus-prioriteiten vandaag genummerd,
 * samenvatting, praat met Giulia. Focus: ochtendbriefing, geprioriteerde
 * focus, conversationeel.
 * D2 "Conversatie-briefing" (3:4) — Giulia's gezicht + spreekwolk met de
 * briefing; prioriteiten als tikbare chips eronder. Motion: wolk typt in.
 * D3 "Focus-triptiek" (16:7) — drie grote genummerde focus-kaarten in een
 * rij; elk opent eigen space. Motion: kaarten rijzen in volgorde. */

const greetingWord = () => { const h = new Date().getHours(); return h < 12 ? "Goedemorgen" : h < 18 ? "Goedemiddag" : "Goedenavond"; };

function usePlan() {
  const [priorities, setPriorities] = useState([]);
  const [summary, setSummary] = useState("");
  useEffect(() => {
    (async () => {
      const today = new Date().toLocaleDateString("sv-SE");
      const [plans, tasks, events, emails, approvals] = await Promise.all([
        base44.entities.DailyPlan.filter({ date: today }).catch(() => []),
        base44.entities.Task.list().catch(() => []),
        base44.entities.Event.list().catch(() => []),
        base44.entities.Email.filter({ status: "unread" }).catch(() => []),
        base44.entities.Approval.filter({ status: "pending" }).catch(() => []),
      ]);
      const p = plans[0];
      const focus = Array.isArray(p?.plan_data?.focus_items) ? p.plan_data.focus_items : [];
      if (focus.length) { setPriorities(focus.slice(0, 3).map((f) => ({ label: f?.title || "Taak", to: "/tasks" }))); setSummary("Je dag heringericht op wat telt."); return; }
      const overdue = tasks.filter((t) => t.status === "overdue").sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0));
      const todayTasks = tasks.filter((t) => t.status === "today");
      const prio = [];
      overdue.slice(0, 2).forEach((t) => prio.push({ label: `Afronden — ${t.title}`, to: t.project_id ? `/projects/${t.project_id}` : "/tasks" }));
      todayTasks.slice(0, 2).forEach((t) => prio.push({ label: t.title, to: "/tasks" }));
      if (emails.length && prio.length < 3) prio.push({ label: `${emails.length} mails beantwoorden`, to: "/email" });
      if (approvals.length && prio.length < 3) prio.push({ label: `${approvals.length} goedkeuringen`, to: "/approvals" });
      setPriorities(prio.slice(0, 3));
      setSummary("Je dag opgebouwd op wat er speelt.");
    })();
  }, []);
  return { priorities, summary };
}

export function GiuliaDesign2() {
  const { priorities, summary } = usePlan();
  const [typed, setTyped] = useState("");
  const text = `${greetingWord()}. ${summary}`;
  useEffect(() => { let i = 0; setTyped(""); const t = setInterval(() => { i += 2; setTyped(text.slice(0, i)); if (i >= text.length) clearInterval(t); }, 26); return () => clearInterval(t); }, [text]);
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 flex shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "3/4", ...accentVars("olive") }}>
      <div className="relative w-[40%] shrink-0 overflow-hidden rounded-r-[20px]">
        <img src={IMAGES.portraitBootFace} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/55 to-transparent" />
        <p className="absolute left-2 bottom-2 text-[9px] uppercase tracking-[0.3em] font-semibold text-ivory/85">Giulia</p>
      </div>
      <div className="flex-1 p-4 flex flex-col text-ivory min-h-0">
        <p className="text-[10px] uppercase tracking-[0.28em] font-semibold opacity-60">je dag</p>
        <div className="glass-1 rounded-2xl rounded-tl-sm px-3 py-2.5 mt-2">
          <p className="text-[11px] leading-snug min-h-[3rem]">{typed}<span className="opacity-60 animate-pulse-soft">▍</span></p>
        </div>
        <div className="mt-3 space-y-1.5 flex-1 min-h-0">
          {priorities.map((p, i) => (
            <Link key={i} to={p.to} className="flex items-center gap-2 glass-1 rounded-lg px-2 py-1.5 hover:bg-white/10 transition">
              <span className="text-[14px] font-display font-bold leading-none" style={{ color: "var(--tile-accent)" }}>{String(i + 1).padStart(2, "0")}</span>
              <span className="text-[10px] leading-tight line-clamp-2">{p.label}</span>
            </Link>
          ))}
        </div>
        <Link to="/chat" className="mt-2 rounded-full py-2 text-[11px] font-semibold text-center" style={{ background: "var(--tile-accent)", color: "#fff" }}>Praat met Giulia</Link>
      </div>
    </div>
  );
}

export function GiuliaDesign3() {
  const { priorities, summary } = usePlan();
  return (
    <div className="relative w-full rounded-[24px] overflow-hidden glass-3 p-4 text-ivory flex flex-col shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45)]" style={{ aspectRatio: "16/7", ...accentVars("olive") }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-65">Giulia · {greetingWord().toLowerCase()}</p>
        <span className="text-[10px] opacity-50">{summary}</span>
      </div>
      <div className="flex-1 grid grid-cols-3 gap-2 min-h-0">
        {priorities.map((p, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}>
            <Link to={p.to} className="h-full flex flex-col justify-between rounded-2xl p-3 hover:-translate-y-0.5 transition" style={{ background: i === 0 ? "var(--tile-accent)" : "rgba(255,255,255,0.1)", color: i === 0 ? "#fff" : undefined }}>
              <span className="text-[40px] font-display font-bold leading-none tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-[11px] font-medium leading-tight line-clamp-3 mt-2">{p.label}</span>
            </Link>
          </motion.div>
        ))}
        {priorities.length === 0 && <p className="col-span-full m-auto text-xs opacity-40">Een rustige dag.</p>}
      </div>
    </div>
  );
}

export default { Design2: GiuliaDesign2, Design3: GiuliaDesign3 };