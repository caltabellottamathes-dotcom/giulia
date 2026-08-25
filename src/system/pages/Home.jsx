import React, { useEffect, useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { usePanel } from "@/lib/PanelContext";
import { WIDGETS } from "@/lib/widgetRegistry";
import { MODULE_FUNCTIONS } from "@/lib/moduleFunctions";
import { useDashboardBoard, ensureAllBoards, getActiveBoard, setActiveBoard } from "@/lib/useDashboardBoard";
import { bumpRefresh } from "@/lib/refreshBus";
import { IMAGES } from "@/lib/images";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Plus, Sparkles, RefreshCw } from "lucide-react";
import AddWidgetPicker from "@/system/panels/AddWidgetPicker";
import WidgetCell from "@/system/widgets/WidgetCell";
import MasonryGrid from "@/system/widgets/MasonryGrid";

import StartupSequence from "@/system/components/StartupSequence";

import { Link } from "react-router-dom";
import { MODULES } from "@/lib/moduleRegistry";

const WIDGET_SPAN = { giulia: 2, goodmorning: 2, concierge: 1, approvals: 2, insights: 1, imalive: 1, giuliaquestions: 1, projects: 2, agenda: 2, tasks: 1, email: 1, whatsapp: 2, people: 1, timetracker: 1, documents: 2, updates: 2, sociallife: 1, remindershome: 2, thinghandle: 1, thingslove: 2, dinner: 2, howdoing: 1, beeldbank: 2 };

// Some modules open under a different key than their widget — map them so the
// floating "widget naast het paneel" resolves to the right component.
const MODULE_WIDGET_OVERRIDE = { jedag: "giulia", wantstoknow: "giuliaquestions", social: "sociallife", food: "dinner", household: "remindershome", personaladmin: "thinghandle", hobbies: "thingslove", dailystate: "howdoing" };

const BOARD_BG = {
  life: IMAGES.lifeBgPhoto,
  giulia: IMAGES.dashboardGiulia,
  focus: IMAGES.dashboardFocus,
  system: IMAGES.feetChair,
};

/**
 * Home — in-place multi-dashboard. Vijf domein-dashboards (GIULIA / FOCUS /
 * LIFE / SELF / SYSTEM) + tijdelijke eigen dashboards, wisselbaar via de
 * links linksonder. Elk domein-dashboard opent de eerste keer met al zijn
 * widgets; daarna blijven alleen de gekozen widgets staan.
 */
