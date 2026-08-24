import React, { useEffect } from "react";
import { HelpCircle } from "lucide-react";
import { usePanel } from "@/lib/PanelContext";

/**
 * Standaalone pagina die exact het dashboard-gedrag reproduktert: bij openen
 * schuift de ModulePanel van rechts in met daarin QuestionsPreview (module
 * "wantstoknow"). Sluit je 'm, dan heropent de knop hem.
 */
export default function QuestionsPanelPage() {
  const { openModule } = usePanel();

  useEffect(() => {
    openModule("wantstoknow");
  }, [openModule]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-5">
      <div className="flex flex-col items-center gap-3">
        <HelpCircle className="h-7 w-7 text-olive" />
        <h1 className="font-display text-2xl font-semibold text-foreground">Wants to Know</h1>
        <p className="text-foreground/55 text-sm max-w-sm">
          De ModulePanel schuift van rechts in met Giulia's open vragen.
          Sluit je hem, dan opent de knop hem opnieuw.
        </p>
      </div>
      <button
        onClick={() => openModule("wantstoknow")}
        className="inline-flex items-center gap-1.5 rounded-full bg-charcoal px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-ivory hover:bg-charcoal/90 transition"
      >
        Open paneel
      </button>
    </div>
  );
}