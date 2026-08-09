import React, { useEffect, useState } from "react";
import { Reorder } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { usePanel } from "@/lib/PanelContext";
import { WIDGETS } from "@/lib/widgetRegistry";
import { IMAGES } from "@/lib/images";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import AddWidgetPicker from "@/components/panels/AddWidgetPicker";
import DraggableCell from "@/components/widgets/DraggableCell";

const DEFAULT_WIDGETS = ["giuliaHero", "giulia", "agenda", "tasks", "approvals", "email", "projects"];

const DESKTOP_SPAN = { 3: "lg:col-span-3", 4: "lg:col-span-4", 5: "lg:col-span-5", 6: "lg:col-span-6", 8: "lg:col-span-8" };
const MOBILE_SPAN = {
  giulia: "col-span-2 row-span-2",
  giuliaHero: "col-span-1 row-span-2",
  activity: "col-span-2",
  projects: "col-span-2",
  insights: "col-span-2",
};

/**
 * Home — a draggable, exciting dashboard. Widgets are reorderable by dragging
 * the grip pill (order persists). On mobile the grid is a single fixed screen:
 * every widget is visible, no scrolling — tiles shrink to fit the viewport.
 * Giulia leads with a tall 9:16 hero + the daily briefing.
 */
export default function Home() {
  const { activeModule, openModule } = usePanel();
  const panelOpen = !!activeModule;
  const [widgets, setWidgets] = useState([]);
  const [order, setOrder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const { toast } = useToast();

  const load = async () => {
    try {
      const [recs, events, tasks, approvals, emails, waMsgs, insights] = await Promise.all([
        base44.entities.DashboardWidget.list("position").catch(() => []),
        base44.entities.Event.list().catch(() => []),
        base44.entities.Task.list().catch(() => []),
        base44.entities.Approval.filter({ status: "pending" }).catch(() => []),
        base44.entities.Email.filter({ status: "unread" }).catch(() => []),
        base44.entities.WhatsAppMessage.filter({ direction: "received", status: "unread" }).catch(() => []),
        base44.entities.Insight.list("-created_date", 1).catch(() => []),
      ]);

      const todayStr = new Date().toLocaleDateString("sv-SE");
      const attention = {
        agenda: events.some((e) => (e.start || "").slice(0, 10) === todayStr),
        tasks: tasks.some((t) => t.status === "overdue" || t.status === "today"),
        approvals: approvals.length > 0,
        email: emails.length > 0,
        whatsapp: waMsgs.length > 0,
        insights: insights.length > 0,
      };

      let saved = recs && recs.length ? recs.filter((r) => r.visible !== false) : [];
      if (!recs || recs.length === 0) {
        saved = await base44.entities.DashboardWidget.bulkCreate(
          DEFAULT_WIDGETS.map((t, i) => ({ widget_type: t, position: i, visible: true }))
        );
      }

      // Ensure the Giulia hero widget is present
      if (!saved.some((w) => w.widget_type === "giuliaHero")) {
        const rec = await base44.entities.DashboardWidget.create({ widget_type: "giuliaHero", position: -1, visible: true });
        saved = [rec, ...saved];
      }

      const existingTypes = new Set(saved.map((w) => w.widget_type));
      const toAdd = Object.keys(attention).filter((k) => attention[k] && !existingTypes.has(k));
      if (toAdd.length) {
        const created = await base44.entities.DashboardWidget.bulkCreate(
          toAdd.map((t, i) => ({ widget_type: t, position: saved.length + i, visible: true }))
        );
        saved = [...saved, ...created];
      }

      setWidgets(saved);
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

  useEffect(() => {
    const sorted = [...widgets].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    setOrder(sorted.map((w) => w.id));
  }, [widgets]);

  const removeWidget = async (id) => {
    setWidgets((w) => w.filter((x) => x.id !== id));
    setOrder((o) => o.filter((x) => x !== id));
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
      const rec = await base44.entities.DashboardWidget.create({ widget_type: type, position: widgets.length, visible: true });
      setWidgets([...widgets, rec]);
      setPickerOpen(false);
      toast({ title: "Widget toegevoegd", description: WIDGETS[type]?.label });
    } catch (e) {
      toast({ title: "Toevoegen mislukt", variant: "destructive" });
    }
  };

  const onReorder = (newOrder) => {
    setOrder(newOrder);
    const updates = newOrder.map((id, i) => ({ id, position: i }));
    base44.entities.DashboardWidget.bulkUpdate(updates).catch(() => {});
  };

  const hour = new Date().getHours();
  const greetWord = hour < 12 ? "Goedemorgen" : hour < 18 ? "Goedemiddag" : "Goedenavond";
  const rawFirst = userName ? userName.split(" ")[0] : "";
  const displayName = rawFirst === "Salvatore" ? "Salvo" : rawFirst || "Salvo";
  const greeting = `${greetWord}, ${displayName}`;

  return (
    <div className="relative -mx-5 lg:-mx-10 -my-6 lg:-my-8 h-[calc(100svh-7.5rem)] lg:h-auto lg:min-h-[calc(100svh-3.5rem)] overflow-hidden">
      {/* Desktop photo backdrop */}
      <div
        className={cn(
          "hidden lg:block fixed top-14 right-0 bottom-0 w-[58%] overflow-hidden z-0 lg:rounded-l-[32px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          panelOpen ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
        )}
      >
        <img src={IMAGES.feetChair} alt="" className="h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-storm/25" />
      </div>

      {/* Mobile soft gradient backdrop (fixed screen, no photo banner) */}
      <div className="lg:hidden fixed inset-0 -z-10 bg-gradient-to-b from-stone via-background to-stone" />

      {/* Desktop small photo when a panel opens */}
      <div
        className={cn(
          "hidden lg:block fixed left-4 bottom-4 z-0 w-[30%] h-[28vh] overflow-hidden rounded-[24px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          panelOpen ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
        )}
      >
        <img src={IMAGES.feetChair} alt="" className="h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-tr from-charcoal/45 to-transparent" />
      </div>

      <div
        className={cn(
          "relative z-10 h-full lg:h-auto flex flex-col transition-all duration-700 will-change-transform",
          panelOpen ? "translate-x-[100vw] opacity-0" : "translate-x-0 opacity-100"
        )}
      >
        {/* Desktop greeting + add */}
        <header className="hidden lg:flex px-10 pt-10 pb-8 items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/80 mb-3 font-semibold">
              {new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h1 className="text-5xl lg:text-6xl font-display font-semibold tracking-[-0.02em] leading-[1.0] text-foreground text-balance">
              {greeting}.
            </h1>
          </div>
          <button
            onClick={() => setPickerOpen(true)}
            className="shrink-0 inline-flex items-center gap-2 rounded-full glass-1 px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-foreground/5 transition"
          >
            <Plus className="h-4 w-4" /> Widget
          </button>
        </header>

        {/* Draggable grid — fixed full-screen on mobile */}
        <div className="flex-1 min-h-0 px-5 lg:px-10 pb-4 lg:pb-10 lg:flex-none">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-12 gap-2.5 lg:gap-5 h-full lg:h-auto">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="col-span-1 lg:col-span-4 h-full lg:h-[240px] rounded-[24px] shimmer" />
              ))}
            </div>
          ) : order.length > 0 ? (
            <Reorder.Group
              axis="y"
              values={order}
              onReorder={onReorder}
              className="dash-grid grid grid-cols-2 lg:grid-cols-12 gap-2.5 lg:gap-5 auto-rows-fr lg:auto-rows-auto h-full lg:h-auto overflow-hidden lg:overflow-visible"
            >
              {order.map((id) => {
                const w = widgets.find((x) => x.id === id);
                if (!w) return null;
                const def = WIDGETS[w.widget_type];
                if (!def) return null;
                const span = cn(MOBILE_SPAN[w.widget_type] || "col-span-1", DESKTOP_SPAN[def.span] || "lg:col-span-4", "lg:row-span-1");
                return <DraggableCell key={w.id} widget={w} def={def} className={span} onRemove={() => removeWidget(w.id)} />;
              })}
            </Reorder.Group>
          ) : (
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
      </div>

      {/* Mobile floating add */}
      <button
        onClick={() => setPickerOpen(true)}
        className="lg:hidden fixed right-4 top-16 z-30 h-10 w-10 rounded-full bg-charcoal text-ivory shadow-lg flex items-center justify-center"
        aria-label="Widget toevoegen"
      >
        <Plus className="h-5 w-5" />
      </button>

      <AddWidgetPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onAdd={addWidget}
        addedTypes={widgets.map((w) => w.widget_type)}
      />
    </div>
  );
}