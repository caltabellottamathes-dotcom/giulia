import React, { useEffect, useMemo, useState } from "react";
import PanelShell from "@/glass/components/self/PanelShell";
import { BLUE, SAND } from "@/glass/components/self/palette";
import { base44 } from "@/api/base44Client";
import { fmtDate, fmtTime } from "@/lib/selfUtils";

function Trajectory({ name, progress, sessions }) {
  const nodes = ["START", "MID", "NOW", "NEXT"];
  const currentIdx = progress >= 75 ? 3 : progress >= 50 ? 2 : progress >= 25 ? 1 : 0;
  return (
    <div>
      <p className="text-storm/80 text-[10px] uppercase tracking-[0.25em] mb-5 font-semibold">{name}</p>
      <div className="relative flex items-center justify-between px-4">
        <div className="absolute left-8 right-8 top-1/2 h-0.5 bg-marble/20 -translate-y-1/2" />
        {nodes.map((n, i) => {
          const done = i < currentIdx;
          const current = i === currentIdx;
          return (
            <div key={i} className="flex flex-col items-center gap-3 z-10">
              <span className={`w-5 h-5 rounded-full border-2 ${current ? "animate-pulse" : done ? "" : "bg-marble/10 border-marble/30"}`} style={{ background: current ? SAND : done ? BLUE : "transparent", borderColor: current ? SAND : done ? BLUE : "rgba(255,255,255,0.3)" }} />
              <span className={`text-[10px] tracking-wide ${current ? "" : done ? "text-storm/70" : "text-storm/40"}`} style={current ? { color: SAND } : {}}>{n}</span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-3 text-storm/40 text-[9px] tracking-wider px-4">
        {sessions.map((s, i) => <span key={i}>{s}</span>)}
      </div>
    </div>
  );
}

export default function TherapyPanel() {
  const [trajectories, setTrajectories] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.TherapyTrajectory.list().catch(() => []),
      base44.entities.CalendarEvent.filter({ domain: "self" }).catch(() => []),
    ]).then(([t, e]) => { setTrajectories(t || []); setEvents(e || []); }).finally(() => setLoading(false));
  }, []);

  const active = useMemo(() => (trajectories || []).filter((t) => t.status === "active"), [trajectories]);
  const nextAppt = useMemo(() => {
    const all = (events || []).filter((e) => e.therapy_trajectory_id || active.some((t) => (t.event_ids || []).includes(e.id)));
    const future = all.filter((e) => e.start && new Date(e.start) >= new Date()).sort((a, b) => new Date(a.start) - new Date(b.start));
    return future[0] || null;
  }, [events, active]);

  const addNote = async () => {
    const t = active[0];
    if (!t) return;
    try { await base44.entities.TherapyTrajectory.update(t.id, { notes: [...(t.notes || []), "Nieuwe notitie toegevoegd"] }); const list = await base44.entities.TherapyTrajectory.list(); setTrajectories(list || []); } catch { /* ignore */ }
  };

  if (loading) return <PanelShell index="04" section="THERAPY" statement="LADEN…">{null}</PanelShell>;

  const upcoming = (events || []).filter((e) => e.therapy_trajectory_id || active.some((t) => (t.event_ids || []).includes(e.id))).filter((e) => e.start && new Date(e.start) >= new Date()).sort((a, b) => new Date(a.start) - new Date(b.start)).slice(0, 3);

  return (
    <PanelShell
      index="04"
      section={`THERAPY · ${active.length} ACTIEF`}
      statement={active.length ? "IN PROGRESS" : "GEEN TRAJECTEN"}
      context={[
        { label: "CURRENT", text: active[0] ? `${active[0].title} — ${active[0].therapist_name || "therapeut"}.` : "Geen actieve trajecten." },
        { label: "RECENT", text: active[0]?.notes?.length ? `Laatste notitie: ${active[0].notes[active[0].notes.length - 1]}` : "Nog geen notities." },
        { label: "NEXT", text: nextAppt ? `${fmtDate(nextAppt.start)} · ${fmtTime(nextAppt.start)}` : "Geen afspraak gepland." },
      ]}
      actions={[
        { label: "Add Note", onClick: addNote },
        { label: "Add Appointment", primary: true, to: "/self/therapy" },
        { label: "Open Therapy", to: "/self/therapy" },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        {active.slice(0, 2).map((t, i) => (
          <Trajectory key={t.id} name={t.title.toUpperCase()} progress={t.progress || 0} sessions={["START", `${(t.notes || []).length}N`, `${t.progress || 0}%`, "NEXT"]} />
        ))}
        {active.length < 2 && (
          <div className="flex items-center justify-center text-storm/40 text-sm">Voeg een tweede traject toe</div>
        )}
        {active.length === 0 && (
          <div className="flex items-center justify-center text-storm/40 text-sm col-span-2">Geen actieve therapie-trajecten.</div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border-l-4 bg-marble/5 px-8 py-8 flex items-center gap-8" style={{ borderColor: SAND }}>
          {nextAppt ? (
            <>
              <div className="text-center">
                <p className="text-6xl font-bold leading-none" style={{ color: SAND }}>{fmtDate(nextAppt.start).split(" ")[0]}</p>
                <p className="text-storm text-3xl font-semibold tabular-nums mt-2">{fmtTime(nextAppt.start)}</p>
              </div>
              <div className="h-20 w-px bg-marble/20" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: SAND }}>Next appointment</p>
                <p className="text-storm text-lg font-medium mt-2">{nextAppt.title}</p>
                <p className="text-storm/50 text-sm mt-1">{nextAppt.location || "—"}</p>
              </div>
            </>
          ) : (
            <div className="text-storm/50 text-sm">Geen afspraak gepland — voeg er een toe.</div>
          )}
        </div>
        <div className="rounded-2xl border border-marble/20 bg-marble/5 p-5">
          <p className="text-storm/50 text-[10px] uppercase tracking-[0.25em] mb-4">Upcoming</p>
          <div className="flex flex-col gap-3">
            {upcoming.length ? upcoming.map((u, i) => {
              const trj = active.find((t) => t.id === u.therapy_trajectory_id);
              return (
                <div key={u.id || i} className="flex items-center justify-between">
                  <span className="text-storm text-sm font-medium">{fmtDate(u.start)} · {fmtTime(u.start)}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: BLUE, color: "#2D2D23" }}>{trj?.title?.slice(0, 6) || "TRJ"}</span>
                </div>
              );
            }) : <p className="text-storm/40 text-xs">Geen aankomende afspraken.</p>}
          </div>
        </div>
      </div>
    </PanelShell>
  );
}