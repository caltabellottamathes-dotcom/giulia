import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { usePanel } from "@/lib/PanelContext";
import { WIDGETS } from "@/lib/widgetRegistry";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import AddWidgetPicker from "@/components/panels/AddWidgetPicker";
import DesktopCanvas from "@/components/dashboard/DesktopCanvas";
import MobileDashboard from "@/components/dashboard/MobileDashboard";

const DEFAULT_WIDGETS = ["giuliaHero", "giulia", "agenda", "tasks", "approvals", "email"];

/**
 * Home — the OS surface. Desktop renders a free, overlapping draggable canvas;
 * mobile renders a single fixed screen with all widgets visible (no scroll).
 */
export default function Home() {
  const { activeModule } = usePanel();
  const panelOpen = !!activeModule;
  const isMobile = useIsMobile();
  const [widgets, setWidgets] = useState([]);
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
      const rec = await base44.entities.DashboardWidget.create({ widget_type: type, position: widgets.length, visible: true });
      setWidgets([...widgets, rec]);
      setPickerOpen(false);
      toast({ title: "Widget toegevoegd", description: WIDGETS[type]?.label });
    } catch (e) {
      toast({ title: "Toevoegen mislukt", variant: "destructive" });
    }
  };

  const onReorder = (newOrder) => {
    const updates = newOrder.map((id, i) => ({ id, position: i }));
    base44.entities.DashboardWidget.bulkUpdate(updates).catch(() => {});
    // reflect locally so MobileDashboard order stays correct without reload
    setWidgets((prev) => {
      const map = new Map(prev.map((w) => [w.id, w]));
      return newOrder.map((id, i) => ({ ...map.get(id), position: i })).filter(Boolean);
    });
  };

  const onMove = (id, x, y) => {
    base44.entities.DashboardWidget.update(id, { x: Math.round(x), y: Math.round(y) }).catch(() => {});
  };

  if (loading || isMobile === undefined) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-12 gap-2.5 lg:gap-5 p-4 lg:p-10 h-[calc(100svh-3.5rem)]">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="col-span-1 lg:col-span-4 h-full rounded-[24px] shimmer" />
        ))}
      </div>
    );
  }

  return (
    <>
      {isMobile ? (
        <MobileDashboard widgets={widgets} onReorder={onReorder} onRemove={removeWidget} />
      ) : (
        <DesktopCanvas
          widgets={widgets}
          onRemove={removeWidget}
          onMove={onMove}
          onAdd={() => setPickerOpen(true)}
          userName={userName}
          panelOpen={panelOpen}
        />
      )}

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
    </>
  );
}