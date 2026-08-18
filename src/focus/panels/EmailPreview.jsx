import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { syncInbox } from "@/lib/emailSync";
import { SectionLabel, Empty } from "../../system/panels/previewParts";
import CountUp from "@/system/widgets/CountUp";
import { FOCUS } from "@/lib/domainPalettes";
import { AnimatedRing, ContextGrid, ActionRow, OpenLink, PulseDot, LiveBarChart } from "@/self/components/SelfViz";
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, PieChart, Pie } from "recharts";
import { format } from "date-fns";
import { RefreshCw, Check, Star } from "lucide-react";

const WEEK = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

export default function EmailPreview({ onOpen }) {
  const navigate = useNavigate();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const load = async () => {
    try { const data = await base44.entities.Email.filter({ folder: { $in: ["inbox", "important"] } }, "-timestamp", 30); setEmails(data || []); }
    catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const sync = async () => { setSyncing(true); try { await syncInbox({ limit: 30 }); await load(); } catch { /* ignore */ } finally { setSyncing(false); } };
  const markRead = async (e) => { setEmails((prev) => prev.map((x) => (x.id === e.id ? { ...x, status: "read" } : x))); try { await base44.entities.Email.update(e.id, { status: "read" }); } catch { load(); } };

  const unread = emails.filter((e) => e.status === "unread");
  const important = emails.filter((e) => e.important);
  const read = emails.length - unread.length;
  const unreadPct = emails.length ? Math.round((unread.length / emails.length) * 100) : 0;

  // Category distribution for pie chart
  const CATS = useMemo(() => {
    const m = {};
    emails.forEach((e) => { const c = e.category || "Work"; m[c] = (m[c] || 0) + 1; });
    return Object.entries(m).slice(0, 4).map(([n, v], i) => ({ n, v, c: [FOCUS.deep, FOCUS.mid, FOCUS.light, FOCUS.urgent][i] }));
  }, [emails]);

  // Weekly distribution
  const weekData = useMemo(() => {
    const arr = Array.from({ length: 7 }, (_, i) => ({ label: WEEK[i], v: 0 }));
    const now = new Date();
    emails.forEach((e) => { if (!e.timestamp) return; const d = new Date(e.timestamp); const diff = Math.floor((now - d) / 86400000); if (diff >= 0 && diff < 7) arr[6 - diff].v++; });
    return arr;
  }, [emails]);

  const initials = (name) => (name || "").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="space-y-6 text-ivory">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <SectionLabel>Email</SectionLabel>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em]">{unread.length} ongelezen</h2>
            {unread.length > 0 && <PulseDot color={FOCUS.urgent} size={8} />}
          </div>
          <p className="text-sm text-ivory/55 mt-1.5 italic">{important.length} gemarkeerd als belangrijk</p>
        </div>
        <OpenLink to="/email" label="Open Email" color={FOCUS.light} />
      </div>

      {/* Unread ring + sync + pie chart */}
      <div className="grid lg:grid-cols-[auto_1fr_auto] gap-5 items-center">
        <AnimatedRing pct={unreadPct} size={120} stroke={8} color={FOCUS.mid}>
          <span className="text-ivory text-3xl font-bold tabular-nums leading-none"><CountUp value={unread.length} /></span>
          <span className="text-ivory/40 text-[9px] tracking-wider mt-1">ONGELEZEN</span>
        </AnimatedRing>
        <div>
          <p className="text-ivory/45 text-[10px] uppercase tracking-[0.22em] mb-2">Categorieën</p>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={CATS} dataKey="v" nameKey="n" innerRadius={32} outerRadius={52} paddingAngle={3} isAnimationActive animationDuration={1000}>
                  {CATS.map((c, i) => <Cell key={i} fill={c.c} stroke="transparent" />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={sync} disabled={syncing} className="rounded-2xl glass-card-2 px-4 py-3 flex flex-col items-center justify-center gap-1.5 text-ivory hover:bg-white/10 transition disabled:opacity-50">
          <span className="text-[10px] uppercase tracking-[0.18em] text-ivory/55 font-semibold">Sync</span>
          <RefreshCw className={"h-5 w-5 " + (syncing ? "animate-spin" : "")} />
        </motion.button>
      </div>

      {/* Weekly chart */}
      <div className="glass-card-2 rounded-2xl p-5">
        <p className="text-ivory/45 text-[10px] uppercase tracking-[0.22em] mb-3">Deze week · ontvangen</p>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={weekData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <XAxis dataKey="label" stroke="rgba(255,255,255,0.25)" fontSize={9} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.25)" fontSize={9} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: "rgba(20,20,20,0.9)", border: `1px solid ${FOCUS.mid}`, borderRadius: 12, fontSize: 12, color: "#fff" }} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
            <Bar dataKey="v" radius={[6, 6, 0, 0]} animationDuration={1000}>
              {weekData.map((d, i) => <Cell key={i} fill={d.v ? FOCUS.mid : "rgba(255,255,255,0.1)"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Inbox */}
      <SectionLabel>Recent · Inbox</SectionLabel>
      {loading ? <Empty text="Laden…" /> : emails.length ? (
        <div className="flex flex-col gap-2">
          {emails.slice(0, 6).map((e, i) => (
            <motion.div key={e.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} onClick={onOpen} className="group flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 hover:bg-white/10 transition-colors cursor-pointer">
              <span className={`w-2 h-2 rounded-full shrink-0`} style={{ background: e.status === "unread" ? FOCUS.urgent : "transparent", border: e.status === "unread" ? "none" : "1px solid rgba(255,255,255,0.2)" }} />
              <span className="w-8 h-8 rounded-full bg-white/10 text-ivory text-[10px] font-semibold flex items-center justify-center shrink-0">{initials(e.sender)}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${e.status === "unread" ? "text-ivory font-semibold" : "text-ivory/60"}`}>{e.subject}</p>
                <p className="text-[11px] text-ivory/50 truncate">{e.sender} · {e.timestamp ? format(new Date(e.timestamp), "d MMM HH:mm") : ""}</p>
              </div>
              {e.status === "unread" && <button onClick={(ev) => { ev.stopPropagation(); markRead(e); }} className="shrink-0 rounded-full p-1.5 hover:bg-white/10 transition"><Check className="w-3.5 h-3.5" style={{ color: FOCUS.light }} /></button>}
              {e.important && <Star className="w-3.5 h-3.5 shrink-0" fill={FOCUS.urgent} style={{ color: FOCUS.urgent }} />}
            </motion.div>
          ))}
        </div>
      ) : <Empty text="Postvak leeg" />}

      <ContextGrid items={[
        { label: "ONGELEZEN", text: `${unread.length} berichten wachten op actie.` },
        { label: "BELANGRIJK", text: `${important.length} gemarkeerd als belangrijk.` },
        { label: "VANDAAG", text: weekData[6]?.v > 0 ? `${weekData[6].v} berichten vandaag ontvangen.` : "Nog niets vandaag." },
      ]} />
      <ActionRow actions={[
        { label: "Sync Inbox", primary: true, color: FOCUS.light, onClick: sync },
        { label: "Open Email", to: "/email" },
      ]} />
    </div>
  );
}