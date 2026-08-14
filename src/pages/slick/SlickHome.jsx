import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Mail, FileText, Calendar, Plus, ChevronDown, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { PageShell, GlassPanel, GlassButton, SectionHeader, Divider } from "@/components/slick/glass";


const WEEKDAYS = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];
const MONTHS = ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"];
const ICON_COLORS = ["text-clay", "text-sand", "text-sky", "text-marble"];

function MiniCalendar() {
  const [view, setView] = useState({ year: 2020, month: 4 });
  const [selected, setSelected] = useState(17);

  const firstDay = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prev = () => setView((v) => (v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 }));
  const next = () => setView((v) => (v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 }));

  return (
    <div className="rounded-2xl border border-marble/20 bg-marble/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prev} className="text-marble/70 hover:text-storm transition-colors"><ChevronLeft className="w-4 h-4" /></button>
        <span className="text-storm text-sm font-medium">{MONTHS[view.month].slice(0, 3)} {view.year}</span>
        <button onClick={next} className="text-marble/70 hover:text-storm transition-colors"><ChevronRight className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] text-marble/50 font-medium">{d.slice(0, 2)}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => (
          <button
            key={i}
            disabled={!d}
            onClick={() => d && setSelected(d)}
            className={`aspect-square flex items-center justify-center text-xs rounded-full transition-all ${
              d === selected ? "bg-urgent text-metal font-semibold shadow-[0_2px_10px_rgba(213,226,74,0.5)]"
              : d ? "text-marble/80 hover:bg-marble/20" : ""
            }`}
          >
            {d || ""}
          </button>
        ))}
      </div>
      <div className="text-center text-marble/40 mt-2 text-sm">—</div>
    </div>
  );
}

const NAV = [
  { to: "/", label: "Home" },
  { to: "/slick/weekplanning", label: "Week" },
  { to: "/slick/dagplanning", label: "Dag" },
  { to: "/slick/projecten", label: "Projecten" },
  { to: "/slick/contacten", label: "Contacten" },
  { to: "/slick/taak-details", label: "Taak Details" },
  { to: "/slick/prioriteiten-matrix", label: "Matrix" },
  { to: "/slick/notitieblok", label: "Notitieblok" },
  { to: "/slick/instellingen", label: "Instellingen" },
  { to: "/slick/tijdsregistratie", label: "Tijd" },
  { to: "/slick/archief", label: "Archief" },
  { to: "/slick/focus-modus", label: "Focus" },
  { to: "/slick/dagelijkse-briefing", label: "Briefing" },
  { to: "/slick/doelen-dashboard", label: "Doelen" },
  { to: "/slick/vergader-notities", label: "Vergader" },
  { to: "/slick/inspiratie-bord", label: "Inspiratie" },
  { to: "/slick/takenoverzicht", label: "Taken" },
  { to: "/slick/statistieken", label: "Statistieken" },
  { to: "/slick/agenda-overzicht", label: "Agenda" },
];

export default function Home() {
  const [taskProfiles, setTaskProfiles] = useState([true, true, true, false]);
  const [contextOpen, setContextOpen] = useState(false);
  const [contextValue, setContextValue] = useState("Project Marktanalyse");
  const toggleProfile = (i) => setTaskProfiles((p) => p.map((v, idx) => (idx === i ? !v : v)));

  return (
    <PageShell>
      {/* Nav inside panel */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} className="px-4 py-2 rounded-full border border-marble/30 bg-marble/10 backdrop-blur-md text-storm text-xs hover:bg-marble/20 transition-colors">
            {n.label}
          </Link>
        ))}
      </div>
      <Divider className="mb-6" />

      {/* Greeting + assistant */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/5 flex flex-col justify-between min-h-[240px]">
          <div>
            <h1 className="text-storm text-2xl sm:text-3xl font-bold leading-tight tracking-tight">Hallo! Waarmee kan ik je vandaag helpen?</h1>
            <p className="text-marble/70 text-sm mt-4 leading-relaxed max-w-xs">Jouw assistent staat klaar. Ik kan helpen met afspraken, onderzoek, informatie-retrieval, en taakbeheer.</p>
          </div>
          <GlassButton className="self-start px-5 py-2.5 text-storm text-sm font-medium border-marble/40">Book Giulia</GlassButton>
        </div>
        <div className="hidden lg:block w-px bg-marble/25" />
        <div className="lg:w-3/5 flex flex-col gap-5">
          <div>
            <p className="text-marble/50 text-xs">Privé</p>
            <h2 className="text-storm text-xl font-semibold tracking-tight">GIULIA Privé-assistent</h2>
          </div>
          <div>
            <SectionHeader number={1} title="Actieve Taakprofielen" />
            <div className="grid grid-cols-4 gap-2 mt-3">
              {[Search, Mail, FileText, Calendar].map((Icon, i) => (
                <GlassButton key={i} onClick={() => toggleProfile(i)} active={taskProfiles[i]} className="aspect-square flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${ICON_COLORS[i]}`} />
                </GlassButton>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {["Marktonderzoek", "Concept Brons", "Identiteit"].map((label, i) => (
                <GlassButton key={label} active={taskProfiles[i]} onClick={() => toggleProfile(i)} className="aspect-square flex items-center justify-center text-center px-1">
                  <span className="text-marble text-[10px] font-medium leading-tight">{label}</span>
                </GlassButton>
              ))}
              <GlassButton className="aspect-square flex items-center justify-center"><Plus className="w-5 h-5 text-marble" /></GlassButton>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <SectionHeader number={5} title="Taakcontext" />
              <div className="rounded-2xl border border-marble/20 bg-marble/5 p-3 mt-3">
                <button onClick={() => setContextOpen((o) => !o)} className="w-full flex items-center justify-between text-storm text-sm">
                  <span className="font-medium">{contextValue}</span>
                  <ChevronDown className={`w-4 h-4 text-marble/70 transition-transform ${contextOpen ? "rotate-180" : ""}`} />
                </button>
                {contextOpen && (
                  <div className="mt-2 pt-2 border-t border-marble/20 space-y-1">
                    {["Project", "Delays"].map((opt) => (
                      <button key={opt} onClick={() => { setContextValue(opt); setContextOpen(false); }} className="w-full text-left text-marble/80 hover:text-storm text-sm py-1 px-2 rounded-lg hover:bg-marble/15 transition-colors">{opt}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <SectionHeader number={9} title="Mijn Agenda" />
              <div className="mt-3"><MiniCalendar /></div>
            </div>
          </div>
        </div>
      </div>

      <Divider className="my-6" />

      {/* Main action */}
      <div className="flex items-center justify-end gap-2">
        <button className="px-6 py-3 rounded-full bg-urgent text-metal text-sm font-semibold hover:brightness-105 transition-all shadow-[0_4px_20px_rgba(213,226,74,0.4)] active:scale-95">Nieuwe Taak Plannen</button>
        <Sparkles className="w-5 h-5 text-urgent" />
      </div>
    </PageShell>
  );
}