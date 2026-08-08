import React, { useEffect, useMemo, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { usePanel } from "@/lib/PanelContext";
import { WIDGETS } from "@/lib/widgetRegistry";
import { IMAGES } from "@/lib/images";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import AddWidgetPicker from "@/components/panels/AddWidgetPicker";
import WidgetTile from "@/components/widgets/WidgetTile";

const DEFAULT_WIDGETS = ["giulia", "agenda", "tasks", "approvals", "email", "projects"];

/**
 * Home — a spatial widget canvas. Every widget is freely draggable and can
 * overlap others; positions persist per user. The editorial photo reaches the
 * right edge and shrinks to the bottom-left when a module panel opens.
 */
export default function Home() {
  const { activeModule, openModule } = usePanel();
  const panelOpen = !!activeModule;
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [focusedId, setFocusedId] = useState(null);
  const [userName, setUserName] = useState("");
  const { toast } = useToast();
  const canvasRef = useRef(null);

  const cols = useMemo(() => {
    if (typeof window === "undefined") return 3;
    return window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3;
  }, []);
  const cardW = 300;
  const cardH = 270;
  const defaultPos = (i) => ({ x: 12 + (i % cols) * (cardW + 14), y: 12 + Math.floor(i / cols) * (cardH + 14) });

  const load = async () => {
    try {
      const recs = await base44.entities.DashboardWidget.list("position");
      if (!recs || recs.length === 0) {
        const created = await base44.entities.DashboardWidget.bulkCreate(
          DEFAULT_WIDGETS.map((t, i) => ({ widget_type: t, position: i, visible: true, ...defaultPos(i) }))
        );
        setWidgets(created || []);
      } else {
        setWidgets(recs.filter((r) => r.visible !== false));
      }
    } catch (e) {
      setWidgets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    base44.auth.me().then((u) => setUserName(u?.full_name || "")).catch(() => {});
  }, []);

  const onMove = async (id, x, y) => {
    setWidgets((ws) => ws.map((w) => (w.id === id ? { ...w, x, y } : w)));
    try {
      await base44.entities.DashboardWidget.update(id, { x, y });
    } catch (e) {
      /* ignore */
    }
  };

  const removeWidget = async (id) => {
    setWidgets((w) => w.filter((x) => x.id !== id));
    try {
      await base44.entities.DashboardWidget.delete(id);
    } catch (e) {
      /* ignore */
    }
    toast({ title: "Widget verwijderd" });
  };

  const addWidget = async (type) => {
    if (widgets.find((w) => w.widget_type === type)) {
      toast({ title: "Staat al op je dashboard" });
      return;
    }
    const pos = defaultPos(widgets.length);
    try {
      const rec = await base44.entities.DashboardWidget.create({
        widget_type: type,
        position: widgets.length,
        visible: true,
        x: pos.x,
        y: pos.y,
      });
      setWidgets([...widgets, rec]);
      setPickerOpen(false);
      toast({ title: "Widget toegevoegd", description: WIDGETS[type]?.label });
    } catch (e) {
      toast({ title: "Toevoegen mislukt", variant: "destructive" });
    }
  };

  const hour = new Date().getHours();
  const greetWord = hour < 12 ? "Goedemorgen" : hour < 18 ? "Goedemiddag" : "Goedenavond";
  const rawFirst = userName ? userName.split(" ")[0] : "";
  const displayName = rawFirst === "Salvatore" ? "Salvo" : (rawFirst || "Salvo");
  const greeting = `${greetWord}, ${displayName}`;

  return (
    <div className="relative -mx-5 lg:-mx-10 -my-6 lg:-my-8 min-h-[calc(100svh-3.5rem)] overflow-hidden">
      {/* Photo — wide card reaching the viewport RIGHT edge (desktop) */}
      <div
        className={cn(
          "hidden lg:block fixed top-14 right-0 bottom-0 w-[58%] overflow-hidden z-0 lg:rounded-l-[32px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          panelOpen ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
        )}
      >
        <img src={IMAGES.feetChair} alt="" className="h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-storm/25" />
      </div>

      {/* Photo — mobile banner */}
      <div
        className={cn(
          "lg:hidden fixed top-14 left-0 right-0 h-[30vh] overflow-hidden z-0 rounded-b-[28px] transition-all duration-700",
          panelOpen ? "opacity-0 -translate-y-4 pointer-events-none" : "opacity-100"
        )}
      >
        <img src={IMAGES.feetChair} alt="" className="h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/10 to-background/25" />
      </div>

      {/* Photo — small oblong card bottom-left when a panel opens */}
      <div
        className={cn(
          "fixed left-4 bottom-4 z-0 w-[52%] h-[26vh] lg:w-[30%] lg:h-[30vh] overflow-hidden rounded-[24px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          panelOpen ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
        )}
      >
        <img src={IMAGES.feetChair} alt="" className="h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-tr from-charcoal/45 to-transparent" />
      </div>

      {/* Content — slides right when a module panel opens */}
      <div
        className={cn(
          "relative z-10 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform pt-[30vh] lg:pt-0",
          panelOpen ? "translate-x-[100vw] opacity-0" : "translate-x-0 opacity-100"
        )}
      >
        <header className="px-5 lg:px-10 pt-8 lg:pt-10 pb-6 lg:pb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/80 mb-3 font-semibold">
              {new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h1 className="text-[40px] sm:text-5xl lg:text-6xl font-display font-semibold tracking-[-0.02em] leading-[1.0] text-foreground text-balance">
              {greeting}.
            </h1>
          </div>
          <button
            onClick={() => setPickerOpen(true)}
            className="shrink-0 inline-flex items-center gap-2 rounded-full glass-1 px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-foreground/5 transition"
          >
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Widget</span>
          </button>
        </header>

        {/* Spatial widget canvas */}
        <div className="px-5 lg:px-10 pb-10">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="lg:col-span-4 h-[240px] rounded-[24px] shimmer" />
              ))}
            </div>
          ) : (
            <div ref={canvasRef} className="relative h-[82vh] min-h-[680px]">
              {widgets.map((w, index) => {
                const def = WIDGETS[w.widget_type];
                if (!def) return null;
                const hasPos = w.x != null && w.y != null && (w.x !== 0 || w.y !== 0);
                const pos = hasPos ? { x: w.x, y: w.y } : defaultPos(index);
                return (
                  <WidgetTile
                    key={w.id}
                    widget={{ ...w, x: pos.x, y: pos.y }}
                    def={def}
                    canvasRef={canvasRef}
                    zIndex={focusedId === w.id ? 60 : 10 + index}
                    onMove={onMove}
                    onRemove={removeWidget}
                    onFocus={setFocusedId}
                  />
                );
              })}
              {widgets.length === 0 && (
                <div className="glass-card rounded-[28px] p-12 flex flex-col items-center text-center max-w-md mx-auto">
                  <p className="text-lg font-display font-semibold mb-2">Je dashboard is leeg</p>
                  <p className="text-sm text-foreground/55 mb-5">Voeg widgets toe om je dag te organiseren.</p>
                  <button
                    onClick={() => setPickerOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-olive text-ivory px-5 py-2.5 text-sm font-semibold hover:bg-olive/90 transition"
                  >
                    <Plus className="h-4 w-4" /> Widget toevoegen
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <nav className="px-5 lg:px-10 pb-8 flex flex-wrap gap-x-6 gap-y-2">
          {[
            { label: "Projecten", key: "projects" },
            { label: "Email", key: "email" },
            { label: "WhatsApp", key: "whatsapp" },
            { label: "Kennisbank", key: "knowledge" },
            { label: "Documenten", key: "documents" },
            { label: "Mensen", key: "people" },
            { label: "Activiteit", key: "activity" },
            { label: "Inzichten", key: "insights" },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => openModule(m.key)}
              className="text-[12px] text-foreground/75 hover:text-foreground transition-colors tracking-wide font-medium"
            >
              {m.label}
            </button>
          ))}
        </nav>
      </div>

      <AddWidgetPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onAdd={addWidget}
        addedTypes={widgets.map((w) => w.widget_type)}
      />
    </div>
  );
}