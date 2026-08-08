import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { base44 } from "@/api/base44Client";
import { usePanel } from "@/lib/PanelContext";
import { WIDGETS, SPAN_CLASS } from "@/lib/widgetRegistry";
import { IMAGES } from "@/lib/images";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import AddWidgetPicker from "@/components/panels/AddWidgetPicker";

const DEFAULT_WIDGETS = ["giulia", "agenda", "tasks", "approvals", "email", "projects"];

/**
 * Home — the GIULIA OS widget center.
 * The editorial photo is a wide card reaching the RIGHT edge of the screen;
 * the glass widgets float on top in a clean, draggable grid. Every widget
 * can be dragged to reorder or removed; new widgets come from the picker.
 * Opening a module panel slides the dashboard away and shrinks the photo
 * into an oblong card in the bottom-left corner.
 */
export default function Home() {
  const { activeModule, openModule } = usePanel();
  const panelOpen = !!activeModule;
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    try {
      const recs = await base44.entities.DashboardWidget.list("position");
      if (!recs || recs.length === 0) {
        const created = await base44.entities.DashboardWidget.bulkCreate(
          DEFAULT_WIDGETS.map((t, i) => ({ widget_type: t, position: i, visible: true }))
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
  }, []);

  const onDragEnd = async (res) => {
    if (!res.destination || res.destination.index === res.source.index) return;
    const reordered = Array.from(widgets);
    const [moved] = reordered.splice(res.source.index, 1);
    reordered.splice(res.destination.index, 0, moved);
    setWidgets(reordered);
    try {
      await base44.entities.DashboardWidget.bulkUpdate(
        reordered.map((w, i) => ({ id: w.id, position: i }))
      );
    } catch (e) {
      /* ignore persist error */
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
    try {
      const rec = await base44.entities.DashboardWidget.create({
        widget_type: type,
        position: widgets.length,
        visible: true,
      });
      setWidgets([...widgets, rec]);
      setPickerOpen(false);
      toast({ title: "Widget toegevoegd", description: WIDGETS[type]?.label });
    } catch (e) {
      toast({ title: "Toevoegen mislukt", variant: "destructive" });
    }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Goedemorgen" : hour < 18 ? "Goedemiddag" : "Goedenavond";

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

      {/* Photo — mobile banner reaching both edges */}
      <div
        className={cn(
          "lg:hidden fixed top-14 left-0 right-0 h-[30vh] overflow-hidden z-0 rounded-b-[28px] transition-all duration-700",
          panelOpen ? "opacity-0 -translate-y-4 pointer-events-none" : "opacity-100"
        )}
      >
        <img src={IMAGES.feetChair} alt="" className="h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/10 to-background/25" />
      </div>

      {/* Photo — small oblong card in the bottom-left when a panel opens */}
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
        {/* Greeting + add widget */}
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

        {/* Draggable widget grid */}
        <div className="px-5 lg:px-10 pb-10">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="lg:col-span-4 h-[220px] rounded-[24px] shimmer" />
              ))}
            </div>
          ) : widgets.length === 0 ? (
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
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="dashboard" direction="horizontal">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start"
                  >
                    {widgets.map((w, index) => {
                      const def = WIDGETS[w.widget_type];
                      if (!def) return null;
                      const WidgetComp = def.Component;
                      return (
                        <Draggable key={w.id} draggableId={w.id} index={index}>
                          {(p) => (
                            <div
                              ref={p.innerRef}
                              {...p.draggableProps}
                              className={cn("w-full", SPAN_CLASS[def.span] || "lg:col-span-4")}
                            >
                              <div className="relative group h-full">
                                {/* drag handle */}
                                <div
                                  {...p.dragHandleProps}
                                  className="absolute top-2 left-2 z-20 h-7 w-7 rounded-lg glass-1 flex items-center justify-center cursor-grab active:cursor-grabbing opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                                  aria-label="Slepen"
                                >
                                  <span className="flex flex-col gap-[3px]">
                                    <span className="block h-[1.5px] w-3 bg-foreground/60 rounded" />
                                    <span className="block h-[1.5px] w-3 bg-foreground/60 rounded" />
                                    <span className="block h-[1.5px] w-3 bg-foreground/60 rounded" />
                                  </span>
                                </div>
                                {/* remove */}
                                <button
                                  onClick={() => removeWidget(w.id)}
                                  className="absolute top-2 right-2 z-20 h-7 w-7 rounded-lg glass-1 flex items-center justify-center text-foreground/60 hover:text-destructive opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all"
                                  aria-label="Verwijderen"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                                <WidgetComp />
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>

        {/* Quick nav */}
        <nav className="px-5 lg:px-10 pb-8 flex flex-wrap gap-x-6 gap-y-2">
          {[
            { label: "Projecten", key: "projects" },
            { label: "Email", key: "email" },
            { label: "WhatsApp", key: "whatsapp" },
            { label: "Kennisbank", key: "knowledge" },
            { label: "Documenten", key: "documents" },
            { label: "Mensen", key: "people" },
            { label: "Activiteit", key: "activity" },
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

      {/* Add widget picker */}
      <AddWidgetPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onAdd={addWidget}
        addedTypes={widgets.map((w) => w.widget_type)}
      />
    </div>
  );
}