import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { usePanel } from "@/lib/PanelContext";
import { WIDGETS } from "@/lib/widgetRegistry";
import { MODULE_FUNCTIONS } from "@/lib/moduleFunctions";
import { useDashboardBoard, getActiveBoard, setActiveBoard } from "@/lib/useDashboardBoard";
import { IMAGES } from "@/lib/images";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Plus, Sparkles, RotateCcw } from "lucide-react";
import AddWidgetPicker from "@/system/panels/AddWidgetPicker";
import WidgetCell from "@/system/widgets/WidgetCell";
import MasonryGrid from "@/system/widgets/MasonryGrid";
import GiuliaIntroOverlay from "@/giulia/widgets/GiuliaIntroOverlay";
import ConciergeWidget from "@/giulia/widgets/ConciergeWidget";
import BoardSwitcher from "@/system/components/BoardSwitcher";

import { Link } from "react-router-dom";
import { MODULES } from "@/lib/moduleRegistry";

const WIDGET_SPAN = { giulia: 2, goodmorning: 2, concierge: 2, projects: 2, agenda: 2, email: 2, documents: 2, updates: 2, household: 2, selfroutines: 2, selftherapy: 2, selfdevelopment: 2, selfpersonaltime: 2, selfinsights: 2 };

/**
 * Home — in-place multi-dashboard. Vijf domein-dashboards (GIULIA / FOCUS /
 * LIFE / SELF / SYSTEM) + tijdelijke eigen dashboards, wisselbaar via de
 * links linksonder. Elk domein-dashboard opent de eerste keer met al zijn
 * widgets; daarna blijven alleen de gekozen widgets staan.
 */
