import React, { useEffect, useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { usePanel } from "@/lib/PanelContext";
import { WIDGETS } from "@/lib/widgetRegistry";
import { MODULE_FUNCTIONS } from "@/lib/moduleFunctions";
import { useDashboardBoard, ensureAllBoards, getActiveBoard, setActiveBoard, DEFAULT_BOARDS, loadCustomBoards } from "@/lib/useDashboardBoard";
import { bumpRefresh } from "@/lib/refreshBus";
import { IMAGES } from "@/lib/images";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { GlassSurfaceProvider } from "@/lib/GlassSurfaceContext";
import { useActiveDomain } from "@/lib/useActiveDomain";
import { Plus, Sparkles, RefreshCw } from "lucide-react";
import AddWidgetPicker from "@/system/panels/AddWidgetPicker";
import WidgetCell from "@/system/widgets/WidgetCell";
import MasonryGrid from "@/system/widgets/MasonryGrid";

import StartupSequence from "@/system/components/StartupSequence";

import { Link } from "react-router-dom";
import { MODULES } from "@/lib/moduleRegistry";

// Spans op een 15-koloms grid (desktop). Oude 5-koloms waarden ×3, zodat
// huidige formaten behouden blijven maar je nu stappen van 1 kolom kunt zetten
// (1 span = 1/15, ... 3 = 20%, 5 = 33%, 6 = 40%, 8 = 53%, 15 = volledig).
const WIDGET_SPAN = { giulia: 6, goodmorning: 6, concierge: 3, approvals: 6, insights: 3, imalive: 3, giuliaquestions: 3, projects: 6, agenda: 6, tasks: 3, email: 3, whatsapp: 6, people: 3, timetracker: 3, documents: 6, updates: 6, sociallife: 3, remindershome: 6, thinghandle: 3, thingslove: 6, dinner: 6, howdoing: 3, musicwidget: 3, beeldbank: 6, velochat: 3 };

// Some modules open under a different key than their widget — map them so the
// floating "widget naast het paneel" resolves to the right component.
const MODULE_WIDGET_OVERRIDE = { jedag: "giulia", wantstoknow: "giuliaquestions", social: "sociallife", food: "dinner", household: "remindershome", personaladmin: "thinghandle", hobbies: "thingslove", dailystate: "howdoing", mediaplayer: "musicwidget" };

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
  const { accent: boardAccent } = useActiveDomain(activeBoard);
  const pillStyle = {
    border: "1px solid rgba(255,255,255,0.14)",
    background: `color-mix(in srgb, ${boardAccent} 6%, rgba(120,122,128,0.10))`,
    backdropFilter: "blur(30px) saturate(1.4)",
    WebkitBackdropFilter: "blur(30px) saturate(1.4)",
    boxShadow: "0 18px 40px -16px rgba(0,0,0,0.40), inset 0 1px 0 0 rgba(255,255,255,0.18)",
  };
  const reloadRef = useRef(null);
  reloadRef.current = reload;
  const prevPanel = useRef(false);
  const photoRef = useRef(null);
  const swipeRef = useRef(null);
  const lastSwipe = useRef(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [greeting, setGreeting] = useState({ line1: "", line2: "" });
  const [resetKey, setResetKey] = useState(0);
  const [startupDone, setStartupDone] = useState(() => sessionStorage.getItem("giulia_startup_done") === "1");
  const [fitH, setFitH] = useState(0);
  const [howdoingDue, setHowdoingDue] = useState(false);
  const { toast } = useToast();

  // Desktop: masonry past in één beeld (geen scroll) — fitHeight laat
  // MasonryGrid zich afschalen tot de viewport-hoogte.
  useEffect(() => {
    const calc = () => setFitH(window.innerHeight - 180);
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const bgImage = BOARD_BG[activeBoard] || IMAGES.feetChair;

  useEffect(() => {
    const h = (e) => setActiveBoardState(e.detail);
    window.addEventListener("giulia:board-change", h);
    return () => window.removeEventListener("giulia:board-change", h);
  }, []);

  // How-doing-widget wordt fysiek breder wanneer hij due is (check-in open)
  useEffect(() => {
    const h = (e) => setHowdoingDue(!!e.detail);
    window.addEventListener("giulia:howdoing-due", h);
    return () => window.removeEventListener("giulia:howdoing-due", h);
  }, []);

  // Swipe door dashboards — touch (links/rechts) en trackpad (horizontale wheel).
  const switchBoard = (dir) => {
    if (panelOpen) return;
    const now = Date.now();
    if (now - lastSwipe.current < 350) return;
    const list = [...DEFAULT_BOARDS, ...loadCustomBoards()];
    const idx = list.findIndex((b) => b.id === activeBoard);
    if (idx === -1) return;
    const next = idx + dir;
    if (next < 0 || next >= list.length) return;
    lastSwipe.current = now;
    const nb = list[next];
    setActiveBoard(nb.id);
    setActiveBoardState(nb.id);
    window.dispatchEvent(new CustomEvent("giulia:board-change", { detail: nb.id }));
  };
  useEffect(() => {
    const el = swipeRef.current;
    if (!el) return;
    let startX = 0, startY = 0, act = false;
    const onDown = (e) => { const t = e.touches?.[0]; if (!t) return; startX = t.clientX; startY = t.clientY; act = true; };
    const onUp = (e) => {
      if (!act) return; act = false;
      const t = e.changedTouches?.[0]; if (!t) return;
      const dx = t.clientX - startX, dy = t.clientY - startY;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6) switchBoard(dx < 0 ? 1 : -1);
    };
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) > 40 && Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.6) switchBoard(e.deltaX > 0 ? 1 : -1);
    };
    el.addEventListener("touchstart", onDown, { passive: true });
    el.addEventListener("touchend", onUp, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: true });
    return () => { el.removeEventListener("touchstart", onDown); el.removeEventListener("touchend", onUp); el.removeEventListener("wheel", onWheel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBoard, panelOpen]);

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
      // Groet cachet per uur (Amsterdam): binnen hetzelfde uur geen nieuwe fetch.
      const GREETING_KEY = "giulia_greeting_cache";
      const hourKey = new Date().toLocaleString("nl-NL", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hour12: false, timeZone: "Europe/Amsterdam" }).replace(/[\s/:]/g, "");
      let cached = null;
      try { cached = JSON.parse(localStorage.getItem(GREETING_KEY) || "null"); } catch {}
      if (cached && cached.hour === hourKey && cached.line1 && cached.line2) {
        setGreeting({ line1: cached.line1, line2: cached.line2 });
        return;
      }
      base44.functions.invoke("generateGreeting", {})
        .then((res) => {
          const d = res?.data;
          if (d?.line1 && d?.line2) {
            setGreeting({ line1: d.line1, line2: d.line2 });
            try { localStorage.setItem(GREETING_KEY, JSON.stringify({ hour: hourKey, line1: d.line1, line2: d.line2 })); } catch {}
          }
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
      base44.functions.invoke("syncGoogleContacts", {}),
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
    toast({ title: "Alles bijgewerkt", description: "Email, agenda, contacten, widgets en panelen vernieuwd." });
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
    const span = (w.widget_type === "howdoing" && howdoingDue) ? 6 : (WIDGET_SPAN[w.widget_type] || 1);
    return { node: <WidgetCell key={w.id} def={def} widget={w} onRemove={() => removeWidget(w.id)} onThemeChange={patchWidget} sessionMode={isCustom} />, span };
  }).filter(Boolean);
  const showLoading = loading && widgets.length === 0;

  return (
    <GlassSurfaceProvider photoRef={photoRef}>
    <div className="relative -mx-5 lg:-mx-10 -my-6 lg:-mt-8 lg:mb-0 min-h-[calc(100svh-3.5rem)] lg:min-h-[calc(100svh-9.5rem)] overflow-hidden">
      {/* Fixed action buttons */}
      <div className="fixed top-3.5 right-4 lg:top-5 lg:right-8 z-40 flex items-center gap-1 rounded-full px-1.5 py-1.5" style={pillStyle}>
        <button
          onClick={doUpdate}
          title="Alle data, widgets en panelen bijwerken"
          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition text-foreground/80 hover:bg-foreground/15 hover:text-foreground"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} /> <span className="hidden sm:inline">Update</span>
        </button>
        <Link to="/briefing" className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition text-foreground/80 hover:bg-foreground/15 hover:text-foreground">
          <Sparkles className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Briefing</span>
        </Link>
        <button
          onClick={() => setPickerOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition text-foreground/80 hover:bg-foreground/15 hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Widget</span>
        </button>
      </div>

      {/* Photo — transforms when a panel opens */}
      <div ref={photoRef} className={cn("hidden lg:block fixed z-0 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[left,right,top]", panelOpen ? "left-[16%] right-[12%] top-[40vh] bottom-0 rounded-[28px]" : "left-[42%] right-0 top-0 bottom-0 rounded-l-[32px]")}>
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
        // Food / Hobbies / Household hebben brede widgets — geef ze een
        // groter zwevend formaat zodat ze meeschalen met de andere widgets.
        const FLOAT_W = { dinner: 460, thingslove: 400, remindershome: 500 };
        const fw = FLOAT_W[wType] || 340;
        return (
          <div className="hidden lg:block fixed left-10 bottom-[5.5rem] z-20 animate-fade-up" style={{ width: fw }}>
            <W />
          </div>
        );
      })()}

      {/* Content */}
      <div ref={swipeRef} className={cn("relative z-10 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform pt-[1vh] lg:pt-0", panelOpen ? "translate-x-[100vw] opacity-0" : "translate-x-0 opacity-100")}>
        <header className="px-5 lg:px-10 pt-3 lg:pt-4 pb-6 lg:pb-8 flex items-end justify-between gap-4 lg:shrink-0">
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
            <MasonryGrid key={activeBoard + resetKey} className="max-w-[1280px] xl:max-w-[1500px]" gap={24} spans={cells.map((c) => c.span)} scale={0.8} columnTiers={[[0, 1], [640, 6], [1024, 12], [1280, 15]]} fitHeight={fitH}>
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
    </GlassSurfaceProvider>
  );
}