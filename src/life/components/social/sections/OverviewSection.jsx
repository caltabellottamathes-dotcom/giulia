import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import SocialStateOrb from "../v2/SocialStateOrb";
import { CountUp, GhostIndex, SectionLabel, AnimatedBar, ChangeChip, EmptyState, StatusPill } from "../v2/primitives";
import GlassPanel from "@/system/components/glass/GlassPanel";
import Avatar from "@/system/components/glass/Avatar";
import { weeklyActivityBars, personalBaseline, contactRecentTrend, daysSince, PULSE_LABEL } from "@/lib/domainUtils";
import { Heart, Sparkles, CalendarHeart, Users, ArrowRight, Plus, Clock, UserPlus, Zap } from "lucide-react";

const TYPE_COLOR = { whatsapp: "#94925d", email: "#b1bec6", event: "#d8dab3", moment: "#d5e24a" };

/** OverviewSection v2 — §1 het hele sociale systeem als één levend totaalbeeld. */
export default function OverviewSection({ data, mi, circle, attention, activePlans, state, onNavigate, onOpenPerson, reload }) {
  const [quickAdd, setQuickAdd] = useState(null);
  const bars = useMemo(() => weeklyActivityBars({ whatsapps: data.whatsapps, emails: data.emails, events: data.events }), [data]);
  const maxBar = Math.max(1, ...bars.map((b) => b.count));
  const baseline = useMemo(() => personalBaseline({ whatsapps: data.whatsapps, emails: data.emails, events: data.events }), [data]);
  const verdict = baseline.current >= baseline.baseline * 1.15 ? "MORE ACTIVE THAN USUAL" : baseline.current <= baseline.baseline * 0.7 ? "QUIETER THAN USUAL" : "ON PACE";

  const todayBlocks = (data.blocks || []).filter((b) => b.start && new Date(b.start).toDateString() === new Date().toDateString() && b.status !== "cancelled");
  const people = [...circle].sort((a, b) => daysSince(a.last_contact_date) - daysSince(b.last_contact_date)).slice(0, 6);
  const changes = people.map((c) => ({ c, trend: contactRecentTrend(c.id, data.whatsapps) })).filter((x) => x.trend !== "steady").slice(0, 3);
  const upcoming = [...activePlans.map((p) => ({ id: p.id, title: p.activity, at: p.suggested_date, status: p.status })), ...(data.events || []).filter((e) => e.domain === "life" && new Date(e.start) >= new Date()).map((e) => ({ id: e.id, title: e.title, at: e.start }))].sort((a, b) => new Date(a.at) - new Date(b.at)).slice(0, 5);
  const intensity = Math.min(1, mi.total / 8);

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }} className="space-y-4">
      {/* 1.1 SOCIAL STATE + 1.2 ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
        <motion.div variants={fadeUp} className="relative">
          <GlassPanel level={2} className="p-8 relative overflow-hidden h-full flex flex-col items-center justify-center min-h-[340px]">
            <GhostIndex className="text-[160px] -top-2 left-6">{mi.total}</GhostIndex>
            <SectionLabel className="absolute top-5 left-6">Social State</SectionLabel>
            <SocialStateOrb state={state} meaningfulCount={mi.total} invitations={data.intentions?.length || 0} plans={activePlans.length} intensity={intensity} compact />
          </GlassPanel>
        </motion.div>

        <motion.div variants={fadeUp}>
          <GlassPanel level={2} className="p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <SectionLabel>This Week · Social Activity</SectionLabel>
              <span className="text-[10px] text-muted-foreground">{mi.total} meaningful · 7d</span>
            </div>
            {/* stacked activity bars met type-breakdown */}
            <div className="flex items-end gap-2 h-32 mb-5">
              {bars.map((b, i) => (
                <motion.div key={b.label} variants={fadeUp} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full rounded-lg overflow-hidden flex flex-col-reverse glass-1" style={{ height: 96 }}>
                    <motion.div initial={{ height: 0 }} animate={{ height: `${(b.count / maxBar) * 100}%` }} transition={{ delay: i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className={`w-full ${b.isToday ? "bg-olive" : "bg-olive/40"}`} />
                  </div>
                  <span className={`text-[9px] uppercase tracking-wide ${b.isToday ? "text-olive font-bold" : "text-muted-foreground"}`}>{b.label}</span>
                </motion.div>
              ))}
            </div>
            {/* type legend */}
            <div className="flex gap-4 mb-5">
              {[["WhatsApp", TYPE_COLOR.whatsapp], ["Email", TYPE_COLOR.email], ["Events", TYPE_COLOR.event], ["Moments", TYPE_COLOR.moment]].map(([label, col]) => (
                <div key={label} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: col }} /><span className="text-[10px] text-muted-foreground">{label}</span></div>
              ))}
            </div>
            <div className="pt-4 border-t border-border/40">
              <SectionLabel className="mb-3">Personal Baseline</SectionLabel>
              <div className="space-y-2.5">
                <BaselineRow label="Current" value={baseline.current} max={Math.max(baseline.current, baseline.baseline, 1)} color="bg-olive" />
                <BaselineRow label="Baseline" value={baseline.baseline} max={Math.max(baseline.current, baseline.baseline, 1)} color="bg-muted-foreground/40" />
              </div>
              <p className="text-sm font-semibold text-foreground mt-3">{verdict}</p>
            </div>
          </GlassPanel>
        </motion.div>
      </div>

      {/* 1.4 SOCIAL SPACE + 1.5 IMPORTANT PEOPLE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={fadeUp}>
          <GlassPanel level={2} className="p-5">
            <SectionLabel className="mb-4">Social Space · Today</SectionLabel>
            <DayTimeline blocks={todayBlocks} />
          </GlassPanel>
        </motion.div>

        <motion.div variants={fadeUp}>
          <GlassPanel level={2} className="p-5">
            <div className="flex items-center justify-between mb-4">
              <SectionLabel>Important People</SectionLabel>
              <button onClick={() => setQuickAdd("person")} className="text-[10px] uppercase tracking-widest font-semibold text-olive flex items-center gap-1"><Plus className="h-3 w-3" />Add</button>
            </div>
            {people.length ? (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {people.map((c, i) => {
                  const since = daysSince(c.last_contact_date);
                  const trend = contactRecentTrend(c.id, data.whatsapps);
                  return (
                    <motion.button key={c.id} variants={fadeUp} whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }} onClick={() => onOpenPerson?.(c)} className="shrink-0 w-[128px] text-left rounded-2xl glass-1 p-3.5">
                      <Avatar src={c.avatar} name={c.name} size="md" className="mb-2.5" />
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5 truncate">{c.relationship_type || "Contact"}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-[10px] text-muted-foreground">{since === Infinity ? "never" : `${since}d ago`}</span>
                        {trend === "up" && <span className="text-olive text-[10px]">↑</span>}
                        {trend === "down" && <span className="text-urgent text-[10px]">↓</span>}
                      </div>
                      {/* mini activity dots */}
                      <div className="flex gap-0.5 mt-2">{Array.from({ length: 5 }).map((_, j) => <span key={j} className="h-1 w-1 rounded-full" style={{ background: j < Math.min(5, Math.max(1, 5 - Math.floor(since / 7))) ? "hsl(var(--olive))" : "hsl(var(--muted))" }} />)}</div>
                    </motion.button>
                  );
                })}
              </div>
            ) : <EmptyState title="YOUR NETWORK" subtitle="Start adding people, or let Giulia discover relationships." />}
          </GlassPanel>
        </motion.div>
      </div>

      {/* 1.8 NOTABLE CHANGES */}
      {changes.length > 0 && (
        <motion.div variants={fadeUp}>
          <GlassPanel level={2} className="p-5">
            <SectionLabel className="mb-3">Notable Changes</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {changes.map(({ c, trend }) => <ChangeChip key={c.id} dir={trend} name={c.name} label={trend === "up" ? "more active" : "quieter"} onClick={() => onOpenPerson?.(c)} />)}
            </div>
          </GlassPanel>
        </motion.div>
      )}

      {/* 1.6 UPCOMING + 1.7 OPPORTUNITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={fadeUp}>
          <GlassPanel level={2} className="p-5">
            <SectionLabel className="mb-3">Upcoming Social</SectionLabel>
            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
              {upcoming.length ? upcoming.map((u, i) => (
                <motion.div key={u.id} variants={fadeUp} className="flex items-center gap-3 rounded-xl glass-1 px-3.5 py-2.5">
                  <CalendarHeart className="h-3.5 w-3.5 text-olive shrink-0" />
                  <span className="text-sm flex-1 truncate">{u.title}</span>
                  {u.status && <StatusPill status={u.status} />}
                  <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">{u.at ? new Date(u.at).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" }) : "—"}</span>
                </motion.div>
              )) : <EmptyState title="OPEN SPACE" subtitle="Nothing planned yet. Your week has room." />}
            </div>
          </GlassPanel>
        </motion.div>

        <motion.div variants={fadeUp}>
          <GlassPanel level={2} className="p-5">
            <SectionLabel className="mb-3">Opportunities</SectionLabel>
            {(data.opportunities || []).length ? (
              <div className="space-y-2">
                {data.opportunities.map((o, i) => (
                  <motion.div key={o.id} variants={fadeUp} className="rounded-xl glass-1 p-3.5">
                    <div className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-olive shrink-0" /><p className="text-sm font-medium truncate flex-1">{o.title}</p></div>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{o.reasoning}</p>
                    <motion.button whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }} onClick={() => onNavigate?.("Planner")} className="inline-flex items-center gap-1 text-[10px] uppercase font-semibold text-olive mt-2">Plan something <ArrowRight className="h-3 w-3" /></motion.button>
                  </motion.div>
                ))}
              </div>
            ) : <EmptyState title="QUIET" subtitle="No opportunities detected right now." />}
          </GlassPanel>
        </motion.div>
      </div>

      {/* 1.9 QUICK MANAGEMENT */}
      <motion.div variants={fadeUp}>
        <GlassPanel level={2} className="p-4">
          <SectionLabel className="mb-3">Quick Management</SectionLabel>
          <div className="flex flex-wrap gap-2">
            <QuickAction icon={UserPlus} label="Add person" onClick={() => setQuickAdd("person")} />
            <QuickAction icon={Heart} label="Add moment" onClick={() => setQuickAdd("moment")} />
            <QuickAction icon={Zap} label="Create intention" onClick={() => setQuickAdd("intention")} />
            <QuickAction icon={CalendarHeart} label="Create plan" onClick={() => setQuickAdd("plan")} />
            <QuickAction icon={Clock} label="Add time" onClick={() => setQuickAdd("time")} />
          </div>
        </GlassPanel>
      </motion.div>

      <AnimatePresence>{quickAdd === "moment" && <QuickMomentModal onClose={() => setQuickAdd(null)} onSaved={reload} />}</AnimatePresence>
      <AnimatePresence>{quickAdd === "intention" && <QuickIntentionModal onClose={() => setQuickAdd(null)} onSaved={reload} />}</AnimatePresence>
    </motion.div>
  );
}

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } };

