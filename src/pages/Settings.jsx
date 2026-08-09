import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import GlassPanel from "@/components/glass/GlassPanel";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import {
  Settings as SettingsIcon, Palette, Bell, Brain, Lock, Mic,
  Database, Zap, Plug, Bot,
} from "lucide-react";

const sections = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "ai", label: "AI behavior", icon: Brain },
  { id: "privacy", label: "Privacy", icon: Lock },
  { id: "voice", label: "Voice", icon: Mic },
  { id: "memory", label: "Memory", icon: Database },
  { id: "automation", label: "Automation", icon: Zap },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "agents", label: "Agents", icon: Bot },
];

const NOTIF_KEYS = ["Email notificaties", "WhatsApp notificaties", "Agenda herinneringen", "Giulia suggesties", "Goedkeuring verzoeken"];
const AUTO_KEYS = ["Informatie structureren", "Interne taak voorstellen", "Samenvatting maken", "Kennis organiseren"];
const THEMES = ["Light", "Smoked", "Dark"];
const PROACTIVITY = ["Subtiel", "Gebalanceerd", "Actief"];
const VOICES = ["River — kalm, neutraal", "Honey — warm, zacht", "Sunny — helder, opgewekt"];

const AGENTS = [
  { name: "interpretInput", cadence: "Bij elk nieuw bericht" },
  { name: "syncCalendar", cadence: "Elke 15 min" },
  { name: "manageCommunication", cadence: "Elke 15 min" },
  { name: "manageTasks", cadence: "Elke 30 min" },
  { name: "runProactivity", cadence: "Elke 30 min" },
  { name: "dailyPlanning", cadence: "Dagelijks 07:00" },
  { name: "manageProjects", cadence: "Dagelijks 09:00" },
  { name: "managePeople", cadence: "Dagelijks 09:00" },
  { name: "manageFiles", cadence: "Dagelijks 10:00" },
  { name: "manageIdeas", cadence: "Zondag 17:00" },
  { name: "weeklyPlanning", cadence: "Zondag 18:00" },
  { name: "weekReview", cadence: "Vrijdag 17:00" },
];

