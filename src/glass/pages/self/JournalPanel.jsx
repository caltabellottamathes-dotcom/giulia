import React, { useEffect, useMemo, useState } from "react";
import PanelShell from "@/glass/components/self/PanelShell";
import { BLUE, SAND } from "@/glass/components/self/palette";
import { base44 } from "@/api/base44Client";
import { fmtTime } from "@/lib/selfUtils";

const WEIGHT = { entry: "sm", moment: "md", reflection: "sm", highlight: "lg", thread: "xs" };
const size = { xs: "text-base text-storm/70", sm: "text-xl text-storm", md: "text-2xl text-storm font-semibold", lg: "text-4xl sm:text-5xl text-storm font-bold tracking-tight" };
const dot = { xs: "w-2.5 h-2.5", sm: "w-3.5 h-3.5", md: "w-4 h-4", lg: "w-5 h-5" };
const barH = { xs: 12, sm: 24, md: 40, lg: 64 };

export default function JournalPanel() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.JournalEntry.list("-date", 50).then((e) => setEntries(e || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const today = useMemo(() => { const d = new Date().toDateString(); return (entries || []).filter((e) => e.date && new Date(e.date).toDateString() === d).sort((a, b) => new Date(a.date) - new Date(b.date)); }, [entries]);

  const MOMENTS = today.map((e) => ({
    time: fmtTime(e.date),
    label: e.title,
    weight: WEIGHT[e.type] || "sm",
    tag: (e.type || "entry").toUpperCase(),
    open: e.is_highlight,
  }));

  const tagCounts = useMemo(() => {
    const m = {};
    for (const e of entries || []) for (const t of e.tags || []) m[t] = (m[t] || 0) + 1;
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([t]) => t);
  }, [entries]);

  const addMoment = async () => {
    try {
      await base44.entities.JournalEntry.create({ title: "Nieuw moment", type: "moment", date: new Date().toISOString() });
      const e = await base44.entities.JournalEntry.list("-date", 50); setEntries(e || []);
    } catch { /* ignore */ }
  };

  if (loading) return <PanelShell index="05" section="JOURNAL" statement="LADEN…">{null}</PanelShell>;

  const highlight = MOMENTS.find((m) => m.open) || MOMENTS[MOMENTS.length - 1];

  return (
    <PanelShell
      index="05"
      section={`TODAY · ${MOMENTS.length} MOMENTS`}
      statement={highlight ? highlight.label.toUpperCase() : "VANDAG LEEG"}
      context={[
        { label: "TODAY'S HIGHLIGHT", text: highlight ? highlight.label : "Nog geen highlight vandaag." },
        { label: "EMERGING", text: tagCounts.length ? tagCounts.join(", ") : "Nog geen terugkerende tags." },
        { label: "TOTAL", text: `${entries.length} entries in je journal.` },
      ]}
      actions={[
        { label: "Add Moment", primary: true, onClick: addMoment },
        { label: "Open Journal", to: "/self/journal" },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-10">
        <div className="relative">
          <div className="absolute left-[100px] top-6 bottom-6 w-px bg-marble/20" />
          {MOMENTS.length ? MOMENTS.map((m, i) => (
            <div key={i} className="flex items-start gap-6 py-4 relative">
              <span className="w-20 text-storm text-base font-semibold tabular-nums text-right pt-1.5">{m.time}</span>
              <span className={`z-10 mt-2 rounded-full ${dot[m.weight]}`} style={{ background: m.open ? SAND : BLUE }} />
              <div className="flex-1">
                <p className={size[m.weight]}>{m.label}</p>
                {m.open && <div className="mt-3 h-px w-44" style={{ background: SAND, opacity: 0.6 }} />}
                {!m.open && <p className="text-storm/40 text-[10px] tracking-[0.2em] mt-1">{m.tag}</p>}
              </div>
            </div>
          )) : <p className="text-storm/40 text-sm px-4">Vandaag is nog leeg — voeg een moment toe.</p>}
        </div>

        <div className="lg:border-l border-marble/20 lg:pl-8">
          <p className="text-storm/80 text-[10px] uppercase tracking-[0.25em] mb-4 font-semibold">Emerging</p>
          <div className="flex flex-wrap gap-2">
            {tagCounts.length ? tagCounts.map((e, i) => (
              <span key={e} className="text-sm px-3 py-1.5 rounded-full border" style={{ background: i === 0 ? "rgba(216,218,179,0.15)" : "rgba(225,231,239,0.15)", color: i === 0 ? SAND : BLUE, borderColor: i === 0 ? "rgba(216,218,179,0.4)" : "rgba(225,231,239,0.3)" }}>{e}</span>
            )) : <p className="text-storm/40 text-xs">Nog geen tags.</p>}
          </div>
          <div className="mt-8">
            <p className="text-storm/50 text-[10px] uppercase tracking-[0.25em] mb-4">Magnitude</p>
            <div className="flex items-end gap-1.5 h-20">
              {MOMENTS.length ? MOMENTS.map((m, i) => (
                <div key={i} className="flex-1 rounded-t" style={{ height: barH[m.weight], background: m.weight === "lg" ? SAND : BLUE }} />
              )) : <p className="text-storm/40 text-xs">—</p>}
            </div>
            <p className="text-storm/40 text-[9px] tracking-wider mt-2 text-center">over de dag</p>
          </div>
        </div>
      </div>
    </PanelShell>
  );
}