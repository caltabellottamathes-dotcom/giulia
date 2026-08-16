import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

/**
 * useAgentNavigation — abonneert op de AgentNavigation-entiteit en voert
 * real-time navigatie-acties uit die door de stem-agent (via de
 * elevenLlmProxy) zijn weggeschreven. Werkt buiten de gebroken ElevenLabs
 * client-tool pipeline (bug #603) om.
 *
 * Ondersteunde acties (via params):
 *  - route           → navigate(route)
 *  - params.panel    → openModule(panel)  (sliding panel)
 *  - params.section  → scrollIntoView(section)
 *  - params.element  → voice-highlight (tijdelijke outline)
 */
export function useAgentNavigation({ openModule } = {}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const seen = useRef(new Set());
  const openModuleRef = useRef(openModule);
  openModuleRef.current = openModule;

  useEffect(() => {
    base44.entities.AgentNavigation.list("-created_date", 1)
      .then((l) => l.forEach((n) => seen.current.add(n.id)))
      .catch(() => {});

    const unsub = base44.entities.AgentNavigation.subscribe((event) => {
      if (!event || event.type !== "create") return;
      const nav = event.data || event;
      if (!nav || !nav.id || seen.current.has(nav.id)) return;
      seen.current.add(nav.id);
      const params = nav.params || {};

      // 1) Panel openen (sliding glass) — hogere prioriteit dan route-navigatie.
      if (params.panel && openModuleRef.current) {
        openModuleRef.current(params.panel);
      } else if (nav.route) {
        navigate(nav.route);
      }

      // 2) Scrollen naar sectie
      if (params.section) {
        setTimeout(() => {
          const el = document.getElementById(params.section);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, params.panel || nav.route ? 400 : 0);
      }

      // 3) Element highlighten
      if (params.element) {
        setTimeout(() => {
          const el = document.getElementById(params.element);
          if (el) {
            el.classList.add("voice-highlight");
            setTimeout(() => el.classList.remove("voice-highlight"), 2500);
          }
        }, params.panel || nav.route ? 400 : 0);
      }

      if (nav.label) {
        toast({ title: "Giulia", description: nav.label });
      }
    });

    return () => {
      try { unsub && unsub(); } catch { /* ignore */ }
    };
  }, [navigate, toast]);

  return null;
}