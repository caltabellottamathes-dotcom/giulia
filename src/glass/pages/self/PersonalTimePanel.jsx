import React, { useEffect, useMemo, useState } from "react";
import PanelShell from "@/glass/components/self/PanelShell";
import { BLUE, SAND, fmtDur, toMin } from "@/glass/components/self/palette";
import { base44 } from "@/api/base44Client";

const DAY_START = 6, DAY_END = 24;
const totalDayMin = (DAY_END - DAY_START) * 60;

export default function PersonalTimePanel() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.PersonalTimeBlock.list("-start", 50).then((b) => setBlocks(b || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const today = useMemo(() => { const d = new Date().toDateString(); return (blocks || []).filter((b) => b.start && new Date(b.start).toDateString() === d && b.status !== "cancelled"); }, [blocks]);

  const byType = useMemo(() => {
    const map = {};
    for (const b of today) { const t = b.type || "free"; if (!map[t]) map[t] = { blocks: [], min: 0 }; map[t].blocks.push(b); map[t].min += b.duration_min || 0; }
    return map;
  }, [today]);

  const total = today.reduce((s, b) => s + (b.duration_min || 0), 0);
  const protectedMin = today.filter((b) => b.is_protected).reduce((s, b) => s + (b.duration_min || 0), 0);
  const available = Math.max(0, totalDayMin - total);

  const ROWS = [
    { label: "PROTECTED", min: byType.protected?.min || 0, c: BLUE },
    { label: "REST", min: byType.rest?.min || 0, c: SAND },
    { label: "RECOVERY", min: byType.recovery?.min || 0, c: "rgba(216,218,179,0.5)" },
    { label: "FREE", min: byType.free?.min || 0, c: "rgba(255,255,255,0.2)" },
  ];

  const COMP = today.map((b) => ({ w: b.duration_min || 30, c: b.is_protected ? BLUE : b.type === "rest" ? SAND : b.type === "recovery" ? "rgba(216,218,179,0.5)" : "rgba(255,255,255,0.15)" })).concat([{ w: available, c: "rgba(255,255,255,0.05)" }]);

  const protect = async () => {
    try { const start = new Date().toISOString(); const end = new Date(Date.now() + 30 * 60000).toISOString(); await base44.entities.PersonalTimeBlock.create({ title: "Beschermd moment", type: "protected", start, end, duration_min: 30, status: "scheduled", is_protected: true }); const b = await base44.entities.PersonalTimeBlock.list("-start", 50); setBlocks(b || []); } catch { /* ignore */ }
  };

  if (loading) return <PanelShell index="07" section="PERSONAL TIME" statement="LADEN…">{null}</PanelShell>;

  const h = Math.floor(available / 60), m = available % 60;

  return (
    <PanelShell
      index="07"
      section="PERSONAL TIME"
      statement={available > 0 ? "AVAILABLE" : "FULL"}
      context={[
        { label: "PROTECTED", text: `${fmtDur(protectedMin)} bewust gereserveerd vandaag.` },
        { label: "AVAILABLE", text: available > 0 ? `Nog ${fmtDur(available)} vrije ruimte.` : "Dag is vol." },
        { label: "AT RISK", text: today.length > 3 ? "Persoonlijke tijd mogelijk onder druk door veel blokken." : "Geen druk zichtbaar." },
      ]}
      actions={[
        { label: "Protect Time", primary: true, onClick: protect },
        { label: "Open Personal Time", to: "/self/personal-time" },
      ]}
    >
      <div className="flex items-end gap-6 mb-8">
        <div>
          <p className="text-storm text-7xl sm:text-8xl font-bold tabular-nums leading-none">{String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}</p>
          <p className="text-[11px] mt-3 tracking-[0.25em]" style={{ color: SAND }}>AVAILABLE TODAY</p>
        </div>
        <p className="text-storm/55 text-sm pb-3 max-w-xs leading-relaxed">De dag als één ruimtelijke structuur. {today.length ? `${today.length} blokken gepland.` : "Nog vrij — plan je tijd."}</p>
      </div>

      <div className="mb-8">
        <p className="text-storm/50 text-[10px] uppercase tracking-[0.25em] mb-3">Day composition</p>
        <div className="flex h-8 rounded-xl overflow-hidden gap-0.5">
          {COMP.map((seg, i) => (
            <div key={i} style={{ width: `${(seg.w / totalDayMin) * 100}%`, background: seg.c }} />
          ))}
        </div>
        <div className="flex justify-between text-storm/40 text-[10px] tracking-wider mt-2">
          <span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
        </div>
      </div>

      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
        {ROWS.map((row) => (
          <div key={row.label} className="flex items-center gap-5">
            <span className="w-32 text-storm text-sm font-medium tracking-wide">{row.label}</span>
            <div className="flex-1 flex gap-1">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="h-12 flex-1 rounded-md" style={{ background: i < Math.round((row.min / totalDayMin) * 20) ? row.c : "rgba(255,255,255,0.05)", border: i < Math.round((row.min / totalDayMin) * 20) ? "none" : "1px solid rgba(255,255,255,0.08)" }} />
              ))}
            </div>
            <span className="w-14 text-right text-storm/50 text-xs tabular-nums">{row.min > 0 ? fmtDur(row.min) : "—"}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-5 mt-6">
        <span className="flex items-center gap-2 text-[10px] tracking-wider" style={{ color: BLUE }}><span className="w-3 h-3 rounded-sm" style={{ background: BLUE }} />PROTECTED</span>
        <span className="flex items-center gap-2 text-[10px] tracking-wider" style={{ color: SAND }}><span className="w-3 h-3 rounded-sm" style={{ background: SAND }} />REST</span>
        <span className="flex items-center gap-2 text-[10px] tracking-wider text-storm/70"><span className="w-3 h-3 rounded-sm" style={{ background: "rgba(216,218,179,0.5)" }} />RECOVERY</span>
        <span className="flex items-center gap-2 text-[10px] tracking-wider text-storm/40"><span className="w-3 h-3 rounded-sm border border-marble/30" />FREE</span>
      </div>
    </PanelShell>
  );
}