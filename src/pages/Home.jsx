import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { usePanel } from "@/lib/PanelContext";
import { WIDGETS } from "@/lib/widgetRegistry";
import { MODULE_FUNCTIONS } from "@/lib/moduleFunctions";
import { WidgetThemeProvider } from "@/lib/WidgetThemeContext";
import { IMAGES } from "@/lib/images";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Plus, Sparkles, RotateCcw } from "lucide-react";
import AddWidgetPicker from "@/components/panels/AddWidgetPicker";
import WidgetCell from "@/components/widgets/WidgetCell";
import MasonryGrid from "@/components/widgets/MasonryGrid";
import GiuliaIntroOverlay from "@/components/widgets/GiuliaIntroOverlay";
import ConciergeWidget from "@/components/concierge/ConciergeWidget";

import { Link } from "react-router-dom";
import { MODULES } from "@/lib/moduleRegistry";

const DEFAULT_WIDGETS = ["giulia", "goodmorning", "agenda", "tasks", "approvals", "email", "projects"];

/**
 * Home — a tidy, sorted bento grid. The user's chosen widgets persist and are
 * laid out cleanly on open; widgets that need attention right now (unread
 * messages, pending approvals, overdue tasks, new insights…) are surfaced
 * automatically. Giulia always leads.
 */