export default function Home() {
  const { activeModule, closeModule, voiceOpen } = usePanel();
  const panelOpen = !!(activeModule || voiceOpen);
  const [activeBoard, setActiveBoardState] = useState(getActiveBoard());
  const [ready, setReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { widgets, loading, addWidget, removeWidget, patchWidget, reload, isCustom } = useDashboardBoard(activeBoard, ready);
  const reloadRef = useRef(null);
  reloadRef.current = reload;
  const prevPanel = useRef(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [greeting, setGreeting] = useState({ line1: "", line2: "" });
  const [resetKey, setResetKey] = useState(0);
  const [startupDone, setStartupDone] = useState(() => sessionStorage.getItem("giulia_startup_done") === "1");
  const { toast } = useToast();

  const bgImage = BOARD_BG[activeBoard] || IMAGES.feetChair;

  useEffect(() => {
    const h = (e) => setActiveBoardState(e.detail);
    window.addEventListener("giulia:board-change", h);
    return () => window.removeEventListener("giulia:board-change", h);
  }, []);

  // Altijd up-to-date: bij terugkeer naar het tabblad of window-focus,
  // en bij sluiten van een paneel → dashboard opnieuw laden + globale refresh.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") {
        reloadRef.current?.();
        bumpRefresh();
      }
    };
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  useEffect(() => {
    if (prevPanel.current && !panelOpen) {
      reloadRef.current?.();
      bumpRefresh();
    }
    prevPanel.current = panelOpen;
  }, [panelOpen]);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUserName(u?.full_name || "");
      base44.functions.invoke("generateGreeting", {})
        .then((res) => {
          const d = res?.data;
          if (d?.line1 && d?.line2) setGreeting({ line1: d.line1, line2: d.line2 });
        })
        .catch(() => {});
    }).catch(() => {});
    // Dashboards laden direct (ready=true); ensureAllBoards zaait op de
    // achtergrond en herlaadt het board zodra klaar. Zo blijft het dashboard
    // altijd zichtbaar — ook als de seeding traag of gedeeltelijk faalt.
    let cancelled = false;
    setReady(true);
    ensureAllBoards().finally(() => { if (!cancelled) reloadRef.current?.(); });
    // De opstart-video zet startGiulia + refreshDashboard op gang. Bij een
    // terugkerende sessie (video al geweest) houden we de throttle-refresh aan.
    if (startupDone) {
      const last = Number(sessionStorage.getItem("giulia_last_refresh") || 0);
      if (Date.now() - last > 4 * 60 * 1000) {
        sessionStorage.setItem("giulia_last_refresh", String(Date.now()));
        base44.functions.invoke("refreshDashboard", {}).then(() => reloadRef.current?.()).catch(() => {});
      }
    }
    return () => { cancelled = true; };
  }, []);

  const doUpdate = async () => {
    setRefreshing(true);
    // 1. Sync alle databronnen parallel
    await Promise.allSettled([
      base44.functions.invoke("refreshDashboard", {}),
      base44.functions.invoke("syncEmails", {}),
      base44.functions.invoke("syncCalendar", {}),
    ]);
    // 2. Ververs het huidige dashboard
    await reload();
    // 3. Globale refresh-bus: alle widgets, panelen en pagina's die
    //    useLearningSync gebruiken horen dit en halen hun data opnieuw op.
    bumpRefresh();
    // 4. Forceer her-layout van de masonry (nieuwe data = nieuwe hoogtes)
    setResetKey((k) => k + 1);
    // 5. Globale event voor componenten die niet via useLearningSync luisteren
    window.dispatchEvent(new CustomEvent("giulia:global-refresh"));
    setRefreshing(false);
    toast({ title: "Alles bijgewerkt", description: "Email, agenda, widgets en panelen vernieuwd." });
  };

  const hour = new Date().getHours();
  const partOfDay = hour < 6 ? "night" : hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  const rawFirst = userName ? userName.split(" ")[0] : "";
  const displayName = rawFirst === "Salvatore" ? "Salvo" : rawFirst || "Salvo";

  // Fallback-groet (tot de dynamische groet binnen is, of als die faalt).
  const FALLBACK = {
    morning: { line1: `Goedemorgen, ${displayName}`, line2: "Ik heb je dag voorbereid..." },
    afternoon: { line1: `Goedemiddag, ${displayName}`, line2: "Even kijken waar we staan..." },
    evening: { line1: `Goedenavond, ${displayName}`, line2: "Tijd om het los te laten..." },
    night: { line1: `${displayName}, het is laat`, line2: "Ik bewaak je rust..." },
  };
  const g = greeting.line1 ? greeting : FALLBACK[partOfDay];

  const sorted = [...widgets].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const visible = sorted;
  const cells = visible.map((w) => {
    const def = WIDGETS[w.widget_type];
    if (!def) return null;
    return { node: <WidgetCell key={w.id} def={def} widget={w} onRemove={() => removeWidget(w.id)} onThemeChange={patchWidget} sessionMode={isCustom} />, span: WIDGET_SPAN[w.widget_type] || 1 };
  }).filter(Boolean);
  const showLoading = loading;

  return (
    <div className="relative -mx-5 lg:-mx-10 -my-6 lg:-mt-8 lg:mb-0 min-h-[calc(100svh-3.5rem)] lg:min-h-[calc(100svh-9.5rem)] overflow-hidden">
      {/* Fixed action buttons */}
      <div className="fixed top-3.5 right-4 lg:top-5 lg:right-8 z-40 flex items-center gap-1 rounded-full glass shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18),0_16px_36px_-12px_rgba(0,0,0,0.28)] px-1.5 py-1.5">
        <button
          onClick={doUpdate}
          title="Alle data, widgets en panelen bijwerken"
          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition text-foreground lg:text-ivory hover:bg-foreground/10 lg:hover:bg-white/15"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} /> <span className="hidden sm:inline">Update</span>
        </button>
        <Link to="/briefing" className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition text-foreground lg:text-ivory hover:bg-foreground/10 lg:hover:bg-white/15">
          <Sparkles className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Briefing</span>
        </Link>
        <button
          onClick={() => setPickerOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition text-foreground lg:text-ivory hover:bg-foreground/10 lg:hover:bg-white/15"
        >
          <Plus className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Widget</span>
        </button>
      </div>

      {/* Photo — transforms when a panel opens */}
      <div className={cn("hidden lg:block fixed z-0 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[left,right,top]", panelOpen ? "left-[16%] right-[12%] top-[40vh] bottom-0 rounded-[28px]" : "left-[42%] right-0 top-0 bottom-0 rounded-l-[32px]")}>
        <img src={bgImage} alt="" className="h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-charcoal/10 to-transparent" />
      </div>
      <div className={cn("lg:hidden fixed top-[26vh] left-3 right-3 h-[40vh] overflow-hidden z-0 rounded-[28px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.35)]", panelOpen ? "opacity-0 translate-y-6 pointer-events-none" : "opacity-100")}>
        <img src={bgImage} alt="" className="h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/5 via-transparent to-charcoal/35" />
      </div>
      <div className={cn("lg:hidden fixed left-0 bottom-0 z-0 w-full h-[40vh] overflow-hidden rounded-t-[28px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]", panelOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none")}>
        <img src={bgImage} alt="" className="h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/35 to-transparent" />
      </div>

      {/* Panel name + function links */}
      <div className={cn("hidden lg:block fixed top-24 left-10 z-50 max-w-[34rem] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]", panelOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none")}>
        <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/70 mb-3 font-semibold">{new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}</p>
        <h1 className="text-5xl lg:text-6xl font-display font-semibold tracking-[-0.02em] leading-[1.0] text-foreground mb-5">{voiceOpen ? "GIULIA'S HOTLINE" : MODULES[activeModule]?.label}</h1>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5">
          {(MODULE_FUNCTIONS[activeModule] || []).map((f) => (
            <Link key={f.label} to={f.to} onClick={() => closeModule()} className="text-sm text-foreground/70 hover:text-foreground transition-colors underline underline-offset-4 decoration-foreground/20">{f.label}</Link>
          ))}
        </div>
      </div>

      {/* Floating widget when a panel is open */}
      {panelOpen && (() => {
        const wType = MODULE_WIDGET_OVERRIDE[activeModule] || activeModule;
        const def = WIDGETS[wType];
        if (!def) return null;
        const W = def.Component;
        return (
          <div className="hidden lg:block fixed left-10 bottom-[5.5rem] z-20 w-[560px] animate-fade-up">
            <W />
          </div>
        );
      })()}

      {/* Content */}
      <div className={cn("relative z-10 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform pt-[3vh] lg:pt-0", panelOpen ? "translate-x-[100vw] opacity-0" : "translate-x-0 opacity-100")}>
        <header className="px-5 lg:px-10 pt-3 lg:pt-4 pb-10 lg:pb-14 flex items-end justify-between gap-4 lg:shrink-0">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/70 mb-2 font-semibold">{new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}</p>
            <h1 className="text-[22px] sm:text-2xl lg:text-[28px] font-display font-semibold tracking-[-0.02em] leading-[1.15] text-foreground text-balance">
              <span className="block">{g.line1}</span>
              <span className="block text-foreground/70">{g.line2}</span>
            </h1>
          </div>
        </header>

        <div className="px-5 lg:px-10 pb-10 lg:pb-0">
          {showLoading ? (
            <div className="max-w-[1280px] xl:max-w-[1500px] columns-1 sm:columns-2 lg:columns-4 xl:columns-5 gap-3 lg:gap-4">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="mb-3 lg:mb-4 break-inside-avoid h-[220px] rounded-[24px] shimmer" />
              ))}
            </div>
          ) : visible.length > 0 ? (
            <MasonryGrid key={activeBoard + resetKey} className="max-w-[1280px] xl:max-w-[1500px]" gap={24} spans={cells.map((c) => c.span)} scale={0.8}>
              {cells.map((c) => c.node)}
            </MasonryGrid>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 select-none animate-fade-in">
              <p className="text-[clamp(2rem,5vw,3.5rem)] font-display font-semibold tracking-[-0.03em] text-foreground/25 leading-none">Even helemaal niets.</p>
              <div className="mt-6 h-px w-24 bg-foreground/15" />
            </div>
          )}
        </div>
      </div>

      {!startupDone && (
        <StartupSequence onDone={() => {
          sessionStorage.setItem("giulia_startup_done", "1");
          sessionStorage.setItem("giulia_boot_seen", "1");
          setStartupDone(true);
        }} />
      )}
      <AddWidgetPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onAdd={addWidget} addedTypes={widgets.map((w) => w.widget_type)} />
    </div>
  );
}