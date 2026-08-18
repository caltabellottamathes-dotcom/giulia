import React, { useEffect, useState } from "react";
import PanelShell from "@/glass/components/self/PanelShell";
import { BLUE, SAND, STORM, TRACK, moodScore } from "@/glass/components/self/palette";
import { base44 } from "@/api/base44Client";
import { stateLabel } from "@/lib/selfUtils";

const circ = (r) => 2 * Math.PI * r;

function sparklinePts(values, max = 100) {
  if (!values.length) return "0,30 100,30";
  const w = 100, h = 50;
  const step = w / (values.length - 1 || 1);
  return values.map((v, i) => `${(i * step).toFixed(1)},${(h - (Math.min(v, max) / max) * h).toFixed(1)}`).join(" ");
}

export default function DailyStatePanel() {
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.SelfCheckIn.list("-timestamp", 20).then((c) => { setCheckIns(c || []); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const latest = checkIns[0];
  const energy = latest?.energy ?? 0;
  const capacity = latest?.capacity ?? 0;
  const mood = moodScore(latest?.mood);
  const stateText = latest ? stateLabel(latest.state).toUpperCase() : "—";

  const eHist = checkIns.slice(0, 7).reverse().map((c) => c.energy ?? 0);
  const cHist = checkIns.slice(0, 7).reverse().map((c) => c.capacity ?? 0);
  const mHist = checkIns.slice(0, 7).reverse().map((c) => moodScore(c.mood));

  const VALUES = [
    { v: energy, l: "ENERGY", c: BLUE, pts: sparklinePts(eHist) },
    { v: capacity, l: "CAPACITY", c: SAND, pts: sparklinePts(cHist) },
    { v: mood, l: "MOOD", c: SAND, pts: sparklinePts(mHist) },
  ];
  const ARCS = [
    { pct: energy, r: 100, c: BLUE, label: "ENERGY" },
    { pct: capacity, r: 78, c: SAND, label: "CAPACITY" },
    { pct: mood, r: 56, c: SAND, label: "MOOD" },
  ];

  const saveCheckIn = async () => {
    try {
      await base44.entities.SelfCheckIn.create({ state: "neutral", energy: 50, capacity: 50, mood: "neutral", timestamp: new Date().toISOString(), source: "manual", check_in_type: "manual" });
      const c = await base44.entities.SelfCheckIn.list("-timestamp", 20);
      setCheckIns(c || []);
    } catch { /* ignore */ }
  };

  if (loading) return <PanelShell index="01" section="DAILY STATE" statement="LADEN…">{null}</PanelShell>;

  return (
    <PanelShell
      index="01"
      section="DAILY STATE"
      statement={stateText}
      context={[
        { label: "LAATSTE CHECK-IN", text: latest ? `${stateLabel(latest.state)} · ${latest.energy ?? "—"}% energie · ${latest.capacity ?? "—"}% capaciteit` : "Nog geen check-in vandaag." },
        { label: "WHAT MATTERS NOW", text: capacity < 30 ? "Capaciteit is laag — plan geen zware taken." : energy < 25 ? "Energie is laag — bescherm je focus." : "Stabiele state — geen scherpe verschuivingen." },
        { label: "NOW", text: latest?.reflection || "Geen reflectie vastgelegd bij laatste check-in." },
      ]}
      actions={[
        { label: "Check In", primary: true, onClick: saveCheckIn },
        { label: "Open Daily State", to: "/self/daily-state" },
      ]}
    >
      <div className="grid grid-cols-3 divide-x divide-marble/20 border-y border-marble/20">
        {VALUES.map((x) => (
          <div key={x.l} className="py-8 px-6">
            <p className="text-storm text-6xl font-bold tabular-nums leading-none">{x.v}</p>
            <p className="text-[10px] tracking-[0.3em] mt-3" style={{ color: x.c }}>{x.l}</p>
            <svg viewBox="0 0 100 50" className="w-full h-10 mt-4" preserveAspectRatio="none">
              <polyline points={x.pts} fill="none" stroke={x.c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col lg:flex-row gap-10 items-center">
        <div className="relative w-64 h-64 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 240 240">
            {ARCS.map((a) => (
              <g key={a.label}>
                <circle cx="120" cy="120" r={a.r} fill="none" stroke={TRACK} strokeWidth="10" />
                <circle cx="120" cy="120" r={a.r} fill="none" stroke={a.c} strokeWidth="10" strokeLinecap="round" strokeDasharray={circ(a.r)} strokeDashoffset={circ(a.r) - (a.pct / 100) * circ(a.r)} />
              </g>
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-storm text-3xl font-bold">{stateText}</span>
            <span className="text-storm/50 text-[10px] tracking-[0.25em] mt-1">STATE FIELD</span>
          </div>
        </div>

        <div className="flex-1 w-full">
          <p className="text-storm/50 text-[10px] uppercase tracking-[0.25em] mb-4">Energy · laatste {eHist.length} check-ins</p>
          <svg viewBox="0 0 400 170" className="w-full h-44" preserveAspectRatio="none">
            {[0, 1, 2, 3].map((i) => <line key={i} x1="0" y1={i * 40 + 10} x2="400" y2={i * 40 + 10} stroke={TRACK} />)}
            <line x1="0" y1="120" x2="400" y2="120" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="4 4" />
            <defs>
              <linearGradient id="dsArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BLUE} stopOpacity="0.5" />
                <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
              </linearGradient>
            </defs>
            {eHist.length > 1 && (
              <>
                <path d={`M0,${170 - (eHist[0] / 100) * 150} ${eHist.map((v, i) => `L${(i / (eHist.length - 1)) * 400},${170 - (v / 100) * 150}`).join(" ")} L400,170 L0,170 Z`} fill="url(#dsArea)" />
                <path d={`M0,${170 - (eHist[0] / 100) * 150} ${eHist.map((v, i) => `L${(i / (eHist.length - 1)) * 400},${170 - (v / 100) * 150}`).join(" ")}`} fill="none" stroke={BLUE} strokeWidth="2.5" />
                <circle cx="400" cy={170 - (eHist[eHist.length - 1] / 100) * 150} r="7" fill={SAND} />
                <circle cx="400" cy={170 - (eHist[eHist.length - 1] / 100) * 150} r="14" fill="none" stroke={SAND} strokeWidth="1.5" opacity="0.5" />
              </>
            )}
          </svg>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-6">
        {ARCS.map((a) => (
          <div key={a.label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: a.c }} />
            <span className="text-storm/70 text-xs tracking-wide">{a.label} · {a.pct}</span>
          </div>
        ))}
      </div>
    </PanelShell>
  );
}