function BaselineRow({ label, value, max, color }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1"><span className="text-muted-foreground uppercase tracking-wide">{label}</span><CountUp value={value} className="tabular-nums text-foreground/80" /></div>
      <AnimatedBar pct={(value / max) * 100} color={color} />
    </div>
  );
}

const BLOCK_COLOR = { rest: "#b1bec6", recovery: "#cfd9dd", free: "#d8dab3", social: "#94925d", protected: "#d5e24a", work: "#4a4a44" };
function DayTimeline({ blocks = [] }) {
  const hours = Array.from({ length: 15 }, (_, i) => i + 7); // 7..21
  return (
    <div className="space-y-1">
      {hours.map((h) => {
        const block = blocks.find((b) => { const s = new Date(b.start).getHours(); return s <= h && new Date(b.end).getHours() > h; });
        return (
          <div key={h} className="flex items-center gap-2">
            <span className="text-[9px] tabular-nums text-muted-foreground w-6">{String(h).padStart(2, "0")}</span>
            <div className="flex-1 h-3 rounded-md glass-1 overflow-hidden">
              {block && <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.5 }} className="h-full rounded-md" style={{ background: BLOCK_COLOR[block.type] || BLOCK_COLOR.free }} />}
            </div>
            {block && <span className="text-[8px] uppercase tracking-wide text-muted-foreground w-16 truncate">{block.type}</span>}
          </div>
        );
      })}
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }) {
  return (
    <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} onClick={onClick} className="inline-flex items-center gap-2 text-[11px] font-medium rounded-full px-3.5 py-2 glass-1 text-foreground/80">
      <Icon className="h-3.5 w-3.5 text-olive" />{label}
    </motion.button>
  );
}

