import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { WidgetShell, WidgetHeader } from "@/system/widgets/primitives";
import { usePanel } from "@/lib/PanelContext";
import { useEntityList } from "@/hooks/useEntity";
import { base44 } from "@/api/base44Client";
import { IMAGES } from "@/lib/images";

const PHOTO = IMAGES.focusCoat;
const DEEP = "hsl(var(--d-focus-deep))";
const LIGHT = "hsl(var(--d-focus-light))";
const IVORY = "hsl(var(--ivory))";

const fmtClock = (sec) => {
  const s = Math.floor(sec || 0);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
};

/** TimeTrackerFocusWidget — "Where My Time Goes." · foto-shell + bloom.
 *  GlassCard: bovenin een project-keuze, daaronder de bloom. Tik op de bloom
 *  start de tijd voor het gekozen project (maakt een lopende TimeEntry aan);
 *  nog eens tiken stopt hem (vult end_time + duur). De lopende klok is zicht-
 *  baar in de widget, het TimeTracker-paneel en de Project-pagina (via de
 *  TimeEntry-entity). Focus-kleuren. */
export default function TimeTrackerFocusWidget() {
  const { openModule } = usePanel();
  const { data: entries, reload } = useEntityList("TimeEntry", { sort: "-start_time", limit: 80, realtime: true });
  const { data: projects } = useEntityList("Project", { sort: "-created_date", limit: 80, realtime: true });

  const running = useMemo(() => (entries || []).find((e) => e.status === "running"), [entries]);
  const [projId, setProjId] = useState("");
  const [now, setNow] = useState(Date.now());
  const bloomRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => { if (!running) return; const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, [running]);
  useEffect(() => { if (!projId && projects?.length) setProjId(projects[0].id); }, [projects, projId]);

  const elapsed = running && running.start_time ? (now - new Date(running.start_time).getTime()) / 1000 : 0;

  useEffect(() => {
    const loop = () => {
      const t = performance.now() / 1000;
      const speed = running ? 1.8 : 1.0;
      const breath = 0.10 * Math.sin(t * speed);
      const scale = 0.9 + (running ? 0.16 : 0.05) + breath;
      const opacity = 0.6 + (running ? 0.25 : 0.05) + 0.04 * Math.sin(t * speed);
      const el = bloomRef.current;
      if (el) { el.style.transform = `scale(${scale})`; el.style.opacity = String(opacity); }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running]);

  const toggle = async () => {
    if (running) {
      const dur = Math.max(1, Math.round(((Date.now() - new Date(running.start_time).getTime()) / 1000) / 60));
      await base44.entities.TimeEntry.update(running.id, { end_time: new Date().toISOString(), duration_minutes: dur, status: "stopped" }).catch(() => {});
      reload();
    } else {
      if (!projId) return;
      const proj = (projects || []).find((p) => p.id === projId);
      await base44.entities.TimeEntry.create({ project_id: projId, project_title: proj?.title || "", start_time: new Date().toISOString(), status: "running", duration_minutes: 0 }).catch(() => {});
      reload();
    }
  };

  const activeProj = (projects || []).find((p) => p.id === (running?.project_id || projId));

  return (
    <WidgetShell domain="focus" radius="large" className="w-full h-[460px] min-h-0">
      <img src={PHOTO} alt="Where My Time Goes" className="absolute inset-0 w-full h-full object-cover" />
      <button type="button" onClick={() => openModule("timetracker")} aria-label="Open tijdregistratie" className="absolute inset-0 z-0 cursor-pointer" />

      <div className="absolute top-0 inset-x-0 px-4 pt-4 pb-8 bg-gradient-to-b from-black/45 to-transparent flex items-start justify-between" style={{ color: IVORY }}>
        <WidgetHeader type="briefing" label="Where My Time Goes." />
        <span className="flex items-center gap-1.5 pt-1 text-[7px] uppercase tracking-[0.18em] font-bold">
          <motion.span className="h-1.5 w-1.5 rounded-full" style={{ background: running ? LIGHT : "rgba(255,255,255,0.35)" }} animate={running ? { opacity: [0.3, 1, 0.3] } : { opacity: 0.4 }} transition={{ duration: 1, repeat: running ? Infinity : 0 }} />
          {running ? "tracking" : "idle"}
        </span>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-[52%] bg-gradient-to-t from-black/65 via-black/30 to-transparent pointer-events-none" />

      <div className="absolute inset-x-0 bottom-0 h-[52%] rounded-t-[28px] flex flex-col items-center px-4 pt-3 pb-3.5 overflow-hidden"
        style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px) saturate(1.35)", WebkitBackdropFilter: "blur(12px) saturate(1.35)", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 18px 44px -22px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.22)" }}>
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${LIGHT} 18%, ${LIGHT} 82%, transparent)` }} />

        {/* project-keuze */}
        <div className="w-full shrink-0" onClick={(e) => e.stopPropagation()}>
          <p className="text-[9px] uppercase tracking-[0.18em] font-bold mb-1.5" style={{ color: LIGHT }}>Aan welk project begin je?</p>
          <select value={running ? (running.project_id || "") : projId} onChange={(e) => setProjId(e.target.value)} disabled={!!running}
            className="w-full rounded-full px-3.5 py-2 text-[12px] focus:outline-none disabled:opacity-70"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", color: IVORY }}>
            <option value="" style={{ color: "#000" }}>Kies een project…</option>
            {(projects || []).map((p) => <option key={p.id} value={p.id} style={{ color: "#000" }}>{p.title}</option>)}
          </select>
        </div>

        {/* bloom + klok */}
        <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center">
          <button onClick={(e) => { e.stopPropagation(); toggle(); }} aria-label={running ? "Stop timer" : "Start timer"} className="relative h-[120px] w-[120px] rounded-full cursor-pointer" style={{ border: "none", background: "transparent" }}>
            <span ref={bloomRef} className="absolute inset-0 rounded-full will-change-transform" style={{ background: `radial-gradient(circle, ${DEEP} 0%, ${LIGHT} 48%, transparent 72%)`, filter: "blur(2px)", opacity: 0.92 }} />
            <span className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[22px] font-display font-bold tabular-nums leading-none" style={{ color: IVORY }}>{running ? fmtClock(elapsed) : "00:00:00"}</span>
              <span className="text-[9px] uppercase tracking-[0.22em] font-bold mt-1.5 text-center px-2" style={{ color: running ? LIGHT : "rgba(255,255,255,0.55)" }}>{running ? (activeProj?.title || "lopend") : "kies & tik"}</span>
            </span>
          </button>
        </div>
      </div>
    </WidgetShell>
  );
}