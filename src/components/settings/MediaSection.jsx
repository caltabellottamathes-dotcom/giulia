import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Image } from "@/components/ui/image";
import { useImageOverrides } from "@/lib/useImageOverrides";
import { HERO_IMG } from "@/components/glass/PageHero";
import { IMAGES, brandGallery, editorialImages } from "@/lib/images";
import { Library } from "lucide-react";

const SLOTS = [
  { key: "agenda", label: "Agenda" },
  { key: "planning", label: "Planning" },
  { key: "projects", label: "Projecten" },
  { key: "tasks", label: "Taken" },
  { key: "email", label: "Email" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "knowledge", label: "Kennis" },
  { key: "documents", label: "Documenten" },
  { key: "people", label: "Mensen" },
  { key: "approvals", label: "Goedkeuringen" },
  { key: "insights", label: "Inzichten" },
  { key: "memory", label: "Geheugen" },
  { key: "activity", label: "Activiteit" },
  { key: "chat", label: "Chat" },
  { key: "voice", label: "Voice" },
  { key: "integrations", label: "Integraties" },
  { key: "settings", label: "Backdesk" },
  { key: "profile", label: "Profiel" },
  { key: "experiment", label: "Experiment", def: IMAGES.feetChair },
];

const LIBRARY = Array.from(new Set([...brandGallery, ...editorialImages, ...Object.values(IMAGES)]));

export default function MediaSection() {
  const { overrides, setOverride } = useImageOverrides();
  const [picker, setPicker] = useState(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-heading font-medium">Media</h2>
        <p className="text-xs text-muted-foreground mt-1">Plak een URL of kies uit je bibliotheek om de foto op een pagina te wijzigen. Geen credits nodig.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SLOTS.map((s) => {
          const def = s.def || HERO_IMG[s.key] || IMAGES.walkingChairs;
          const cur = overrides[s.key] || def;
          return (
            <div key={s.key} className="glass-1 rounded-xl p-3 flex gap-3">
              <div className="h-16 w-20 rounded-lg overflow-hidden shrink-0">
                <Image src={cur} fittingType="fill" className="h-full w-full" />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{s.label}</p>
                  {overrides[s.key] && (
                    <button onClick={() => setOverride(s.key, "")} className="text-[10px] text-muted-foreground hover:text-foreground">Herstel</button>
                  )}
                </div>
                <input
                  value={overrides[s.key] || ""}
                  onChange={(e) => setOverride(s.key, e.target.value)}
                  placeholder="Plak URL of kies bibliotheek"
                  className="w-full glass-1 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                />
                <button onClick={() => setPicker(picker === s.key ? null : s.key)} className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                  <Library className="h-3 w-3" /> Bibliotheek
                </button>
                {picker === s.key && (
                  <div className="grid grid-cols-4 gap-1.5 max-h-40 overflow-y-auto pr-1">
                    {LIBRARY.map((url) => (
                      <button key={url} onClick={() => { setOverride(s.key, url); setPicker(null); }} className={cn("h-12 rounded-md overflow-hidden border", cur === url ? "border-olive" : "border-transparent")}>
                        <Image src={url} fittingType="fill" className="h-full w-full" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}