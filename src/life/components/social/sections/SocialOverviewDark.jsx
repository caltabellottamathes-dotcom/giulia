import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { AnimatedRing } from "@/glass/components/modules/viz";
import Avatar from "@/system/components/glass/Avatar";
import { personalBaseline, contactRecentTrend, daysSince, PULSE_LABEL } from "@/lib/domainUtils";
import { Heart, Sparkles, CalendarHeart, Users, ArrowRight, Plus, Clock, UserPlus, Zap, TrendingUp, TrendingDown } from "lucide-react";

/* SocialOverviewDark — de echte §01 OVERVIEW-structuur, in de donkere
 * glas-stijl van de SocialOverviewPreview-panel (lichte tekst op donker glas,
 * pistachio-accent, editorial typografie). Scrollt binnen de glaskaart. */

const ACCENT = "#d8dab3";
const URGENT = "#d5e24a";
const TYPE = { whatsapp: "#94925d", email: "#b1bec6", event: "#d8dab3", moment: "#d5e24a" };
const BLOCK_COLOR = { rest: "#b1bec6", recovery: "#cfd9dd", free: "#d8dab3", social: "#94925d", protected: "#d5e24a", work: "#4a4a44" };

const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } } };

export default function SocialOverviewDark({ data, mi, circle, activePlans, state, onNavigate }) {
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);

  /* 01.2 — weekelijkse activiteit met type-breakdown */
  const weekDays = useMemo(() => {
    const labels = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    const now = new Date();
    const todayIdx = (now.getDay() + 6) % 7;
    const monday = new Date(now); monday.setDate(now.getDate() - todayIdx); monday.setHours(0, 0, 0, 0);
    const startOf = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x.getTime(); };
    const endOf = (d) => startOf(d) + 86400000;
    const inRange = (ts, s, e) => ts && new Date(ts) >= s && new Date(ts) < e;
    return labels.map((label, i) => {
      const d = new Date(monday); d.setDate(monday.getDate() + i);
      const s = startOf(d), e = endOf(d);
      const whatsapp = (data.whatsapps || []).filter((m) => inRange(m.timestamp, s, e)).length;
      const email = (data.emails || []).filter((m) => inRange(m.timestamp, s, e)).length;
      const event = (data.events || []).filter((m) => inRange(m.start, s, e)).length;
      const moment = (data.moments || []).filter((m) => inRange(m.occurred_at, s, e)).length;
      return { label, isToday: i === todayIdx, whatsapp, email, event, moment, total: whatsapp + email + event + moment };
    });
  }, [data]);
  const maxDay = Math.max(1, ...weekDays.map((d) => d.total));

  /* 01.3 — persoonlijke baseline */
  const baseline = useMemo(() => personalBaseline({ whatsapps: data.whatsapps, emails: data.emails, events: data.events }), [data]);
  const verdict = baseline.current >= baseline.baseline * 1.15 ? "MORE ACTIVE THAN USUAL" : baseline.current <= baseline.baseline * 0.7 ? "QUIETER THAN USUAL" : "ON PACE";

  /* 01.4 — social space vandaag */
  const todayBlocks = (data.blocks || []).filter((b) => b.start && new Date(b.start).toDateString() === new Date().toDateString() && b.status !== "cancelled");

  /* 01.5 — important people */
  const people = useMemo(() => [...circle].sort((a, b) => daysSince(a.last_contact_date) - daysSince(b.last_contact_date)).slice(0, 6), [circle]);

  /* 01.6 — upcoming */
  const upcoming = useMemo(() => {
    const plans = (activePlans || []).filter((p) => p.suggested_date).map((p) => ({ id: p.id, title: p.activity, at: p.suggested_date, status: p.status }));
    const events = (data.events || []).filter((e) => e.domain === "life" && e.start && new Date(e.start) >= new Date()).map((e) => ({ id: e.id, title: e.title, at: e.start, status: e.status }));
    return [...plans, ...events].sort((a, b) => new Date(a.at) - new Date(b.at)).slice(0, 6);
  }, [activePlans, data.events]);

  /* 01.8 — notable changes */
  const changes = useMemo(() => people.map((c) => ({ c, trend: contactRecentTrend(c.id, data.whatsapps) })).filter((x) => x.trend !== "steady").slice(0, 4), [people, data.whatsapps]);

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="text-storm">
      {/* 01.1 SOCIAL STATE */}
      <motion.div variants={fadeUp} className="mb-5">
        <Label>01.1 · Social State</Label>
        <div className="relative rounded-2xl border border-marble/15 bg-marble/5 p-5 flex items-center gap-5 overflow-hidden">
          <AnimatedRing pct={Math.min(100, mi.total * 12)} size={116} color={ACCENT} label={String(mi.total)} sub="MEANINGFUL · 7D" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] tracking-[0.28em] uppercase text-storm/45 mb-1">Current State</p>
            <p className="text-2xl font-display font-bold tracking-tight leading-tight">{PULSE_LABEL[state] || "Unknown"}</p>
            <div className="flex gap-1.5 mt-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="h-2 w-2 rounded-full" style={{ background: i < Math.min(8, mi.total) ? ACCENT : "rgba(255,255,255,0.12)" }} />
              ))}
            </div>
            <p className="text-xs text-storm/55 mt-3">{mi.total} meaningful · {activePlans.length} plans · {(data.intentions || []).length} open</p>
          </div>
        </div>
      </motion.div>

      {/* 01.2 + 01.3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <motion.div variants={fadeUp}>
          <Label className="mb-3">01.2 · This Week</Label>
          <div className="rounded-2xl border border-marble/15 bg-marble/5 p-4">
            <div className="flex items-end gap-2 h-28">
              {weekDays.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex flex-col justify-end h-24 rounded-md overflow-hidden bg-marble/5">
                    {d.total > 0 && ["moment", "event", "email", "whatsapp"].map((t) => d[t] > 0 && (
                      <motion.div key={t} initial={{ height: 0 }} animate={{ height: `${(d[t] / maxDay) * 100}%` }} transition={{ duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }} style={{ background: TYPE[t] }} />
                    ))}
                  </div>
                  <span className={`text-[9px] tracking-wider ${d.isToday ? "text-storm font-bold" : "text-storm/40"}`}>{d.label}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-3">
              {[["WhatsApp", TYPE.whatsapp], ["Email", TYPE.email], ["Events", TYPE.event], ["Moments", TYPE.moment]].map(([l, c]) => (
                <div key={l} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: c }} /><span className="text-[10px] text-storm/45">{l}</span></div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Label className="mb-3">01.3 · Personal Baseline</Label>
          <div className="rounded-2xl border border-marble/15 bg-marble/5 p-4">
            <BaselineRow label="Current" value={baseline.current} max={Math.max(baseline.current, baseline.baseline, 1)} color={ACCENT} />
            <div className="h-3" />
            <BaselineRow label="Baseline" value={baseline.baseline} max={Math.max(baseline.current, baseline.baseline, 1)} color="#7a7d72" />
            <p className="text-sm font-semibold mt-4" style={{ color: verdict === "ON PACE" ? "rgba(216,218,179,0.85)" : ACCENT }}>{verdict}</p>
          </div>
        </motion.div>
      </div>

      {/* 01.4 + 01.5 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <motion.div variants={fadeUp}>
          <Label className="mb-3">01.4 · Social Space · Today</Label>
          <div className="rounded-2xl border border-marble/15 bg-marble/5 p-4">
            <DayTimeline blocks={todayBlocks} />
          </div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Label className="mb-3">01.5 · Important People</Label>
          {people.length ? (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {people.map((c) => {
                const since = daysSince(c.last_contact_date);
                const trend = contactRecentTrend(c.id, data.whatsapps);
                return (
                  <motion.button key={c.id} variants={fadeUp} whileHover={{ y: -3 }} onClick={() => navigate(`/people/${c.id}`)} className="shrink-0 w-[130px] text-left rounded-2xl border border-marble/15 bg-marble/5 p-3">
                    <Avatar src={c.avatar} name={c.name} size="md" className="mb-2" />
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <p className="text-[9px] tracking-wider text-storm/45 uppercase mt-0.5 truncate">{(c.relationship_state || "unknown").replace(/_/g, " ")}</p>
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-storm/55">
                      <span>{since === Infinity ? "never" : `${since}d ago`}</span>
                      {trend === "up" && <TrendingUp className="w-3 h-3" style={{ color: ACCENT }} />}
                      {trend === "down" && <TrendingDown className="w-3 h-3" style={{ color: URGENT }} />}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          ) : <Empty title="YOUR NETWORK" subtitle="Start adding people." />}
        </motion.div>
      </div>

      {/* 01.6 + 01.7 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <motion.div variants={fadeUp}>
          <Label className="mb-3">01.6 · Upcoming Social</Label>
          <div className="rounded-2xl border border-marble/15 bg-marble/5 p-3 space-y-2 max-h-[220px] overflow-y-auto">
            {upcoming.length ? upcoming.map((u) => (
              <div key={u.id} className="flex items-center gap-3 rounded-xl bg-marble/5 px-3 py-2.5">
                <CalendarHeart className="w-3.5 h-3.5 shrink-0" style={{ color: ACCENT }} />
                <span className="text-sm flex-1 truncate">{u.title}</span>
                {u.status && <StatusPill status={u.status} />}
                <span className="text-[10px] text-storm/45 tabular-nums shrink-0">{new Date(u.at).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" })}</span>
              </div>
            )) : <Empty title="OPEN SPACE" subtitle="Nothing planned yet." />}
          </div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Label className="mb-3">01.7 · Opportunities</Label>
          <div className="space-y-2">
            {(data.opportunities || []).length ? data.opportunities.map((o) => (
              <div key={o.id} className="rounded-2xl border border-marble/15 bg-marble/5 p-3.5">
                <div className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: ACCENT }} /><p className="text-sm font-medium truncate flex-1">{o.title}</p></div>
                <p className="text-[11px] text-storm/55 mt-1 leading-relaxed">{o.reasoning}</p>
                <button onClick={() => onNavigate?.("Planner")} className="inline-flex items-center gap-1 text-[10px] uppercase font-semibold mt-2" style={{ color: ACCENT }}>Plan something <ArrowRight className="w-3 h-3" /></button>
              </div>
            )) : <Empty title="QUIET" subtitle="No opportunities right now." />}
          </div>
        </motion.div>
      </div>

      {/* 01.8 NOTABLE CHANGES */}
      {changes.length > 0 && (
        <motion.div variants={fadeUp} className="mb-5">
          <Label className="mb-3">01.8 · Notable Changes</Label>
          <div className="flex flex-wrap gap-2">
            {changes.map(({ c, trend }) => (
              <button key={c.id} onClick={() => navigate(`/people/${c.id}`)} className="inline-flex items-center gap-2 rounded-full border border-marble/15 bg-marble/5 px-3 py-1.5 text-xs">
                {trend === "up" ? <TrendingUp className="w-3.5 h-3.5" style={{ color: ACCENT }} /> : <TrendingDown className="w-3.5 h-3.5" style={{ color: URGENT }} />}
                <span className="font-medium">{c.name}</span>
                <span className="text-storm/45">{trend === "up" ? "more active" : "quieter"}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* 01.9 QUICK MANAGEMENT */}
      <motion.div variants={fadeUp}>
        <Label className="mb-3">01.9 · Quick Management</Label>
        <div className="flex flex-wrap gap-2">
          <Quick icon={UserPlus} label="Add person" onClick={() => navigate("/people")} />
          <Quick icon={Heart} label="Add moment" onClick={() => setModal("moment")} />
          <Quick icon={Zap} label="Create intention" onClick={() => setModal("intention")} />
          <Quick icon={CalendarHeart} label="Create plan" onClick={() => onNavigate?.("Planner")} />
          <Quick icon={Clock} label="Add time" onClick={() => onNavigate?.("Personal Time")} />
          <Quick icon={Users} label="Open relationship" onClick={() => people[0] && navigate(`/people/${people[0].id}`)} />
        </div>
      </motion.div>

      <AnimatePresence>{modal === "moment" && <MomentModal onClose={() => setModal(null)} onSaved={() => {}} />}</AnimatePresence>
      <AnimatePresence>{modal === "intention" && <IntentionModal onClose={() => setModal(null)} onSaved={() => {}} />}</AnimatePresence>
    </motion.div>
  );
}

function Label({ children, className = "" }) {
  return <p className={`text-[10px] tracking-[0.28em] uppercase text-storm/45 mb-2 ${className}`}>{children}</p>;
}

function BaselineRow({ label, value, max, color }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1"><span className="text-storm/50 uppercase tracking-wide">{label}</span><span className="tabular-nums text-storm/80">{value}</span></div>
      <div className="h-2 rounded-full bg-marble/10 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${(value / max) * 100}%` }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="h-full rounded-full" style={{ background: color }} />
      </div>
    </div>
  );
}

function DayTimeline({ blocks = [] }) {
  const hours = Array.from({ length: 15 }, (_, i) => i + 7);
  return (
    <div className="space-y-1">
      {hours.map((h) => {
        const block = blocks.find((b) => { const s = new Date(b.start).getHours(); const e = new Date(b.end).getHours(); return s <= h && e > h; });
        return (
          <div key={h} className="flex items-center gap-2">
            <span className="text-[9px] tabular-nums text-storm/40 w-6">{String(h).padStart(2, "0")}</span>
            <div className="flex-1 h-3 rounded-md bg-marble/5 overflow-hidden">
              {block && <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.5 }} className="h-full rounded-md" style={{ background: BLOCK_COLOR[block.type] || BLOCK_COLOR.free }} />}
            </div>
            {block && <span className="text-[8px] uppercase tracking-wide text-storm/45 w-16 truncate">{block.type}</span>}
          </div>
        );
      })}
    </div>
  );
}