export default function Settings() {
  const [active, setActive] = useState("general");
  const [prefs, setPrefs] = useState({
    language: "Nederlands",
    timezone: "Europe/Amsterdam",
    theme: "Light",
    glass: 60,
    proactivity: "Gebalanceerd",
    voice: VOICES[0],
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",
    notifications: Object.fromEntries(NOTIF_KEYS.map((k) => [k, true])),
    autoApprove: Object.fromEntries(AUTO_KEYS.map((k) => [k, true])),
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    base44.auth.me().then((u) => {
      if (u?.settings) setPrefs((p) => ({ ...p, ...u.settings }));
    }).catch(() => {});
  }, []);

  const set = (k, v) => setPrefs((p) => ({ ...p, [k]: v }));
  const toggle = (group, key) => setPrefs((p) => ({ ...p, [group]: { ...p[group], [key]: !p[group][key] } }));

  const save = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ settings: prefs });
      toast({ title: "Opgeslagen", description: "Je voorkeuren zijn bijgewerkt." });
    } catch {
      toast({ title: "Opslaan mislukt", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-heading font-light tracking-tight">Backdesk</h1>
        <p className="text-sm text-muted-foreground mt-1">Configureer jouw Giulia ervaring</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-1">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all",
                active === s.id ? "glass-1 text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03]"
              )}
            >
              <s.icon className="h-4 w-4 shrink-0" /> {s.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          <GlassPanel level={2} className="p-6 lg:p-8">
            {active === "general" && (
              <div className="space-y-6">
                <h2 className="text-lg font-heading font-medium">General</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Taal</label>
                    <select value={prefs.language} onChange={(e) => set("language", e.target.value)} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none">
                      <option>Nederlands</option>
                      <option>English</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tijdzone</label>
                    <select value={prefs.timezone} onChange={(e) => set("timezone", e.target.value)} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none">
                      <option>UTC</option>
                      <option>Europe/Amsterdam</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {active === "appearance" && (
              <div className="space-y-6">
                <h2 className="text-lg font-heading font-medium">Appearance</h2>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Thema</label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {THEMES.map((theme) => (
                      <button
                        key={theme}
                        onClick={() => set("theme", theme)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all text-sm",
                          prefs.theme === theme ? "border-olive bg-olive/5" : "border-border/60 glass-1 hover:border-foreground/20"
                        )}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Glass intensiteit</label>
                  <input type="range" min="0" max="100" value={prefs.glass} onChange={(e) => set("glass", Number(e.target.value))} className="w-full mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">{prefs.glass}%</p>
                </div>
              </div>
            )}

            {active === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-lg font-heading font-medium">Notifications</h2>
                <div className="space-y-3">
                  {NOTIF_KEYS.map((item) => (
                    <div key={item} className="flex items-center justify-between p-3 glass-1 rounded-xl">
                      <span className="text-sm">{item}</span>
                      <button
                        onClick={() => toggle("notifications", item)}
                        className={cn("h-6 w-11 rounded-full relative transition-colors", prefs.notifications[item] ? "bg-olive" : "bg-foreground/15")}
                        aria-label={item}
                      >
                        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", prefs.notifications[item] ? "left-[22px]" : "left-0.5")} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {active === "ai" && (
              <div className="space-y-6">
                <h2 className="text-lg font-heading font-medium">AI behavior</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Proactiviteit niveau</label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {PROACTIVITY.map((level) => (
                        <button
                          key={level}
                          onClick={() => set("proactivity", level)}
                          className={cn("p-3 rounded-xl text-sm transition-all", prefs.proactivity === level ? "bg-foreground text-background font-medium" : "glass-1 text-muted-foreground hover:text-foreground")}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="glass-1 rounded-xl p-4">
                    <p className="text-sm font-medium mb-2">Automatisch goedkeuren</p>
                    <p className="text-xs text-muted-foreground mb-3">Giulia mag deze acties zonder goedkeuring uitvoeren:</p>
                    <div className="space-y-2">
                      {AUTO_KEYS.map((item) => (
                        <label key={item} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" checked={!!prefs.autoApprove[item]} onChange={() => toggle("autoApprove", item)} className="rounded" /> {item}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {active === "privacy" && (
              <div className="space-y-6">
                <h2 className="text-lg font-heading font-medium">Privacy</h2>
                <div className="glass-1 rounded-xl p-4 space-y-3">
                  <p className="text-sm">Uw gegevens zijn beveiligd</p>
                  <p className="text-xs text-muted-foreground">Giulia beschermt uw privacy. Alle data blijft lokaal en versleuteld.</p>
                </div>
              </div>
            )}

            {active === "voice" && (
              <div className="space-y-6">
                <h2 className="text-lg font-heading font-medium">Voice</h2>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Stem</label>
                  <select value={prefs.voice} onChange={(e) => set("voice", e.target.value)} className="w-full mt-1.5 glass-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none">
                    {VOICES.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>
            )}

            {active === "agents" && (
              <div className="space-y-6">
                <h2 className="text-lg font-heading font-medium">Agents & automatisering</h2>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Stille uren</p>
                  <div className="flex items-center gap-3">
                    <input type="time" value={prefs.quietHoursStart} onChange={(e) => set("quietHoursStart", e.target.value)} className="glass-1 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                    <span className="text-sm text-muted-foreground">tot</span>
                    <input type="time" value={prefs.quietHoursEnd} onChange={(e) => set("quietHoursEnd", e.target.value)} className="glass-1 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Kanalen</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[["Google Calendar", "actief"], ["Gmail", "actief"], ["Google Drive", "actief"], ["WhatsApp", "actief"]].map(([n, s]) => (
                      <div key={n} className="glass-1 rounded-xl p-3 flex items-center justify-between">
                        <span className="text-sm">{n}</span>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-olive">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Agents ({AGENTS.length})</p>
                  <div className="space-y-1.5">
                    {AGENTS.map((a) => (
                      <div key={a.name} className="glass-1 rounded-xl px-3 py-2 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{a.name}</p>
                          <p className="text-[11px] text-muted-foreground">{a.cadence}</p>
                        </div>
                        <span className="h-2 w-2 rounded-full bg-olive" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {["memory", "automation", "integrations"].includes(active) && (
              <div className="space-y-6">
                <h2 className="text-lg font-heading font-medium capitalize">{active}</h2>
                <p className="text-sm text-muted-foreground">Configuratie opties voor {active} — binnenkort beschikbaar.</p>
              </div>
            )}

            <div className="pt-6 border-t border-border/40 mt-6">
              <button
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {saving ? "Opslaan…" : "Wijzigingen opslaan"}
              </button>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}