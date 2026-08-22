import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { PhotoGlassLayeredWidget, WidgetHeader } from "@/system/widgets/primitives";
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

/** TimeTrackerFocusWidget — P·9x16·B·SIDE · "Where My Time Goes."
 *  PhotoShell toont de titel van het project dat getrackt wordt; net boven de
 *  GlassCard staat "aan welk project begin je?". De keuzemenu zit flush aan
 *  de bovenkant van de card; daaronder de bloom start/stop met lopende klok. */
export default function TimeTrackerFocusWidget() {
  const { openModule } = usePanel();
  const { data: entries, reload } = useEntityList("TimeEntry", { sort: "-start_time", limit: 80, realtime: true });
  const { data: projects } = useEntityList("Project", { sort: "-created_date", limit: 80, realtime: true });

  const running = useMemo(() => (entries || []).find((e) => e.status === "running"), [entries]);
  const [projId, setProjId] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
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
  const pickerLabel = running ? (activeProj?.title || "lopend") : (activeProj?.title || "Kies een project…");

  return (
    <div className="w-full h-[476px]">
      <PhotoGlassLayeredWidget shape="9:16" photo={PHOTO} glassPosition="bottom" glassFraction={0.50} overhang={0} domain="focus" radius="large" onClick={() => openModule("timetracker")} overlay="bg-gradient-to-t from-black/30 via-black/12 to-transparent"
        photoChildren={
          <>
            <div className="absolute top-0 inset-x-0 px-4 pt-4" style={{ color: IVORY }}>
              <WidgetHeader type="briefing" label="Where My Time Goes." />
              <h3 className="text-[22px] leading-tight font-display font-semibold tracking-[-0.02em] mt-1 truncate">{activeProj?.title || "Kies een project"}</h3>
              <div className="flex items-center gap-1.5 mt-2">
                <motion.span className="h-1.5 w-1.5 rounded-full" style={{ background: running ? LIGHT : "rgba(255,255,255,0.35)" }} animate={running ? { opacity: [0.3, 1, 0.3] } : { opacity: 0.4 }} transition={{ duration: 1, repeat: running ? Infinity : 0 }} />
                <span className="text-[8px] uppercase tracking-[0.18em] font-bold" style={{ color: running ? LIGHT : "rgba(255,255,255,0.55)" }}>{running ? "tracking" : "idle"}</span>
              </div>
            </div>
            <div className="absolute inset-x-4" style={{ bottom: "calc(50% + 8px)" }}>
              <p className="text-[8px] uppercase tracking-[0.18em] font-bold" style={{ color: LIGHT }}>aan welk project begin je?</p>
            </div>
          </>
        }
      >
        <div className="flex flex-col h-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {/* keuzemenu flush aan de bovenkant van de card */}
          <div className="relative w-full shrink-0 -mt-3.5">
            <button type="button" onClick={() => !running && setPickerOpen((o) => !o)} disabled={!!running}
              className="w-full flex items-center justify-between gap-2 rounded-full px-3 py-2 text-[12px] disabled:opacity-70"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", color: IVORY }}>
              <span className="truncate text-left">{pickerLabel}</span>
              <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${pickerOpen ? "rotate-180" : ""}`} style={{ color: LIGHT }} />
            </button>
            {pickerOpen && !running && (
              <div className="absolute z-50 left-0 right-0 top-full mt-1 rounded-2xl overflow-y-auto no-scrollbar max-h-[150px]"
                style={{ background: "rgba(48,23,40,0.97)", border: "1px solid rgba(216,218,179,0.32)", boxShadow: "0 14px 30px -10px rgba(0,0,0,0.5)" }}>
                {(projects || []).length === 0 ? (
                  <p className="px-3 py-2.5 text-[11px]" style={{ color: "rgba(255,255,255,0.6)" }}>Geen projecten.</p>
                ) : (projects || []).map((p) => (
                  <button key={p.id} type="button" onClick={() => { setProjId(p.id); setPickerOpen(false); }}
                    className="w-full text-left px-3 py-2 text-[12px] truncate transition-colors hover:bg-white/10"
                    style={{ color: p.id === projId ? LIGHT : IVORY, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {p.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* bloom + klok */}
          <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center">
            <button onClick={(e) => { e.stopPropagation(); toggle(); }} aria-label={running ? "Stop timer" : "Start timer"} className="relative h-[130px] w-[130px] rounded-full cursor-pointer" style={{ border: "none", background: "transparent" }}>
              <span ref={bloomRef} className="absolute inset-0 rounded-full will-change-transform" style={{ background: `radial-gradient(circle, ${DEEP} 0%, ${LIGHT} 48%, transparent 72%)`, filter: "blur(2px)", opacity: 0.92 }} />
              <span className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[24px] font-display font-bold tabular-nums leading-none" style={{ color: IVORY }}>{running ? fmtClock(elapsed) : "00:00:00"}</span>
                <span className="text-[8px] uppercase tracking-[0.2em] font-bold mt-1.5 text-center px-2" style={{ color: running ? LIGHT : "rgba(255,255,255,0.55)" }}>{running ? "lopend" : "kies & tik"}</span>
              </span>
            </button>
          </div>
        </div>
      </PhotoGlassLayeredWidget>
    </div>
  );
}