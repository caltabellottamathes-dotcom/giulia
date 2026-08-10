import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { usePanel } from "@/lib/PanelContext";
import { WIDGETS } from "@/lib/widgetRegistry";
import { IMAGES } from "@/lib/images";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import AddWidgetPicker from "@/components/panels/AddWidgetPicker";
import WidgetCell from "@/components/widgets/WidgetCell";
import GiuliaIntroOverlay from "@/components/widgets/GiuliaIntroOverlay";
import { Link } from "react-router-dom";
import { MODULES } from "@/lib/moduleRegistry";

const PAGE_LINKS = [
  { label: "Agenda", to: "/agenda" },
  { label: "Projecten", to: "/projects" },
  { label: "Taken", to: "/tasks" },
  { label: "Email", to: "/email" },
  { label: "WhatsApp", to: "/whatsapp" },
  { label: "Kennisbank", to: "/knowledge" },
  { label: "Documenten", to: "/documents" },
  { label: "Mensen", to: "/people" },
  { label: "Inzichten", to: "/insights" },
  { label: "Backdesk", to: "/settings" },
];

const DEFAULT_WIDGETS = ["giulia", "agenda", "tasks", "approvals", "email", "projects"];

const SPAN_COL = {
  3: "lg:col-span-3",
  4: "lg:col-span-3",
  5: "lg:col-span-4",
  6: "lg:col-span-4",
  8: "lg:col-span-6",
};

/**
 * Home — a tidy, sorted bento grid. The user's chosen widgets persist and are
 * laid out cleanly on open; widgets that need attention right now (unread
 * messages, pending approvals, overdue tasks, new insights…) are surfaced
 * automatically. Giulia always leads.
 */