export default function Home() {
  const { activeModule, closeModule } = usePanel();
  const panelOpen = !!activeModule;
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const { toast } = useToast();

  const load = async () => {
    try {
      const [recs, events, tasks, approvals, emails, waMsgs, insights, agentMsgs, notifs, household, admin, hobbies, projects] = await Promise.all([
        base44.entities.DashboardWidget.list("position").catch(() => []),
        base44.entities.Event.list().catch(() => []),
        base44.entities.Task.list().catch(() => []),
        base44.entities.Approval.filter({ status: "pending" }).catch(() => []),
        base44.entities.Email.filter({ status: "unread" }).catch(() => []),
        base44.entities.WhatsAppMessage.filter({ direction: "received", status: "unread" }).catch(() => []),
        base44.entities.Insight.list("-created_date", 1).catch(() => []),
        base44.entities.Message.filter({ role: "giulia" }, "-created_date", 50).catch(() => []),
        base44.entities.Notification.filter({ status: "unread" }).catch(() => []),
        base44.entities.HouseholdItem.list("-updated_date", 200).catch(() => []),
        base44.entities.AdminObligation.filter({ status: "open" }).catch(() => []),
        base44.entities.Hobby.list("-last_activity_date").catch(() => []),
        base44.entities.Project.filter({ status: { $in: ["planning", "in_progress", "waiting", "review"] } }).catch(() => []),
      ]);

      const todayStr = new Date().toLocaleDateString("sv-SE");
      const agentToday = agentMsgs.filter((m) => (m.created_date || "").slice(0, 10) === todayStr);
      const in3 = new Date(Date.now() + 3 * 86400000).toLocaleDateString("sv-SE");
      const attention = {
        agenda: events.some((e) => (e.start || "").slice(0, 10) === todayStr),
        tasks: tasks.some((t) => t.status === "overdue" || t.status === "today"),
        approvals: approvals.length > 0,
        email: emails.length > 0,
        whatsapp: waMsgs.length > 0,
        insights: insights.length > 0,
        agentactivity: agentToday.length > 0,
        notifications: notifs.length > 0,
        household: household.some((h) => ["needs_attention", "due", "overdue"].includes(h.status)),
        personaladmin: admin.some((a) => a.status === "overdue" || (a.due_date && a.due_date <= in3)),
        hobbies: hobbies.some((h) => ["new", "reactivating", "emerging"].includes(h.activity_level)),
        projects: projects.some((p) => p.health === "critical" || p.health === "attention"),
      };

      let saved = recs && recs.length ? recs.filter((r) => r.visible !== false) : [];
      // Dedup "giulia" — never more than one Je dag widget
      const gRecs = saved.filter((w) => w.widget_type === "giulia");
      if (gRecs.length > 1) {
        const extras = new Set(gRecs.slice(1));
        extras.forEach((w) => base44.entities.DashboardWidget.delete(w.id).catch(() => {}));
        saved = saved.filter((w) => !extras.has(w));
      }
      if (!recs || recs.length === 0) {
        const urgent = ["giulia", ...Object.keys(attention).filter((k) => attention[k])];
        saved = await base44.entities.DashboardWidget.bulkCreate(
          urgent.map((t, i) => ({ widget_type: t, position: i, visible: true }))
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

      // Bij openen toont het dashboard alleen widgets met nieuwe info of oude
      // info die urgent werd. De vaste metgezel-widgets (giulia, goodmorning)
      // blijven altijd staan; al het andere wordt gefilterd op attention.
      const ALWAYS_SHOW = new Set(["giulia", "goodmorning"]);
      const visible = saved.filter((w) => ALWAYS_SHOW.has(w.widget_type) || attention[w.widget_type]);

      setWidgets(visible);
    } catch (e) {
      setWidgets([]);
    } finally {
      setLoading(false);
    }
  };

  // Reset — maak het dashboard helemaal schoon en zaai opnieuw in, zodat je
  // fris kunt starten en alles weer lekker loopt. Wist alle gepinde widgets,
  // zet de vaste standaardset terug en herlaadt.
  const reset = async () => {
    try {
      await base44.entities.DashboardWidget.deleteMany({}).catch(() => {});
      await base44.entities.DashboardWidget.bulkCreate(
        DEFAULT_WIDGETS.map((t, i) => ({ widget_type: t, position: i, visible: true }))
      ).catch(() => []);
    } catch { /* ignore */ }
    setResetKey((k) => k + 1);
    await load();
    toast({ title: "Dashboard gereset", description: "Standaardwidgets hersteld — frisse start." });
  };

  useEffect(() => {
    load();
    base44.auth.me().then((u) => setUserName(u?.full_name || "")).catch(() => {});
    // Opstart-procedure: bij reload (overlay overgeslagen) wekt startGiulia het OS
    // opnieuw. Bij eerste load doet de overlay (GiuliaIntroOverlay) de bang.
    if (sessionStorage.getItem("giulia_boot_seen")) {
      base44.functions.invoke("startGiulia", {}).catch(() => {});
    }
    // UPDATE-sleutel: bij elke reload het dashboard syncen met de nieuwste
    // kennis/geheugen — Giulia synthetiseert de actuele staat tot één inzicht.
    // Throttle 4 min via sessionStorage zodat navigeren niet spamt.
    const last = Number(sessionStorage.getItem("giulia_last_refresh") || 0);
    if (Date.now() - last > 4 * 60 * 1000) {
      sessionStorage.setItem("giulia_last_refresh", String(Date.now()));
      base44.functions.invoke("refreshDashboard", {}).then(() => load()).catch(() => {});
    }
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

  const WIDGET_SPAN = { giulia: 2, goodmorning: 2, concierge: 2, projects: 2, agenda: 2, email: 2, documents: 2, updates: 2, household: 2 };
  const cells = sorted.map((w) => {
    const def = WIDGETS[w.widget_type];
    if (!def) return null;
    if (w.widget_type === "concierge") return { node: <ConciergeWidget key={w.id} onRemove={() => removeWidget(w.id)} />, span: 2 };
    return { node: <WidgetCell key={w.id} def={def} widget={w} onRemove={() => removeWidget(w.id)} onThemeChange={setWidgetTheme} />, span: WIDGET_SPAN[w.widget_type] || 1 };
  }).filter(Boolean);

  return (
    <div className="relative -mx-5 lg:-mx-10 -my-6 lg:-mt-8 lg:mb-0 min-h-[calc(100svh-3.5rem)] lg:min-h-[calc(100svh-9.5rem)] overflow-hidden">
      {/* Fixed action buttons — truly viewport-fixed (kept out of the transformed
          content layer so they never scroll away). */}
      <div className="fixed top-20 right-6 lg:right-10 z-40 flex items-center gap-2">
        <button
          onClick={reset}
          title="Ververs alle widgets en data"
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

      {/* Photo — ONE home background image that transforms when a panel opens.
          Desktop: glides from the right side (closed) to the bottom-left corner
          (open), keeping the same image so it reads as a transform — not a new
          photo entering from another side. Stays the same size as before on open. */}
      <div
        className={cn(
          "hidden lg:block fixed z-0 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[left,right,top]",
          panelOpen
            ? "left-[16%] right-[12%] top-[40vh] bottom-0 rounded-[28px]"
            : "left-[42%] right-0 top-0 bottom-0 rounded-l-[32px]"
        )}
      >
        <img src={IMAGES.feetChair} alt="" className="h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-charcoal/10 to-transparent" />
      </div>

      {/* Photo — mobile editorial card (closed), sits lower so the greeting breathes above it */}
      <div
        className={cn(
          "lg:hidden fixed top-[26vh] left-3 right-3 h-[40vh] overflow-hidden z-0 rounded-[28px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.35)]",
          panelOpen ? "opacity-0 translate-y-6 pointer-events-none" : "opacity-100"
        )}
      >
        <img src={IMAGES.feetChair} alt="" className="h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/5 via-transparent to-charcoal/35" />
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

      {/* Panel name + function links — where the greeting sits, shown when a panel is open */}
      <div className={cn("hidden lg:block fixed top-24 left-10 z-50 max-w-[34rem] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]", panelOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none")}>
        <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/70 mb-3 font-semibold">
          {new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="text-5xl lg:text-6xl font-display font-semibold tracking-[-0.02em] leading-[1.0] text-foreground mb-5">
          {MODULES[activeModule]?.label}
        </h1>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5">
          {(MODULE_FUNCTIONS[activeModule] || []).map((f) => (
            <Link key={f.label} to={f.to} onClick={() => closeModule()} className="text-sm text-foreground/70 hover:text-foreground transition-colors underline underline-offset-4 decoration-foreground/20">
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Floating widget — the active module's widget, left of the panel over the photo's left side */}
      {panelOpen && WIDGETS[activeModule] && (() => { const W = WIDGETS[activeModule].Component; return (
        <div className="hidden lg:block fixed left-10 bottom-[5.5rem] z-20 w-[560px] animate-fade-up">
          <WidgetThemeProvider value={{ theme: "glass", color: "", opacity: 1, blur: 0 }}>
            <W />
          </WidgetThemeProvider>
        </div>
      ); })()}

      {/* Content */}
      <div
        className={cn(
          "relative z-10 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform pt-[6vh] lg:pt-0",
          panelOpen ? "translate-x-[100vw] opacity-0" : "translate-x-0 opacity-100"
        )}
      >
        <header className="px-5 lg:px-10 pt-8 lg:pt-10 pb-6 lg:pb-6 flex flex-col gap-5 lg:shrink-0">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-foreground/10">
            <div className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-olive animate-pulse-soft" />
              <span className="text-[10px] uppercase tracking-[0.34em] font-bold text-foreground/70">GIULIA · OS</span>
            </div>
            <span className="text-[10px] font-mono text-foreground/45 tabular-nums tracking-wide uppercase">
              {new Date().toLocaleDateString("nl-NL", { weekday: "short", day: "2-digit", month: "short" })}
            </span>
          </div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-[44px] sm:text-6xl lg:text-[68px] font-display font-semibold tracking-[-0.025em] leading-[0.98] text-foreground text-balance">
                {greeting}.
              </h1>
              <p className="mt-3 text-[11px] uppercase tracking-[0.24em] font-semibold text-foreground/45">
                {loading ? "Laden…" : widgets.length ? `${widgets.length} onderdelen op je dashboard` : "Je dashboard is leeg"}
              </p>
            </div>
          </div>
        </header>

        {/* Tidy sorted bento grid */}
        <div className="px-5 lg:px-10 pb-10 lg:pb-0">
          {loading ? (
            <div className="max-w-[1280px] columns-1 sm:columns-2 lg:columns-4 xl:columns-5 gap-3 lg:gap-4">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="relative mb-3 lg:mb-4 break-inside-avoid h-[220px] rounded-[24px] shimmer overflow-hidden">
                  <span className="absolute inset-x-0 top-0 h-[3px] bg-foreground/15" />
                </div>
              ))}
            </div>
          ) : sorted.length > 0 ? (
            <MasonryGrid key={resetKey} className="max-w-[1280px]" gap={16} spans={cells.map((c) => c.span)} scale={0.9}>
              {cells.map((c) => c.node)}
            </MasonryGrid>
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

      <GiuliaIntroOverlay />

      <AddWidgetPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onAdd={addWidget}
        addedTypes={widgets.map((w) => w.widget_type)}
      />
    </div>
  );
}