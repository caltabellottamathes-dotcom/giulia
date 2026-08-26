import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { StateGlyph, BarField, ObjectCard, Chip, EmptyVisual, Kicker, Meter } from "./primitives";
import { meaningfulInteractions, socialHeatmap, socialChangeCompare, intensitySeries, PULSE_LABEL, daysSince } from "@/lib/domainUtils";

/* SOCIAL PULSE — what's happening. Current pulse, activity timeline,
   meaningful moments, social intensity, heatmap, invitations, change. */

const SRC_ICON = { whatsapp: "💬", email: "✉", calendar: "▦", socialplan: "◆", manual: "•" };
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function PulseTab({ data, state, mi }) {
  const [period, setPeriod] = useState("week");
  const [openMoment, setOpenMoment] = useState(null);

  const todayTimeline = useMemo(() => {
    const t = new Date().toDateString();
    const items = [];
    (data.whatsapps || []).filter((m) => m.timestamp && new Date(m.timestamp).toDateString() === t).forEach((m) => items.push({ ts: m.timestamp, src: "whatsapp", label: "WhatsApp", contact: m.contact_id }));
    (data.emails || []).filter((e) => (e.folder === "sent" || e.status === "sent") && e.timestamp && new Date(e.timestamp).toDateString() === t).forEach((e) => items.push({ ts: e.timestamp, src: "email", label: "Email" }));
    (data.events || []).filter((e) => e.domain === "life" && new Date(e.start).toDateString() === t).forEach((e) => items.push({ ts: e.start, src: "calendar", label: e.title }));
    return items.sort((a, b) => new Date(a.ts) - new Date(b.ts));
  }, [data]);

  const moments = data.moments || [];
  const heat = useMemo(() => socialHeatmap({ whatsapps: data.whatsapps, emails: data.emails, events: data.events, weeks: 3 }), [data]);
  const maxHeat = Math.max(1, ...heat.flat());
  const change = useMemo(() => socialChangeCompare({ whatsapps: data.whatsapps, emails: data.emails, events: data.events }), [data]);

  const intensityBars = useMemo(() => {
    const weeks = period === "day" ? 1 : period === "month" ? 4 : period === "long" ? 12 : 2;
    const ts = [...(data.whatsapps || []).map((m) => m.timestamp), ...(data.emails || []).filter((e) => e.folder === "sent" || e.status === "sent").map((e) => e.timestamp), ...(data.events || []).filter((e) => e.domain === "life").map((e) => e.start)];
    return intensitySeries(ts, weeks);
  }, [data, period]);
  const maxI = Math.max(1, ...intensityBars);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-4">
        <ObjectCard kicker="03.1" title="Current Pulse" className="justify-center items-center">
          <StateGlyph label={state} sub={`${mi.total} meaningful · ${data.intentions?.length || 0} invitations`} dots={Math.min(7, mi.total)} />
        </ObjectCard>
        <ObjectCard kicker="03.2" title="Activity Timeline · Today">
          {todayTimeline.length ? (
            <div className="space-y-2">
              {todayTimeline.slice(0, 8).map((it, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-center gap-3">
                  <span className="text-[10px] tabular-nums text-muted-foreground w-12">{new Date(it.ts).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</span>
                  <span className="text-base">{SRC_ICON[it.src]}</span>
                  <span className="text-sm flex-1 truncate">{it.label}</span>
                </motion.div>
              ))}
            </div>
          ) : <EmptyVisual title="QUIET" subtitle="Nothing meaningful detected recently." />}
        </ObjectCard>
      </div>

      <ObjectCard kicker="03.3" title="Meaningful Moments" action={<button onClick={() => setOpenMoment(true)} className="text-[10px] uppercase tracking-widest font-semibold text-olive">+ Add</button>}>
        {moments.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {moments.slice(0, 8).map((m) => (
              <motion.div key={m.id} whileHover={{ y: -2 }} className="rounded-xl border border-foreground/10 p-3 flex flex-col">
                <Chip tone="olive" className="self-start mb-2">meaningful moment</Chip>
                <p className="text-sm font-medium flex-1">{m.title}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1">{new Date(m.occurred_at || m.created_date).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" })} · {m.moment_type}</p>
              </motion.div>
            ))}
          </div>
        ) : <EmptyVisual title="QUIET" subtitle="No meaningful moments recorded yet." />}
      </ObjectCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ObjectCard kicker="03.4" title="Social Intensity" action={
          <div className="flex gap-1">{[["day", "Day"], ["week", "Week"], ["month", "Month"], ["long", "Long"]].map(([k, l]) => <button key={k} onClick={() => setPeriod(k)} className={`text-[9px] uppercase px-2 py-1 rounded-full ${period === k ? "bg-olive text-white" : "text-muted-foreground border border-foreground/15"}`}>{l}</button>)}</div>
        }>
          <BarField rows={intensityBars.map((v, i) => ({ label: `w${i + 1}`, value: v }))} />
        </ObjectCard>
        <ObjectCard kicker="03.5" title="Social Heatmap · 3 weeks">
          <div className="space-y-1.5">
            <div className="flex gap-1 ml-10">{DOW.map((d) => <span key={d} className="flex-1 text-[8px] uppercase text-muted-foreground text-center">{d.slice(0, 1)}</span>)}</div>
            {heat.map((week, wi) => (
              <div key={wi} className="flex items-center gap-1">
                <span className="text-[8px] uppercase text-muted-foreground w-8">wk{wi + 1}</span>
                {week.map((v, di) => <div key={di} className="flex-1 h-5 rounded-sm" style={{ background: v ? `hsl(var(--olive) / ${0.25 + (v / maxHeat) * 0.75})` : "hsl(var(--foreground) / 0.05)" }} title={`${v} interactions`} />)}
              </div>
            ))}
          </div>
        </ObjectCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ObjectCard kicker="03.6" title="Invitations">
          {(data.intentions || []).length ? (
            <div className="space-y-2">
              {data.intentions.slice(0, 5).map((i) => (
                <div key={i.id} className="rounded-xl border border-foreground/10 p-3 flex items-center justify-between">
                  <div><p className="text-sm">{i.description}</p><Chip className="mt-1">{i.kind?.replace(/_/g, " ")}</Chip></div>
                  <Chip tone="sand">open</Chip>
                </div>
              ))}
            </div>
          ) : <EmptyVisual title="OPEN" subtitle="No open invitations." />}
        </ObjectCard>
        <ObjectCard kicker="03.7" title="Social Change · week vs week">
          <div className="space-y-3">
            <Meter value={change.lastWeek} max={Math.max(change.thisWeek, change.lastWeek, 1)} label="Last week" accent="sand" sub={`${change.lastWeek}`} />
            <Meter value={change.thisWeek} max={Math.max(change.thisWeek, change.lastWeek, 1)} label="This week" accent="olive" sub={`${change.thisWeek}`} />
            <p className="font-display font-semibold text-lg">{change.deltaPct > 0 ? "+" : ""}{change.deltaPct}%</p>
          </div>
        </ObjectCard>
      </div>

      {openMoment && <AddMoment onClose={() => setOpenMoment(null)} contacts={data.contacts} />}
    </div>
  );
}

function AddMoment({ onClose, contacts }) {
  const [title, setTitle] = useState(""); const [cid, setCid] = useState(""); const [saving, setSaving] = useState(false);
  const save = async () => { if (!title.trim()) return; setSaving(true); try { await base44.entities.SocialMoment.create({ title: title.trim(), occurred_at: new Date().toISOString(), contact_ids: cid ? [cid] : [], significance: "medium" }); onClose(); } finally { setSaving(false); } };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-charcoal/30 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md rounded-2xl border border-foreground/10 bg-card p-6">
        <h3 className="font-display font-semibold mb-4">New meaningful moment</h3>
        <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus placeholder="What happened?" className="w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm outline-none focus:border-olive/50 mb-3" />
        <select value={cid} onChange={(e) => setCid(e.target.value)} className="w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm outline-none mb-4"><option value="">— person —</option>{contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <div className="flex justify-end gap-2"><button onClick={onClose} className="text-sm text-muted-foreground px-3 py-1.5">Cancel</button><button onClick={save} disabled={saving} className="text-sm font-semibold text-white bg-olive px-4 py-1.5 rounded-full disabled:opacity-50">{saving ? "…" : "Save"}</button></div>
      </motion.div>
    </div>
  );
}