import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHero from "@/system/components/glass/PageHero";
import GlassPanel from "@/system/components/glass/GlassPanel";
import { IMAGES } from "@/lib/images";
import { socialPulse, closeCircle } from "@/lib/domainUtils";
import { cn } from "@/lib/utils";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { Heart, Search, SlidersHorizontal, Settings, MessageCircle, CalendarHeart, Bell, Plus, Sparkles, ArrowUpRight, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";
import LifeActivityFeed from "@/life/components/LifeActivityFeed";

const BLUE = "hsl(var(--life-blue))";
const DEEP = "hsl(var(--life-blue-deep))";
const SAND = "hsl(var(--life-sand))";
const SAND_DEEP = "hsl(var(--life-sand-deep))";
const SOFT = "hsl(var(--life-blue-soft))";
const TABS = ["OVERVIEW", "RELATIONSHIPS", "MOMENTS", "PATTERNS"];
const MOMENT_PHOTOS = [IMAGES.lifeSocialPulseAlt, IMAGES.lifeFabric, IMAGES.lifeSuitStrings, IMAGES.lifeGlove, IMAGES.lifeVase, IMAGES.lifeHandPrint, IMAGES.lifeStitch, IMAGES.lifeStride];

const fmtDay = (d) => new Date(d).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric" });
const fmtTime = (d) => new Date(d).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
const initials = (n) => (n || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export default function SocialPulsePage() {
  const [tab, setTab] = useState(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    return t ? t.toUpperCase() : "OVERVIEW";
  });
  const [contacts, setContacts] = useState([]);
  const [emails, setEmails] = useState([]);
  const [whatsapps, setWhatsapps] = useState([]);
  const [events, setEvents] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [c, m, w, e, p] = await Promise.all([
          base44.entities.Contact.filter({}, "name", 200).catch(() => []),
          base44.entities.Email.list("-timestamp", 200).catch(() => []),
          base44.entities.WhatsAppMessage.list("-timestamp", 200).catch(() => []),
          base44.entities.CalendarEvent.list("start").catch(() => []),
          base44.entities.SocialPlan.list("suggested_date").catch(() => []),
        ]);
        setContacts(c || []); setEmails(m || []); setWhatsapps(w || []); setEvents(e || []); setPlans(p || []);
      } catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, []);

  const pulse = useMemo(() => socialPulse(closeCircle(contacts)), [contacts]);
  const overdue = pulse.filter((p) => p.overdue);

  const interactions = useMemo(() => {
    const cut = Date.now() - 30 * 86400000;
    return [...(emails || []), ...(whatsapps || [])].filter((x) => x.timestamp && new Date(x.timestamp).getTime() >= cut).length;
  }, [emails, whatsapps]);

  const weeks = useMemo(() => {
    const arr = Array.from({ length: 12 }, (_, i) => ({ label: `${i - 11}`, messages: 0, meetings: 0 }));
    const now = Date.now();
    const add = (t, k) => { if (!t) return; const w = Math.floor((now - new Date(t).getTime()) / (7 * 86400000)); if (w >= 0 && w < 12) arr[11 - w][k]++; };
    [...(emails || []), ...(whatsapps || [])].forEach((x) => add(x.timestamp, "messages"));
    (events || []).filter((e) => e.domain === "life").forEach((e) => add(e.start, "meetings"));
    return arr;
  }, [emails, whatsapps, events]);

  const monthsData = useMemo(() => {
    const arr = Array.from({ length: 6 }, (_, i) => ({ label: `${i - 5}`, value: 0 }));
    const now = Date.now();
    [...(emails || []), ...(whatsapps || [])].forEach((x) => { if (!x.timestamp) return; const mo = Math.floor((now - new Date(x.timestamp).getTime()) / (30 * 86400000)); if (mo >= 0 && mo < 6) arr[5 - mo].value++; });
    return arr;
  }, [emails, whatsapps]);

  const upcoming = useMemo(() => {
    const ev = (events || []).filter((e) => e.domain === "life" && new Date(e.start).getTime() >= Date.now()).map((e) => ({ id: e.id, title: e.title, date: e.start, source: "calendar", status: e.status, confirmed: e.status === "confirmed" }));
    const pl = (plans || []).filter((p) => p.status === "planned" || p.status === "confirmed").map((p) => ({ id: p.id, title: p.activity, date: p.suggested_date, source: "plan", status: p.status, confirmed: p.status === "confirmed", contacts: (p.contact_ids || []).map((id) => contacts.find((c) => c.id === id)?.name).filter(Boolean) }));
    return [...ev, ...pl].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  }, [events, plans, contacts]);

  const openMoments = (plans || []).filter((p) => p.status === "planned");
  const pastMoments = (events || []).filter((e) => e.domain === "life" && new Date(e.start).getTime() < Date.now()).sort((a, b) => (b.start || "").localeCompare(a.start || "")).slice(0, 6);

  const headline = interactions >= 10 ? "CONNECTED" : overdue.length > 3 ? "QUIETER THAN USUAL" : "CONNECTED";
  const headlineSub = interactions >= 10 ? "Je sociale leven is actiever dan normaal." : overdue.length > 3 ? "Enkele relaties doven uit — een bericht houdt ze warm." : "Je netwerk voelt warm en in ritme.";

  // Relationship map — visual interpretation
  const mapNodes = useMemo(() => {
    const scored = pulse.map((p) => ({ p, score: (p.overdue ? 2 : 0) + 1 / Math.max(7, p.freq) }));
    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, 10);
    return top.map((s, i) => {
      const angle = (i / top.length) * Math.PI * 2 - Math.PI / 2;
      const radius = 22 + (i % 3) * 12;
      return { ...s.p, x: 50 + Math.cos(angle) * radius, y: 48 + Math.sin(angle) * radius, size: s.p.overdue ? 60 : 46 };
    });
  }, [pulse]);

  const avgRhythm = useMemo(() => {
    const valid = pulse.filter((p) => p.freq && p.freq < 60);
    if (!valid.length) return 0;
    return valid.reduce((s, p) => s + p.freq, 0) / valid.length / 7;
  }, [pulse]);

  const rhythmChange = (p) => {
    if (p.since === Infinity || !p.freq) return "new";
    if (p.since > p.freq * 1.5) return "quieter";
    if (p.since < p.freq * 0.6) return "more";
    return "stable";
  };
  const changes = pulse.filter((p) => rhythmChange(p) !== "stable" && p.since !== Infinity).slice(0, 4);

  const sel = selected ? pulse.find((p) => p.contact.id === selected) : null;

  return (
    <div className="space-y-6 animate-fade-up pb-12">
      <PageHero page="life-social-pulse" image={IMAGES.lifeSocialPulse} icon={Heart} eyebrow="LIFE · SOCIAL" title="What Social Life?" subtitle="Your social world, understood in context."
        actions={<div className="flex items-center gap-2"><button className="glass-button rounded-full h-9 w-9 inline-flex items-center justify-center text-ivory/80"><Search className="h-4 w-4" /></button><button className="glass-button rounded-full h-9 px-3 inline-flex items-center gap-2 text-xs text-ivory/80"><SlidersHorizontal className="h-4 w-4" /> View</button><button className="glass-button rounded-full h-9 w-9 inline-flex items-center justify-center text-ivory/80"><Settings className="h-4 w-4" /></button></div>} />

      {/* TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mt-2 relative z-20">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("px-4 py-2 text-xs rounded-full whitespace-nowrap transition-all", tab === t ? "text-ivory font-semibold" : "glass-1 text-muted-foreground hover:text-foreground")} style={tab === t ? { background: DEEP } : {}}>{t}</button>
        ))}
      </div>

      {loading && <div className="flex items-center justify-center py-20"><div className="h-8 w-8 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" /></div>}

      {!loading && tab === "OVERVIEW" && (
        <div className="space-y-6">
          {/* HERO */}
          <div className="relative rounded-[28px] overflow-hidden min-h-[260px] shadow-[0_24px_56px_-24px_rgba(0,0,0,0.4)]">
            <img src={IMAGES.lifeSocialPulse} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal/85 via-charcoal/45 to-transparent" />
            <div className="relative p-8 lg:p-10 flex flex-col justify-center h-full max-w-xl">
              <h2 className="text-[44px] lg:text-[56px] leading-[0.95] font-display font-semibold tracking-[-0.03em] text-ivory">{headline}</h2>
              <p className="text-base text-ivory/75 mt-3 leading-relaxed">{headlineSub}</p>
              <div className="flex flex-wrap gap-6 mt-6">
                <div><p className="text-3xl font-display font-semibold text-ivory tabular-nums">{interactions}</p><p className="text-[10px] uppercase tracking-wider text-ivory/55">meaningful interactions</p></div>
                <div><p className="text-3xl font-display font-semibold text-ivory tabular-nums">{upcoming.length}</p><p className="text-[10px] uppercase tracking-wider text-ivory/55">upcoming moments</p></div>
                <div><p className="text-3xl font-display font-semibold text-ivory tabular-nums">{overdue.length}</p><p className="text-[10px] uppercase tracking-wider text-ivory/55">open threads</p></div>
              </div>
            </div>
          </div>

          {/* CARD 01 — SOCIAL ACTIVITY */}
          <GlassPanel level={2} className="p-6 lg:p-7 grid lg:grid-cols-[260px_1fr] gap-6 items-center">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-2">Social activity</p>
              <p className="text-[72px] leading-[0.85] font-display font-semibold tracking-[-0.04em] text-foreground">{interactions}</p>
              <p className="text-sm text-muted-foreground mt-2">meaningful interactions · laatste 30 dagen</p>
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeks} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="gMsg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={BLUE} stopOpacity={0.5} /><stop offset="100%" stopColor={BLUE} stopOpacity={0} /></linearGradient>
                    <linearGradient id="gMtg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={SAND} stopOpacity={0.5} /><stop offset="100%" stopColor={SAND} stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                  <Area type="monotone" dataKey="messages" stroke={BLUE} strokeWidth={2} fill="url(#gMsg)" />
                  <Area type="monotone" dataKey="meetings" stroke={SAND} strokeWidth={2} fill="url(#gMtg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassPanel>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* CARD 02 — RELATIONSHIP LANDSCAPE */}
            <GlassPanel level={2} className="p-6 lg:p-7">
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-4">Relationship landscape</p>
              <div className="relative h-64">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-24 w-24 rounded-full border border-dashed" style={{ borderColor: SOFT }} />
                </div>
                {mapNodes.map((n) => (
                  <button key={n.contact.id} onClick={() => { setTab("RELATIONSHIPS"); setSelected(n.contact.id); }} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center font-display font-semibold text-ivory transition-transform hover:scale-110" style={{ left: `${n.x}%`, top: `${n.y}%`, width: n.size, height: n.size, background: n.overdue ? SAND_DEEP : DEEP, boxShadow: "0 8px 20px -8px rgba(0,0,0,0.4)" }}>
                    <span className="text-xs">{initials(n.contact.name)}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">Grootte = relevantie · kleur = aandacht. Klik voor detail.</p>
            </GlassPanel>

            {/* CARD 03 — SOCIAL RHYTHM */}
            <GlassPanel level={2} className="p-6 lg:p-7">
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-2">Social rhythm</p>
              <p className="text-[56px] leading-[0.9] font-display font-semibold tracking-[-0.03em] text-foreground">{avgRhythm.toFixed(1)} <span className="text-2xl text-muted-foreground">weeks</span></p>
              <p className="text-sm text-muted-foreground mt-1">gemiddeld contactritme</p>
              <div className="mt-6 space-y-4">
                <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Usual</p><div className="flex items-center gap-1">{Array.from({ length: 6 }).map((_, i) => <span key={i} className="h-2 w-2 rounded-full" style={{ background: SOFT }} />)}</div></div>
                <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Current</p><div className="flex items-center gap-1">{weeks.slice(-6).map((w, i) => <span key={i} className="h-2 rounded-full" style={{ width: 8, background: (w.messages + w.meetings) ? DEEP : "hsl(var(--border))" }} />)}</div></div>
              </div>
            </GlassPanel>
          </div>

          {/* CARD 04 — NEEDS ATTENTION */}
          <GlassPanel level={2} className="p-6 lg:p-7">
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-4">Needs attention</p>
            <div className="grid sm:grid-cols-3 gap-4">
              {overdue.slice(0, 3).map((p) => (
                <div key={p.contact.id} className="rounded-2xl border border-border p-4 flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold text-charcoal" style={{ background: SAND }}>{initials(p.contact.name)}</div>
                    <div className="min-w-0"><p className="text-sm font-semibold truncate">{p.contact.name}</p><p className="text-xs text-muted-foreground">{p.since === Infinity ? "geen contact" : `${p.since} dagen`}</p></div>
                  </div>
                  <p className="text-xs text-muted-foreground flex-1">Relatie dooft uit — je ritme was elke {p.freq} dagen.</p>
                  <button onClick={() => { setTab("RELATIONSHIPS"); setSelected(p.contact.id); }} className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-ivory self-start" style={{ background: DEEP }}>Open <ArrowUpRight className="h-3 w-3" /></button>
                </div>
              ))}
              {overdue.length === 0 && <p className="text-sm text-muted-foreground">Niemand vraagt nu aandacht.</p>}
            </div>
          </GlassPanel>

          {/* CARD 05 — UPCOMING */}
          <GlassPanel level={2} className="p-6 lg:p-7">
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-4">Upcoming</p>
            <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {upcoming.slice(0, 4).map((m, i) => (
                <div key={m.id} className="rounded-2xl overflow-hidden border border-border">
                  <div className="relative h-20"><img src={MOMENT_PHOTOS[i % MOMENT_PHOTOS.length]} alt="" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent" /><span className="absolute bottom-2 left-2 text-[10px] uppercase tracking-wide font-semibold text-ivory">{fmtDay(m.date)}</span></div>
                  <div className="p-3"><p className="text-sm font-medium truncate">{m.title}</p><p className="text-xs text-muted-foreground mt-0.5">{fmtTime(m.date)}</p></div>
                </div>
              ))}
              {upcoming.length === 0 && <p className="text-sm text-muted-foreground">Geen momenten ingepland.</p>}
            </div>
          </GlassPanel>
        </div>
      )}

      {!loading && tab === "RELATIONSHIPS" && (
        <div className="space-y-6">
          <GlassPanel level={2} className="p-6 lg:p-7">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold">Relationship map</p>
              <div className="flex gap-1.5">
                {["ALL", "QUIET", "ACTIVE"].map((f) => <span key={f} className="text-[10px] uppercase tracking-wide rounded-full px-2.5 py-1 border border-border text-muted-foreground">{f}</span>)}
              </div>
            </div>
            <div className="relative h-72">
              <div className="absolute inset-0 flex items-center justify-center"><div className="h-32 w-32 rounded-full border border-dashed" style={{ borderColor: SOFT }} /></div>
              {mapNodes.map((n) => (
                <button key={n.contact.id} onClick={() => setSelected(n.contact.id)} className={cn("absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center font-display font-semibold text-ivory transition-transform hover:scale-110", selected === n.contact.id && "ring-4 ring-offset-2 ring-offset-background")} style={{ left: `${n.x}%`, top: `${n.y}%`, width: n.size, height: n.size, background: n.overdue ? SAND_DEEP : DEEP, boxShadow: "0 8px 20px -8px rgba(0,0,0,0.4)" }}><span className="text-xs">{initials(n.contact.name)}</span></button>
              ))}
            </div>
          </GlassPanel>

          {sel && (
            <GlassPanel level={2} className="p-6 lg:p-7">
              <div className="flex items-start justify-between mb-5">
                <div><h3 className="text-3xl font-display font-semibold tracking-tight">{sel.contact.name}</h3><p className="text-sm text-muted-foreground mt-1">{sel.contact.relationship_type || "Relatie"} · {sel.overdue ? "needs attention" : "in rhythm"}</p></div>
                <button onClick={() => setSelected(null)} className="text-xs text-muted-foreground hover:text-foreground">Sluit</button>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 mb-5">
                <div className="rounded-2xl border border-border p-4"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Contact rhythm</p><p className="text-xl font-display font-semibold mt-1">Every {sel.freq} days</p></div>
                <div className="rounded-2xl border border-border p-4"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Last meaningful contact</p><p className="text-xl font-display font-semibold mt-1">{sel.since === Infinity ? "never" : `${sel.since} days ago`}</p></div>
                <div className="rounded-2xl border border-border p-4"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Pattern</p><p className="text-xl font-display font-semibold mt-1 capitalize">{rhythmChange(sel) === "quieter" ? "Quieter" : rhythmChange(sel) === "more" ? "More active" : "Regular"}</p></div>
              </div>
              <div className="flex gap-2">
                <button className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-ivory" style={{ background: DEEP }}><MessageCircle className="h-4 w-4" /> Message</button>
                <button className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border border-border"><CalendarHeart className="h-4 w-4" /> Plan something</button>
                <button className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border border-border"><Bell className="h-4 w-4" /> Remind me</button>
              </div>
            </GlassPanel>
          )}

          <GlassPanel level={2} className="p-6 lg:p-7">
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-3">All relationships</p>
            <div className="divide-y divide-border/30">
              {pulse.map((p) => (
                <button key={p.contact.id} onClick={() => setSelected(p.contact.id)} className="w-full flex items-center gap-4 py-3 text-left hover:bg-foreground/[0.03] -mx-2 px-2 rounded-lg transition">
                  <div className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold text-ivory shrink-0" style={{ background: p.overdue ? SAND_DEEP : DEEP }}>{initials(p.contact.name)}</div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{p.contact.name}</p><p className="text-xs text-muted-foreground">{p.contact.relationship_type || "—"} · elke {p.freq} dagen</p></div>
                  <span className="text-xs text-muted-foreground tabular-nums hidden sm:block">{p.since === Infinity ? "nooit" : `${p.since}d`}</span>
                  <span className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: p.overdue ? "hsl(var(--life-sand-deep))" : "hsl(var(--muted-foreground))" }}>{p.overdue ? "wacht" : "bij"}</span>
                </button>
              ))}
            </div>
          </GlassPanel>
        </div>
      )}

      {!loading && tab === "MOMENTS" && (
        <div className="space-y-6">
          <div><h2 className="text-4xl font-display font-semibold tracking-tight">Moments</h2><p className="text-muted-foreground mt-1">Sociale gebeurtenissen en wat eraan komt.</p></div>
          <div className="grid lg:grid-cols-2 gap-4">
            {upcoming.slice(0, 4).map((m, i) => (
              <div key={m.id} className="rounded-[24px] overflow-hidden border border-border flex">
                <div className="relative w-32 shrink-0"><img src={MOMENT_PHOTOS[i % MOMENT_PHOTOS.length]} alt="" className="absolute inset-0 h-full w-full object-cover" /></div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{new Date(m.date).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}</p><h3 className="text-xl font-display font-semibold mt-1">{m.title}</h3><p className="text-sm text-muted-foreground mt-1">{fmtTime(m.date)}{m.contacts ? ` · ${m.contacts.join(", ")}` : ""}</p></div>
                  <span className={cn("inline-flex items-center self-start rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wide font-semibold mt-3", m.confirmed ? "bg-life-blue/15 text-life-blue-deep" : "bg-muted text-muted-foreground")}>{m.confirmed ? "Confirmed" : "Tentative"}</span>
                </div>
              </div>
            ))}
            {upcoming.length === 0 && <GlassPanel level={2} className="p-12 text-center"><p className="text-sm text-muted-foreground">Geen momenten ingepland.</p></GlassPanel>}
          </div>
          <GlassPanel level={2} className="p-6 lg:p-7">
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-4">Open moments</p>
            {openMoments.length ? (
              <div className="divide-y divide-border/30">
                {openMoments.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 py-3">
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{p.activity}</p><p className="text-xs text-muted-foreground">Uitnodiging verstuurd · geen reactie</p></div>
                    <button className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-ivory" style={{ background: DEEP }}>Follow up</button>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">Geen open momenten.</p>}
          </GlassPanel>
          {pastMoments.length > 0 && (
            <GlassPanel level={2} className="p-6 lg:p-7">
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-4">Past moments</p>
              <div className="divide-y divide-border/20">
                {pastMoments.map((e) => (<div key={e.id} className="flex items-center py-2.5"><p className="text-sm flex-1 truncate text-muted-foreground">{e.title}</p><span className="text-xs text-muted-foreground">{fmtDay(e.start)}</span></div>))}
              </div>
            </GlassPanel>
          )}
        </div>
      )}

      {!loading && tab === "PATTERNS" && (
        <div className="space-y-6">
          <div className="relative rounded-[28px] overflow-hidden min-h-[200px]">
            <img src={IMAGES.lifeSocialPulseAlt} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal/85 to-charcoal/30" />
            <div className="relative p-8 max-w-lg"><h2 className="text-[40px] leading-[0.95] font-display font-semibold tracking-[-0.03em] text-ivory">Your social rhythm</h2><p className="text-ivory/75 mt-2">Je activiteit is de laatste maand iets rustiger dan gebruikelijk.</p></div>
          </div>
          <GlassPanel level={2} className="p-6 lg:p-7">
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-4">Contact rhythms</p>
            <div className="space-y-3">
              {pulse.slice(0, 6).map((p) => {
                const sincePct = Math.min(100, (p.since === Infinity ? 60 : p.since) / 60 * 100);
                const freqPct = Math.min(100, p.freq / 60 * 100);
                return (
                  <div key={p.contact.id}>
                    <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium">{p.contact.name}</span><span className="text-xs text-muted-foreground tabular-nums">{(p.since === Infinity ? 0 : p.since / 7).toFixed(1)} weeks</span></div>
                    <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                      <div className="absolute top-0 bottom-0 w-0.5 bg-foreground/50" style={{ left: `${freqPct}%` }} />
                      <div className="h-full rounded-full" style={{ width: `${sincePct}%`, background: p.overdue ? SAND_DEEP : DEEP }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3">De streep = je gebruikelijke ritme · de balk = huidige afstand.</p>
          </GlassPanel>
          <GlassPanel level={2} className="p-6 lg:p-7">
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold mb-4">Change over time · 6 months</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthsData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                  <Line type="monotone" dataKey="value" stroke={DEEP} strokeWidth={2.5} dot={{ fill: DEEP, r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassPanel>
          <div className="grid sm:grid-cols-3 gap-4">
            {changes.map((p) => {
              const ch = rhythmChange(p);
              const Icon = ch === "quieter" ? TrendingDown : TrendingUp;
              const label = ch === "quieter" ? "QUIETER" : ch === "more" ? "MORE ACTIVE" : "STABLE";
              const accent = ch === "quieter" ? SAND_DEEP : DEEP;
              return (
                <GlassPanel level={2} key={p.contact.id} className="p-5">
                  <div className="flex items-center gap-2 mb-2"><Icon className="h-4 w-4" style={{ color: accent }} /><p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: accent }}>{label}</p></div>
                  <p className="text-lg font-display font-semibold">{p.contact.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{ch === "quieter" ? "Contact is afgenomen." : "Contact is toegenomen."}</p>
                </GlassPanel>
              );
            })}
            {changes.length === 0 && <GlassPanel level={2} className="p-5 sm:col-span-3"><p className="text-sm text-muted-foreground">Geen significante veranderingen — je relaties zijn stabiel.</p></GlassPanel>}
          </div>
        </div>
      )}

      <LifeActivityFeed />
    </div>
  );
}