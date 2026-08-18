import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Mail, FileText, Calendar, Plus, ChevronDown, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { usePanel } from "@/lib/PanelContext";
import { SectionLabel } from "../../system/panels/previewParts";
import CountUp from "@/system/widgets/CountUp";
import { GIULIA } from "@/lib/domainPalettes";
import { ContextGrid, ActionRow, OpenLink, PulseDot } from "@/self/components/SelfViz";

const WEEKDAYS = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];
const MONTHS = ["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];
const ICONS = [Search, Mail, FileText, Calendar];
const ICON_TONE = [GIULIA.deep, GIULIA.mid, GIULIA.light, GIULIA.plum];

function MiniCalendar() {
  const today = new Date();
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState(today.getDate());
  const firstDay = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const prev = () => setView((v) => (v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 }));
  const next = () => setView((v) => (v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 }));
  const isToday = (d) => d && view.year === today.getFullYear() && view.month === today.getMonth() && d === today.getDate();
  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prev} className="text-ivory/60 hover:text-ivory transition-colors"><ChevronDown className="w-4 h-4 rotate-90" /></button>
        <span className="text-ivory text-sm font-medium">{MONTHS[view.month]} {view.year}</span>
        <button onClick={next} className="text-ivory/60 hover:text-ivory transition-colors"><ChevronDown className="w-4 h-4 -rotate-90" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">{WEEKDAYS.map((d) => <div key={d} className="text-center text-[10px] text-ivory/45 font-medium">{d}</div>)}</div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => (
          <button key={i} disabled={!d} onClick={() => d && setSelected(d)} className={`aspect-square flex items-center justify-center text-xs rounded-full transition-all ${d === selected ? "text-charcoal font-semibold" : isToday(d) ? "text-ivory font-semibold ring-1" : d ? "text-ivory/75 hover:bg-white/10" : ""}`} style={d === selected ? { background: GIULIA.light } : isToday(d) ? { boxShadow: `0 0 0 1px ${GIULIA.light}50` } : {}}>{d || ""}</button>
        ))}
      </div>
    </div>
  );
}

export default function JeDagPreview() {
  const { openChat, closeModule } = usePanel();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [taskProfiles, setTaskProfiles] = useState([true, true, true, false]);
  const [contextOpen, setContextOpen] = useState(false);
  const [contextValue, setContextValue] = useState("Taakcontext");

  useEffect(() => { (async () => { try { const ps = await base44.entities.Project.list("-updated_date", 6).catch(() => []); setProfiles(ps || []); if (ps && ps[0]) setContextValue(ps[0].title); } catch { /* ignore */ } })(); }, []);

  const toggleProfile = (i) => setTaskProfiles((p) => p.map((v, idx) => (idx === i ? !v : v)));
  const profileLabels = profiles.slice(0, 3).map((p) => p.title);
  const openGiulia = () => { closeModule(); openChat(); };
  const planTask = () => { closeModule(); navigate("/tasks"); };

  return (
    <div className="space-y-6 text-ivory">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <SectionLabel>Je Dag</SectionLabel>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-[32px] leading-[0.95] font-display font-semibold tracking-[-0.03em]">Hallo!</h2>
            <PulseDot color={GIULIA.light} size={8} />
          </div>
          <p className="text-sm text-ivory/55 mt-1.5 italic">Waarmee kan ik je vandaag helpen?</p>
        </div>
        <OpenLink to="/chat" label="Open Giulia" color={GIULIA.light} />
      </div>

      {/* Hero */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/5 flex flex-col justify-between min-h-[220px]">
          <div>
            <h1 className="text-ivory text-2xl sm:text-3xl font-display font-semibold leading-tight tracking-tight">Hallo! Waarmee kan ik je vandaag helpen?</h1>
            <p className="text-ivory/65 text-sm mt-4 leading-relaxed max-w-xs">Jouw assistent staat klaar. Ik kan helpen met afspraken, onderzoek, informatie-retrieval en taakbeheer.</p>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openGiulia} className="self-start px-5 py-2.5 rounded-full glass-button text-ivory text-sm font-medium border border-white/20 hover:bg-white/10 transition">Open Giulia</motion.button>
        </div>
        <div className="hidden lg:block w-px bg-ivory/15" />
        <div className="lg:w-3/5 flex flex-col gap-5">
          <div>
            <p className="text-ivory/55 text-xs">Privé</p>
            <h2 className="text-ivory text-xl font-display font-semibold tracking-tight">GIULIA Privé-assistent</h2>
          </div>
          <div>
            <SectionLabel>Actieve Taakprofielen</SectionLabel>
            <div className="grid grid-cols-4 gap-2 mt-3">
              {ICONS.map((Icon, i) => (
                <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => toggleProfile(i)} className={`aspect-square flex items-center justify-center rounded-xl border transition ${taskProfiles[i] ? "border-white/25 bg-white/10" : "border-white/15 bg-white/[0.04]"}`}>
                  <Icon className="w-5 h-5" style={{ color: ICON_TONE[i] }} />
                </motion.button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {profileLabels.map((label, i) => (
                <button key={label} onClick={() => toggleProfile(i)} className={`aspect-square flex items-center justify-center text-center px-1 rounded-xl border transition ${taskProfiles[i] ? "border-white/25 bg-white/10" : "border-white/15 bg-white/[0.04]"}`}>
                  <span className="text-ivory text-[10px] font-medium leading-tight line-clamp-2">{label}</span>
                </button>
              ))}
              <button className="aspect-square flex items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.04]"><Plus className="w-5 h-5 text-ivory/55" /></button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <SectionLabel>Taakcontext</SectionLabel>
              <div className="rounded-2xl border border-white/15 bg-white/5 p-3 mt-3">
                <button onClick={() => setContextOpen((o) => !o)} className="w-full flex items-center justify-between text-ivory text-sm">
                  <span className="font-medium truncate">{contextValue}</span>
                  <ChevronDown className={`w-4 h-4 text-ivory/60 transition-transform ${contextOpen ? "rotate-180" : ""}`} />
                </button>
                {contextOpen && (
                  <div className="mt-2 pt-2 border-t border-white/15 space-y-1">
                    {profiles.slice(0, 4).map((p) => (
                      <button key={p.id} onClick={() => { setContextValue(p.title); setContextOpen(false); }} className="w-full text-left text-ivory/80 hover:text-ivory text-sm py-1 px-2 rounded-lg hover:bg-white/10 transition-colors truncate">{p.title}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <SectionLabel>Mijn Agenda</SectionLabel>
              <div className="mt-3"><MiniCalendar /></div>
            </div>
          </div>
        </div>
      </div>

      <ContextGrid items={[
        { label: "PROFIELEN", text: `${taskProfiles.filter(Boolean).length} actieve taakprofielen.` },
        { label: "CONTEXT", text: `Huidige context: ${contextValue}.` },
        { label: "ASSISTENT", text: "Giulia staat klaar om je te helpen." },
      ]} />
      <ActionRow actions={[
        { label: "Nieuwe Taak Plannen", primary: true, color: GIULIA.light, onClick: planTask },
        { label: "Open Giulia", onClick: openGiulia },
        { label: "Open Chat", to: "/chat" },
      ]} />
    </div>
  );
}