export default function Home() {
  const { activeModule, closeModule } = usePanel();
  const panelOpen = !!activeModule;
  const [activeBoard, setActiveBoardState] = useState(getActiveBoard());
  const { widgets, loading, addWidget, removeWidget, patchWidget, reset, reload, isCustom } = useDashboardBoard(activeBoard);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const { toast } = useToast();

  const selectBoard = (id) => {
    setActiveBoard(id);
    setActiveBoardState(id);
  };

  useEffect(() => {
    base44.auth.me().then((u) => setUserName(u?.full_name || "")).catch(() => {});
    if (sessionStorage.getItem("giulia_boot_seen")) {
      base44.functions.invoke("startGiulia", {}).catch(() => {});
    }
    const last = Number(sessionStorage.getItem("giulia_last_refresh") || 0);
    if (Date.now() - last > 4 * 60 * 1000) {
      sessionStorage.setItem("giulia_last_refresh", String(Date.now()));
      base44.functions.invoke("refreshDashboard", {}).then(() => reload()).catch(() => {});
    }
  }, [reload]);

  const doReset = async () => {
    await reset();
    setResetKey((k) => k + 1);
    toast({ title: "Dashboard gereset", description: "Alle domein-widgets hersteld." });
  };

  const hour = new Date().getHours();
  const greetWord = hour < 12 ? "Goedemorgen" : hour < 18 ? "Goedemiddag" : "Goedenavond";
  const rawFirst = userName ? userName.split(" ")[0] : "";
  const displayName = rawFirst === "Salvatore" ? "Salvo" : rawFirst || "Salvo";
  const greeting = `${greetWord}, ${displayName}`;

  const sorted = [...widgets].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const cells = sorted.map((w) => {
    const def = WIDGETS[w.widget_type];
    if (!def) return null;
    if (w.widget_type === "concierge") return { node: <ConciergeWidget key={w.id} onRemove={() => removeWidget(w.id)} />, span: 2 };
    return { node: <WidgetCell key={w.id} def={def} widget={w} onRemove={() => removeWidget(w.id)} onThemeChange={patchWidget} sessionMode={isCustom} />, span: WIDGET_SPAN[w.widget_type] || 1 };
  }).filter(Boolean);

  return (
    <div className="relative -mx-5 lg:-mx-10 -my-6 lg:-mt-8 lg:mb-0 min-h-[calc(100svh-3.5rem)] lg:min-h-[calc(100svh-9.5rem)] overflow-hidden">
      {/* Fixed action buttons */}
      <div className="fixed top-20 right-6 lg:right-10 z-40 flex items-center gap-2">
        <button
          onClick={doReset}
          title="Dashboard resetten naar alle domein-widgets"
          className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition bg-foreground/[0.06] border border-foreground/10 text-foreground hover:bg-foreground/10 lg:bg-white/10 lg:border-white/20 lg:text-ivory lg:hover:bg-white/20"
        >
          <RotateCcw className="h-4 w-4" /> <span className="hidden sm:inline">Reset</span>
        </button>
        <Link to="/briefing" className="inline-flex items-center gap-2 rounded-full bg-charcoal text-ivory px-4 py-2.5 text-xs font-semibold hover:bg-charcoal/90 transition">
          <Sparkles className="h-4 w-4" /> <span className="hidden sm:inline">Briefing</span>
        </Link>
        <button
          onClick={() => setPickerOpen(true)}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition bg-foreground/[0.06] border border-foreground/10 text-foreground hover:bg-foreground/10 lg:bg-transparent lg:border-transparent lg:glass-1 lg:text-ivory lg:hover:bg-ivory/10"
        >
          <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Widget</span>
        </button>
      </div>

      {/* Photo — transforms when a panel opens */}
      <div className={cn("hidden lg:block fixed z-0 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[left,right,top]", panelOpen ? "left-[16%] right-[12%] top-[40vh] bottom-0 rounded-[28px]" : "left-[42%] right-0 top-0 bottom-0 rounded-l-[32px]")}>
        <img src={IMAGES.feetChair} alt="" className="h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-charcoal/10 to-transparent" />
      </div>
      <div className={cn("lg:hidden fixed top-[26vh] left-3 right-3 h-[40vh] overflow-hidden z-0 rounded-[28px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.35)]", panelOpen ? "opacity-0 translate-y-6 pointer-events-none" : "opacity-100")}>
        <img src={IMAGES.feetChair} alt="" className="h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/5 via-transparent to-charcoal/35" />
      </div>
      <div className={cn("lg:hidden fixed left-0 bottom-0 z-0 w-full h-[40vh] overflow-hidden rounded-t-[28px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]", panelOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none")}>
        <img src={IMAGES.feetChair} alt="" className="h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/35 to-transparent" />
      </div>

      {/* Panel name + function links */}
      <div className={cn("hidden lg:block fixed top-24 left-10 z-50 max-w-[34rem] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]", panelOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none")}>
        <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/70 mb-3 font-semibold">{new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}</p>
        <h1 className="text-5xl lg:text-6xl font-display font-semibold tracking-[-0.02em] leading-[1.0] text-foreground mb-5">{MODULES[activeModule]?.label}</h1>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5">
          {(MODULE_FUNCTIONS[activeModule] || []).map((f) => (
            <Link key={f.label} to={f.to} onClick={() => closeModule()} className="text-sm text-foreground/70 hover:text-foreground transition-colors underline underline-offset-4 decoration-foreground/20">{f.label}</Link>
          ))}
        </div>
      </div>

      {/* Floating widget when a panel is open */}
      {panelOpen && WIDGETS[activeModule] && (() => { const W = WIDGETS[activeModule].Component; return (
        <div className="hidden lg:block fixed left-10 bottom-[5.5rem] z-20 w-[560px] animate-fade-up">
          <W />
        </div>
      ); })()}

      {/* Content */}
      <div className={cn("relative z-10 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform pt-[6vh] lg:pt-0", panelOpen ? "translate-x-[100vw] opacity-0" : "translate-x-0 opacity-100")}>
        <header className="px-5 lg:px-10 pt-8 lg:pt-8 pb-6 lg:pb-4 flex items-end justify-between gap-4 lg:shrink-0">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/70 mb-3 font-semibold">{new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}</p>
            <h1 className="text-[40px] sm:text-5xl lg:text-6xl font-display font-semibold tracking-[-0.02em] leading-[1.0] text-foreground text-balance">{greeting}.</h1>
          </div>
        </header>

        <div className="px-5 lg:px-10 pb-10 lg:pb-0">
          {loading ? (
            <div className="max-w-[1280px] columns-1 sm:columns-2 lg:columns-4 xl:columns-5 gap-3 lg:gap-4">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="mb-3 lg:mb-4 break-inside-avoid h-[220px] rounded-[24px] shimmer" />
              ))}
            </div>
          ) : sorted.length > 0 ? (
            <MasonryGrid key={activeBoard + resetKey} className="max-w-[1280px]" gap={16} spans={cells.map((c) => c.span)} scale={0.9}>
              {cells.map((c) => c.node)}
            </MasonryGrid>
          ) : (
            <div className="glass-card rounded-[28px] p-12 flex flex-col items-center text-center max-w-md mx-auto">
              <p className="text-lg font-display font-semibold mb-2">Dit dashboard is leeg</p>
              <p className="text-sm text-foreground/55 mb-5">Voeg widgets toe om het te vullen.</p>
              <button onClick={() => setPickerOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-olive text-ivory px-5 py-2.5 text-sm font-semibold hover:bg-olive/90 transition">
                <Plus className="h-4 w-4" /> Widget toevoegen
              </button>
            </div>
          )}
        </div>
      </div>

      <BoardSwitcher active={activeBoard} onSelect={selectBoard} />

      <GiuliaIntroOverlay />

      <AddWidgetPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onAdd={addWidget} addedTypes={widgets.map((w) => w.widget_type)} />
    </div>
  );
}