function QuickMomentModal({ onClose, onSaved }) {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try { await base44.entities.SocialMoment.create({ title: title.trim(), significance: "medium", occurred_at: new Date().toISOString() }); onSaved?.(); onClose(); } finally { setSaving(false); }
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/20" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()} className="glass-3 rounded-2xl p-6 w-full max-w-sm">
        <p className="font-display font-semibold mb-3">New Social Moment</p>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What happened?" autoFocus className="w-full rounded-lg glass-1 px-3 py-2 text-sm outline-none mb-3" onKeyDown={(e) => e.key === "Enter" && save()} />
        <div className="flex gap-2 justify-end"><button onClick={onClose} className="text-sm text-muted-foreground px-3 py-1.5">Cancel</button><button onClick={save} disabled={saving} className="text-sm font-semibold text-white bg-olive px-4 py-1.5 rounded-full disabled:opacity-50">{saving ? "Saving…" : "Save"}</button></div>
      </motion.div>
    </motion.div>
  );
}

function QuickIntentionModal({ onClose, onSaved }) {
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (!desc.trim()) return;
    setSaving(true);
    try { await base44.entities.SocialIntention.create({ description: desc.trim(), status: "open", created_via: "manual" }); onSaved?.(); onClose(); } finally { setSaving(false); }
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/20" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()} className="glass-3 rounded-2xl p-6 w-full max-w-sm">
        <p className="font-display font-semibold mb-3">New Social Intention</p>
        <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What do you want to do?" autoFocus className="w-full rounded-lg glass-1 px-3 py-2 text-sm outline-none mb-3" onKeyDown={(e) => e.key === "Enter" && save()} />
        <div className="flex gap-2 justify-end"><button onClick={onClose} className="text-sm text-muted-foreground px-3 py-1.5">Cancel</button><button onClick={save} disabled={saving} className="text-sm font-semibold text-white bg-olive px-4 py-1.5 rounded-full disabled:opacity-50">{saving ? "Saving…" : "Save"}</button></div>
      </motion.div>
    </motion.div>
  );
}