function StatusPill({ status }) {
  const map = { proposed: "rgba(255,255,255,0.14)", planned: "#94925d", confirmed: "#d8dab3", completed: "#7a7d72", done: "#7a7d72", cancelled: "#a35" };
  return <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: map[status] || "rgba(255,255,255,0.12)", color: status === "confirmed" ? "#2a2c28" : "rgba(255,255,255,0.85)" }}>{status}</span>;
}

function Empty({ title, subtitle }) {
  return <div className="rounded-2xl border border-dashed border-marble/15 p-4 text-center"><p className="text-xs uppercase tracking-widest text-storm/40">{title}</p><p className="text-[11px] text-storm/35 mt-1">{subtitle}</p></div>;
}

function Quick({ icon: Icon, label, onClick }) {
  return (
    <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }} onClick={onClick} className="inline-flex items-center gap-2 text-[11px] font-medium rounded-full px-3.5 py-2 border border-marble/15 bg-marble/5 text-storm/80">
      <Icon className="w-3.5 h-3.5" style={{ color: ACCENT }} />{label}
    </motion.button>
  );
}

function MomentModal({ onClose, onSaved }) {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try { await base44.entities.SocialMoment.create({ title: title.trim(), significance: "medium", occurred_at: new Date().toISOString() }); onSaved?.(); onClose(); } finally { setSaving(false); }
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()} className="rounded-2xl p-6 w-full max-w-sm" style={{ background: "rgba(30,32,36,0.88)", backdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.16)", color: "#fff" }}>
        <p className="font-display font-semibold mb-3">New Social Moment</p>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What happened?" autoFocus className="w-full rounded-lg px-3 py-2 text-sm outline-none mb-3" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", color: "#fff" }} onKeyDown={(e) => e.key === "Enter" && save()} />
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="text-sm text-storm/60 px-3 py-1.5">Cancel</button>
          <button onClick={save} disabled={saving} className="text-sm font-semibold px-4 py-1.5 rounded-full disabled:opacity-50" style={{ background: ACCENT, color: "#2a2c28" }}>{saving ? "Saving…" : "Save"}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function IntentionModal({ onClose, onSaved }) {
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (!desc.trim()) return;
    setSaving(true);
    try { await base44.entities.SocialIntention.create({ description: desc.trim(), status: "open", created_via: "manual" }); onSaved?.(); onClose(); } finally { setSaving(false); }
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()} className="rounded-2xl p-6 w-full max-w-sm" style={{ background: "rgba(30,32,36,0.88)", backdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.16)", color: "#fff" }}>
        <p className="font-display font-semibold mb-3">New Social Intention</p>
        <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What do you want to do?" autoFocus className="w-full rounded-lg px-3 py-2 text-sm outline-none mb-3" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", color: "#fff" }} onKeyDown={(e) => e.key === "Enter" && save()} />
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="text-sm text-storm/60 px-3 py-1.5">Cancel</button>
          <button onClick={save} disabled={saving} className="text-sm font-semibold px-4 py-1.5 rounded-full disabled:opacity-50" style={{ background: ACCENT, color: "#2a2c28" }}>{saving ? "Saving…" : "Save"}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}