import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PageShell, GlassButton, Divider, SectionHeader } from "@/components/slick/glass";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Instellingen() {
  const [prefs, setPrefs] = useState({ notif: true, weekmail: false, geluid: true, compact: false, autosave: true, donker: true });
  const [name, setName] = useState("Giulia Romano");
  const [email, setEmail] = useState("giulia@studio.it");
  const set = (k) => setPrefs((p) => ({ ...p, [k]: !p[k] }));

  const TOGGLES = [
    { key: "notif", label: "Push notificaties", desc: "Herinneringen voor afspraken en deadlines" },
    { key: "weekmail", label: "Wekelijkse e-mail", desc: "Overzicht van je week elke zondag" },
    { key: "geluid", label: "Geluidssignalen", desc: "Piepje bij voltooide taak" },
    { key: "compact", label: "Compacte weergave", desc: "Minder ruimte tussen elementen" },
    { key: "autosave", label: "Automatisch opslaan", desc: "Notities direct bewaren" },
    { key: "donker", label: "Donker thema", desc: "Donkere glas-stijl als standaard" },
  ];

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-marble/50 text-xs">Account</p>
          <h1 className="text-storm text-2xl sm:text-3xl font-bold tracking-tight">Instellingen</h1>
        </div>
        <Link to="/slick"><GlassButton className="px-4 py-2 text-storm text-sm">← Terug</GlassButton></Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-marble/20 bg-marble/5 p-6">
          <SectionHeader number={1} title="Profiel" />
          <div className="mt-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-metal border border-marble/30 flex items-center justify-center text-marble text-xl font-medium">GR</div>
            <div className="flex-1">
              <p className="text-storm text-sm font-medium">{name}</p>
              <p className="text-marble/50 text-xs">Beheerder</p>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            <div>
              <Label className="text-marble/60 text-xs">Naam</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 bg-marble/10 border-marble/30 text-storm" />
            </div>
            <div>
              <Label className="text-marble/60 text-xs">E-mail</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 bg-marble/10 border-marble/30 text-storm" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-marble/20 bg-marble/5 p-6">
          <SectionHeader number={2} title="Voorkeuren" />
          <div className="mt-4 flex flex-col divide-y divide-marble/15">
            {TOGGLES.map((t) => (
              <div key={t.key} className="flex items-center justify-between py-3.5">
                <div>
                  <p className="text-storm text-sm">{t.label}</p>
                  <p className="text-marble/50 text-xs">{t.desc}</p>
                </div>
                <Switch checked={prefs[t.key]} onCheckedChange={() => set(t.key)} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <Divider className="my-6" />
      <div className="flex justify-end gap-2">
        <GlassButton className="px-5 py-2.5 text-storm text-sm">Annuleren</GlassButton>
        <button className="px-6 py-2.5 rounded-full bg-urgent text-metal text-sm font-semibold hover:brightness-105 active:scale-95 transition-all">Opslaan</button>
      </div>
    </PageShell>
  );
}