export default function Home() {
  const { activeModule } = usePanel();
  const panelOpen = !!activeModule;
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const { toast } = useToast();

  const load = async () => {
    try {
      const [recs, events, tasks, approvals, emails, waMsgs, insights, agentMsgs] = await Promise.all([
        base44.entities.DashboardWidget.list("position").catch(() => []),
        base44.entities.Event.list().catch(() => []),
        base44.entities.Task.list().catch(() => []),
        base44.entities.Approval.filter({ status: "pending" }).catch(() => []),
        base44.entities.Email.filter({ status: "unread" }).catch(() => []),
        base44.entities.WhatsAppMessage.filter({ direction: "received", status: "unread" }).catch(() => []),
        base44.entities.Insight.list("-created_date", 1).catch(() => []),
        base44.entities.Message.filter({ role: "giulia" }, "-created_date", 50).catch(() => []),
      ]);

      const todayStr = new Date().toLocaleDateString("sv-SE");
      const agentToday = agentMsgs.filter((m) => (m.created_date || "").slice(0, 10) === todayStr);
      const attention = {
        agenda: events.some((e) => (e.start || "").slice(0, 10) === todayStr),
        tasks: tasks.some((t) => t.status === "overdue" || t.status === "today"),
        approvals: approvals.length > 0,
        email: emails.length > 0,
        whatsapp: waMsgs.length > 0,
        insights: insights.length > 0,
        agentactivity: agentToday.length > 0,
      };

      let saved = recs && recs.length ? recs.filter((r) => r.visible !== false) : [];
      if (!recs || recs.length === 0) {
        saved = await base44.entities.DashboardWidget.bulkCreate(
          DEFAULT_WIDGETS.map((t, i) => ({ widget_type: t, position: i, visible: true }))
        );
      }

      // Surface attention widgets the user hasn't pinned yet
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

  const setWidgetTheme = (id, patch) => {
    setWidgets((ws) => ws.map((w) => (w.id === id ? { ...w, ...patch } : w)));
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
  const greetWord = hour < 12 ? "Goedemorgen" : hour < 18 ? "Goedemiddag" : "Goedenavond";
  const rawFirst = userName ? userName.split(" ")[0] : "";
  const displayName = rawFirst === "Salvatore" ? "Salvo" : rawFirst || "Salvo";
  const greeting = `${greetWord}, ${displayName}`;

  const sorted = [...widgets].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  return (
    <div className="relative -mx-5 lg:-mx-10 -my-6 lg:-my-8 min-h-[calc(100svh-3.5rem)] overflow-hidden">
      <GiuliaIntroOverlay />
      {/* Photo — ONE home background image that transforms when a panel opens.
          Desktop: glides from the right side (closed) to the bottom-left corner
          (open), keeping the same image so it reads as a transform — not a new
          photo entering from another side. Stays the same size as before on open. */}
      <div
        className={cn(
          "hidden lg:block fixed z-0 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[left,right,top]",
          panelOpen
            ? "left-[24%] right-[14%] top-[40vh] bottom-0 rounded-[28px]"
            : "left-[42%] right-0 top-14 bottom-0 rounded-l-[32px]"
        )}
      >
        <img src={IMAGES.feetChair} alt="" className="h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-charcoal/10 to-transparent" />
      </div>

      {/* Photo — mobile banner (closed) */}
      <div
        className={cn(
          "lg:hidden fixed top-14 left-0 right-0 h-[26vh] overflow-hidden z-0 rounded-b-[28px] transition-all duration-700",
          panelOpen ? "opacity-0 -translate-y-4 pointer-events-none" : "opacity-100"
        )}
      >
        <img src={IMAGES.feetChair} alt="" className="h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/10 to-background/25" />
      </div>

      {/* Photo — mobile bottom card (open) */}
      <div
        className={cn(
          "lg:hidden fixed left-0 bottom-0 z-0 w-full h-[40vh] overflow-hidden rounded-t-[28px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          panelOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"
        )}
      >
        <img src={IMAGES.feetChair} alt="" className="h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/35 to-transparent" />
      </div>

      {/* Panel name — top-left corner when a panel is open */}
      <div className={cn("hidden lg:block fixed top-8 left-10 z-20 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]", panelOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none")}>
        <p className="text-[11px] uppercase tracking-[0.3em] text-foreground/60 font-semibold">{MODULES[activeModule]?.label}</p>
      </div>

      {/* Content */}
      <div
        className={cn(
          "relative z-10 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform pt-[26vh] lg:pt-0",
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
            className="shrink-0 inline-flex items-center gap-2 rounded-full glass-1 px-4 py-2.5 text-xs font-semibold text-ivory hover:bg-ivory/10 transition"
          >
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Widget</span>
          </button>
        </header>

        {/* Tidy sorted bento grid */}
        <div className="px-5 lg:px-10 pb-10 lg:pl-[36%]">
          {loading ? (
            <div className="grid grid-cols-12 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="col-span-12 md:col-span-6 lg:col-span-4 h-[240px] rounded-[24px] shimmer" />
              ))}
            </div>
          ) : sorted.length > 0 ? (
            <div className="grid grid-cols-12 gap-3 lg:gap-4 auto-rows-auto">
              {sorted.map((w) => {
                const def = WIDGETS[w.widget_type];
                if (!def) return null;
                return (
                  <div key={w.id} className={cn("col-span-12 md:col-span-6 scale-95 origin-top-left", SPAN_COL[def.span] || "lg:col-span-4")}>
                    <WidgetCell def={def} widget={w} onRemove={() => removeWidget(w.id)} onThemeChange={setWidgetTheme} />
                  </div>
                );
              })}
            </div>
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

      {/* Fixed bottom word-links — stay on the background, navigate to pages */}
      <nav className="hidden lg:flex fixed bottom-5 left-10 right-10 z-10 flex-wrap gap-x-6 gap-y-2">
        {PAGE_LINKS.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="text-[12px] text-foreground/75 hover:text-foreground transition-colors tracking-wide font-medium"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <AddWidgetPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onAdd={addWidget}
        addedTypes={widgets.map((w) => w.widget_type)}
      />
    </div>
  );
}