import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Mail, Inbox, Sparkles, TrendingUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Count-up hook voor geanimeerde cijfers ──
function useCountUp(target, duration = 900) {
  const [val, setVal] = useState(0);
  const raf = useRef();
  useEffect(() => {
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return val;
}

const CAT_COLORS = {
  important: "hsl(var(--olive))",
  advertising: "hsl(var(--steel))",
  newsletter: "hsl(var(--powder))",
  junk: "hsl(var(--smoke))",
  spam: "hsl(var(--destructive))",
  other: "hsl(var(--muted-foreground))",
};
const CAT_LABELS = { important: "Belangrijk", advertising: "Reclame", newsletter: "Nieuwsbrief", junk: "Onbelangrijk", spam: "Spam", other: "Overig" };

function StatCard({ icon: Icon, label, value, accent }) {
  const animated = useCountUp(value);
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="glass-1 rounded-3xl p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className={cn("h-2 w-2 rounded-full", accent)} />
        <Icon className="h-5 w-5 text-muted-foreground/40" />
      </div>
      <div>
        <p className="text-[4rem] font-display font-bold leading-none tracking-[-0.04em] text-foreground tabular-nums">{animated}</p>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-2 font-semibold">{label}</p>
      </div>
    </motion.div>
  );
}

export default function EmailInsightsTab({ emails }) {
  const volumeData = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("nl-NL", { weekday: "short" }).slice(0, 2);
      const count = (emails || []).filter((e) => new Date(e.timestamp || e.created_date).toISOString().slice(0, 10) === key).length;
      days.push({ label, count });
    }
    return days;
  }, [emails]);

  const catData = useMemo(() => {
    const counts = {};
    (emails || []).forEach((e) => { const c = e.category || "other"; counts[c] = (counts[c] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: CAT_LABELS[name] || name, value, color: CAT_COLORS[name] || CAT_COLORS.other }));
  }, [emails]);

  const total = (emails || []).length;
  const unread = (emails || []).filter((e) => e.status === "unread").length;
  const drafts = (emails || []).filter((e) => e.folder === "giulia_drafts" || e.giulia_draft).length;
  const awaiting = (emails || []).filter((e) => e.awaiting_response).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Big stats */}
      <div className="lg:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Mail} label="Totaal" value={total} accent="bg-steel" />
        <StatCard icon={Inbox} label="Ongelezen" value={unread} accent="bg-olive animate-pulse-soft" />
        <StatCard icon={Sparkles} label="Door Giulia" value={drafts} accent="bg-olive" />
        <StatCard icon={Clock} label="Wacht op antwoord" value={awaiting} accent="bg-destructive" />
      </div>

      {/* Volume chart */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }} className="lg:col-span-4 glass-1 rounded-3xl p-6">
        <div className="flex items-center gap-2 mb-3"><TrendingUp className="h-4 w-4 text-olive" /><h3 className="text-sm font-display font-semibold">Volume · 7 dagen</h3></div>
        <div className="h-40"><ResponsiveContainer width="100%" height="100%">
          <AreaChart data={volumeData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
            <defs><linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--olive))" stopOpacity={0.5} /><stop offset="100%" stopColor="hsl(var(--olive))" stopOpacity={0} /></linearGradient></defs>
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Area type="monotone" dataKey="count" stroke="hsl(var(--olive))" strokeWidth={2} fill="url(#volGrad)" animationDuration={1000} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }} />
          </AreaChart>
        </ResponsiveContainer></div>
      </motion.div>

      {/* Category donut */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }} className="lg:col-span-5 glass-1 rounded-3xl p-6">
        <h3 className="text-sm font-display font-semibold mb-4">Categorieën</h3>
        <div className="flex items-center gap-6">
          <div className="h-36 w-36 shrink-0"><ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={36} outerRadius={64} paddingAngle={2} animationDuration={800}>
                {catData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer></div>
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {catData.map((c, i) => (
              <motion.div key={c.name} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                <span className="text-foreground/80 truncate">{c.name}</span>
                <span className="ml-auto text-muted-foreground tabular-nums text-xs">{c.value}</span>
              </motion.div>
            ))}
            {!catData.length && <p className="text-sm text-muted-foreground">Nog geen categorieën.</p>}
          </div>
        </div>
      </motion.div>

      {/* Awaiting response list */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }} className="lg:col-span-7 glass-1 rounded-3xl p-6">
        <h3 className="text-sm font-display font-semibold mb-3">Wacht op jouw antwoord</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {(emails || []).filter((e) => e.awaiting_response).slice(0, 10).map((e, i) => (
            <motion.div key={e.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.04 }} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-foreground/[0.03] transition-colors">
              <div className="h-8 w-8 rounded-full bg-stone/40 flex items-center justify-center text-xs font-semibold shrink-0">{(e.sender || "?").charAt(0)}</div>
              <div className="min-w-0 flex-1"><p className="text-sm font-medium truncate">{e.sender}</p><p className="text-xs text-muted-foreground truncate">{e.subject}</p></div>
              {e.timestamp && <span className="text-[10px] text-muted-foreground shrink-0">{new Date(e.timestamp).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span>}
            </motion.div>
          ))}
          {!(emails || []).some((e) => e.awaiting_response) && <p className="text-sm text-muted-foreground py-4">Niets wacht op antwoord.</p>}
        </div>
      </motion.div>
    </div>
  );
}