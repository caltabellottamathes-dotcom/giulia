import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveLine } from "@nivo/line";
import ReactECharts from "echarts-for-react";
import GlassPanel from "@/system/components/glass/GlassPanel";
import SocialStateOrb from "../v2/SocialStateOrb";
import { CountUp, SectionLabel, EmptyState, StatusPill } from "../v2/primitives";
import { intensitySeries, socialHeatmap, socialChangeCompare } from "@/lib/domainUtils";
import { MessageCircle, Mail, CalendarHeart, ArrowUp, ArrowDown, Heart, X } from "lucide-react";

const SOURCE_ICON = { whatsapp: MessageCircle, email: Mail, calendar: CalendarHeart, manual: Heart };
const PERIODS = [
  { key: "day", label: "Today" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "long", label: "8 weeks" },
];

/** PulseSection v2 — §3 uitsluitend actuele activiteit: state-orb, timeline,
 *  intensity stream (nivo), heatmap (echarts), invitations, social change. */
export default function PulseSection({ data, mi, attention = [], state }) {
  const [period, setPeriod] = useState("long");
  const [openMoment, setOpenMoment] = useState(null);

  const intensityData = useMemo(() => {
    const timestamps = [...(data.whatsapps || []).filter((m) => m.direction === "sent").map((m) => m.timestamp), ...(data.emails || []).filter((e) => e.folder === "sent" || e.status === "sent").map((e) => e.timestamp), ...(data.events || []).filter((e) => e.domain === "life").map((e) => e.start)];
    const weeks = period === "day" ? 1 : period === "week" ? 1 : period === "month" ? 4 : 8;
    const series = intensitySeries(timestamps, Math.max(2, weeks));
    return [{ id: "intensity", color: "hsl(var(--olive))", data: series.map((v, i) => ({ x: `W${i + 1}`, y: v })) }];
  }, [data, period]);

  const grid = useMemo(() => socialHeatmap({ whatsapps: data.whatsapps, emails: data.emails, events: data.events, weeks: 4 }), [data]);
  const change = useMemo(() => socialChangeCompare({ whatsapps: data.whatsapps, emails: data.emails, events: data.events }), [data]);

  const timeline = useMemo(() => {
    const items = [
      ...(data.whatsapps || []).slice(0, 30).map((m) => ({ id: `w-${m.id}`, source: "whatsapp", label: m.direction === "sent" ? "WhatsApp sent" : "WhatsApp received", at: m.timestamp })),
      ...(data.emails || []).filter((e) => e.folder === "sent").slice(0, 15).map((e) => ({ id: `e-${e.id}`, source: "email", label: e.subject, at: e.timestamp })),
      ...(data.events || []).filter((e) => e.domain === "life").slice(0, 10).map((e) => ({ id: `c-${e.id}`, source: "calendar", label: e.title, at: e.start })),
    ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 12);
    return items;
  }, [data]);

  const invitations = (data.intentions || []).filter((i) => i.kind === "respond_invitation");
  const moments = data.moments || [];
  const activePlans = (data.plans || []).filter((p) => ["proposed", "planned", "confirmed"].includes(p.status));
  const intensity = Math.min(1, mi.total / 8);

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }} className="space-y-4">
      {/* 3.1 PULSE STATE */}
      <motion.div variants={fadeUp}>
        <GlassPanel level={2} className="p-8 flex flex-col items-center">
          <SectionLabel className="mb-2">Social Pulse</SectionLabel>
          <SocialStateOrb state={state} meaningfulCount={mi.total} invitations={invitations.length} plans={activePlans.length} intensity={intensity} />
        </GlassPanel>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4">
        {/* 3.2 ACTIVITY TIMELINE */}
        <motion.div variants={fadeUp}>
          <GlassPanel level={2} className="p-5 flex flex-col">
            <SectionLabel className="mb-3">Activity Timeline · Today</SectionLabel>
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 mb-4">
              {timeline.length ? timeline.map((t, i) => {
                const Icon = SOURCE_ICON[t.source] || MessageCircle;
                return (
                  <motion.div key={t.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-center gap-3 text-[12px] rounded-lg px-2 py-1.5 hover:bg-muted/30">
                    <Icon className="h-3.5 w-3.5 text-olive shrink-0" />
                    <span className="text-foreground/80 truncate flex-1">{t.label}</span>
                    <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">{new Date(t.at).toLocaleString("nl-NL", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}</span>
                  </motion.div>
                );
              }) : <EmptyState title="QUIET" subtitle="Nothing recorded recently." />}
            </div>
            {/* 3.4 INTENSITY */}
            <div className="flex items-center justify-between mb-2">
              <SectionLabel>Social Intensity</SectionLabel>
              <div className="flex gap-1">
                {PERIODS.map((p) => <button key={p.key} onClick={() => setPeriod(p.key)} className={`text-[9px] uppercase tracking-wide rounded-full px-2 py-1 ${period === p.key ? "bg-olive text-white" : "glass-1 text-muted-foreground"}`}>{p.label}</button>)}
              </div>
            </div>
            <div className="flex-1 min-h-[140px]">
              <ResponsiveLine data={intensityData} margin={{ top: 8, right: 8, bottom: 20, left: 20 }} xScale={{ type: "point" }} yScale={{ type: "linear", min: 0 }} axisBottom={{ tickSize: 0, tickPadding: 6, legend: "" }} axisLeft={null} enableGridX={false} enableGridY={false} enablePoints={false} enableArea areaBaselineValue={0} areaBlendMode="normal" colors={["hsl(var(--olive))"]} lineWidth={2} theme={{ text: { fill: "hsl(var(--muted-foreground))", fontSize: 10 }, tooltip: { container: { background: "hsl(var(--card))", borderRadius: 8 } } }} animate />
            </div>
          </GlassPanel>
        </motion.div>

        <div className="flex flex-col gap-4">
          {/* 3.5 HEATMAP */}
          <motion.div variants={fadeUp}>
            <GlassPanel level={2} className="p-5">
              <SectionLabel className="mb-3">Social Heatmap · 4 weeks</SectionLabel>
              <EchartsHeatmap grid={grid} />
            </GlassPanel>
          </motion.div>
          {/* 3.7 SOCIAL CHANGE */}
          <motion.div variants={fadeUp}>
            <GlassPanel level={2} className="p-5">
              <SectionLabel className="mb-3">Social Change</SectionLabel>
              <div className="flex items-center gap-4">
                <div className="flex-1"><p className="text-[10px] text-muted-foreground">Last week</p><CountUp value={change.lastWeek} className="text-2xl font-display font-bold tabular-nums" /></div>
                <span className="text-xl text-muted-foreground">→</span>
                <div className="flex-1"><p className="text-[10px] text-muted-foreground">This week</p><CountUp value={change.thisWeek} className="text-2xl font-display font-bold tabular-nums" /></div>
                <span className={`inline-flex items-center gap-1 text-sm font-semibold ${change.deltaPct >= 0 ? "text-olive" : "text-urgent"}`}>{change.deltaPct >= 0 ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}{Math.abs(change.deltaPct)}%</span>
              </div>
            </GlassPanel>
          </motion.div>
        </div>
      </div>

      {/* 3.3 MEANINGFUL MOMENTS */}
      <motion.div variants={fadeUp}>
        <GlassPanel level={2} className="p-5">
          <SectionLabel className="mb-3">Meaningful Moments</SectionLabel>
          {moments.length ? (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {moments.map((m, i) => (
                <motion.button key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }} onClick={() => setOpenMoment(m)} className="shrink-0 w-[200px] text-left rounded-2xl glass-1 p-4">
                  <Heart className="h-4 w-4 text-olive mb-2" />
                  <p className="text-sm font-medium leading-snug">{m.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-1.5">{m.occurred_at ? new Date(m.occurred_at).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" }) : "—"}</p>
                  <span className="inline-block mt-2 text-[9px] uppercase tracking-wider text-olive">{m.significance} significance</span>
                </motion.button>
              ))}
            </div>
          ) : <EmptyState title="QUIET" subtitle="Nothing meaningful detected recently." />}
        </GlassPanel>
      </motion.div>

      {/* 3.6 INVITATIONS + ATTENTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={fadeUp}>
          <GlassPanel level={2} className="p-5">
            <SectionLabel className="mb-3">Invitations</SectionLabel>
            {invitations.length ? (
              <div className="space-y-2">
                {invitations.map((i) => (
                  <div key={i.id} className="rounded-xl glass-1 p-3">
                    <p className="text-sm font-medium">{i.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">{i.kind.replace(/_/g, " ")}</p>
                  </div>
                ))}
              </div>
            ) : <EmptyState title="OPEN" subtitle="No open invitations right now." />}
          </GlassPanel>
        </motion.div>
        <motion.div variants={fadeUp}>
          <GlassPanel level={2} className="p-5">
            <SectionLabel className="mb-3">Needs Attention</SectionLabel>
            {attention.length ? (
              <div className="space-y-1.5">
                {attention.slice(0, 6).map((p) => (
                  <motion.div key={p.contact.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2.5 text-[12px]">
                    <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} className="h-2 w-2 rounded-full bg-urgent shrink-0" />
                    <span className="text-foreground/85 truncate flex-1">{p.contact.name}</span>
                    <span className="text-[10px] text-muted-foreground">{p.since}d · {Math.round(p.ratio * 10) / 10}x</span>
                  </motion.div>
                ))}
              </div>
            ) : <EmptyState title="ON PACE" subtitle="Nobody overdue right now." />}
          </GlassPanel>
        </motion.div>
      </div>

      <AnimatePresence>{openMoment && <MomentDrawer moment={openMoment} onClose={() => setOpenMoment(null)} />}</AnimatePresence>
    </motion.div>
  );
}

function EchartsHeatmap({ grid }) {
  const weeks = grid.length;
  const days = 7;
  const data = [];
  let max = 1;
  grid.forEach((week, wi) => week.forEach((v, di) => { data.push([di, wi, v]); if (v > max) max = v; }));
  const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const option = {
    tooltip: { formatter: (p) => `${DOW[p.data[0]]} · W${p.data[1] + 1}<br/>${p.data[2]} interactions` },
    grid: { left: 30, right: 8, top: 8, bottom: 24 },
    xAxis: { type: "category", data: DOW, splitArea: false, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: "hsl(var(--muted-foreground))", fontSize: 9 } },
    yAxis: { type: "category", data: Array.from({ length: weeks }, (_, i) => `W${i + 1}`), splitArea: false, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: "hsl(var(--muted-foreground))", fontSize: 9 } },
    visualMap: { min: 0, max, show: false, inRange: { color: ["rgba(177,190,198,0.15)", "rgba(216,218,179,0.5)", "hsl(var(--olive))"] } },
    series: [{ type: "heatmap", data, itemStyle: { borderRadius: 4 }, emphasis: { itemStyle: { shadowBlur: 6 } } }],
  };
  return <ReactECharts option={option} style={{ height: 160 }} opts={{ renderer: "canvas" }} />;
}

function MomentDrawer({ moment, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-charcoal/20" />
      <motion.div initial={{ x: 40 }} animate={{ x: 0 }} exit={{ x: 40 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-sm h-full glass-3 p-6 overflow-y-auto">
        <button onClick={onClose} className="absolute top-5 left-5 h-8 w-8 rounded-full glass-1 flex items-center justify-center"><X className="h-4 w-4" /></button>
        <div className="mt-12">
          <Heart className="h-6 w-6 text-olive mb-3" />
          <p className="font-display text-xl font-semibold">{moment.title}</p>
          {moment.description && <p className="text-sm text-muted-foreground mt-2">{moment.description}</p>}
          <p className="text-[11px] text-muted-foreground mt-3">{moment.occurred_at ? new Date(moment.occurred_at).toLocaleString("nl-NL") : "—"}</p>
          <span className="inline-block mt-3 text-[9px] uppercase tracking-wider text-olive">{moment.significance} significance</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };