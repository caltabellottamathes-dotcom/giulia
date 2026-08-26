import React from "react";
import { Sparkles, Heart } from "lucide-react";
import { LIFE, DARK } from "../socialColors";

/** OverviewSection — Social Moments (auto-gepromoveerd) + Opportunities. */
export default function OverviewSection({ data = { moments: [], opportunities: [] } }) {
  const moments = data.moments || [];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      <div className="rounded-[24px] p-5" style={{ background: DARK.card, border: `1px solid ${DARK.cardBorder}` }}>
        <p className="text-[10px] uppercase tracking-[0.24em] mb-3" style={{ color: LIFE.morningDew }}>Social Moments</p>
        <div className="space-y-2 max-h-[440px] overflow-auto pr-1">
          {moments.length ? moments.map((m) => (
            <div key={m.id} className="rounded-xl p-3" style={{ background: DARK.cardSoft }}>
              <div className="flex items-center gap-2"><Heart className="h-3.5 w-3.5 shrink-0" style={{ color: LIFE.pistachio }} /><p className="text-white text-sm font-medium truncate">{m.title}</p></div>
              <p className="text-white/45 text-[11px] mt-1 capitalize">{m.significance} significance · {m.occurred_at ? new Date(m.occurred_at).toLocaleDateString("nl-NL", { day: "numeric", month: "short" }) : "—"}</p>
            </div>
          )) : <p className="text-white/35 text-sm italic">No moments captured yet.</p>}
        </div>
      </div>
      <div className="rounded-[24px] p-5" style={{ background: DARK.card, border: `1px solid ${DARK.cardBorder}` }}>
        <p className="text-[10px] uppercase tracking-[0.24em] mb-3" style={{ color: LIFE.morningDew }}>Opportunities</p>
        <div className="space-y-2 max-h-[440px] overflow-auto pr-1">
          {(data.opportunities || []).length ? data.opportunities.map((o) => (
            <div key={o.id} className="rounded-xl p-3" style={{ background: DARK.cardSoft }}>
              <div className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 shrink-0" style={{ color: LIFE.pistachio }} /><p className="text-white text-sm font-medium truncate">{o.title}</p></div>
              <p className="text-white/45 text-[11px] mt-1 leading-relaxed">{o.reasoning}</p>
            </div>
          )) : <p className="text-white/35 text-sm italic">Nothing surfaced — that's fine.</p>}
        </div>
      </div>
    </div>
  );
}