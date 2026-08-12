import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

/**
 * useAgentNavigation — abonneert op de AgentNavigation-entiteit en navigeert
 * de app in real time naar de route die Giulia (of een andere agent) schrijft.
 * Wordt één keer app-breed in de Layout geactiveerd.
 */
export function useAgentNavigation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const seen = useRef(new Set());

  useEffect(() => {
    // Seed met de nieuwste navigatie zodat we oude records niet opnieuw openen.
    base44.entities.AgentNavigation.list("-created_date", 1)
      .then((l) => l.forEach((n) => seen.current.add(n.id)))
      .catch(() => {});

    const unsub = base44.entities.AgentNavigation.subscribe((event) => {
      if (!event || event.type !== "create") return;
      const nav = event.data || event;
      if (!nav || !nav.id || seen.current.has(nav.id)) return;
      seen.current.add(nav.id);
      if (!nav.route) return;
      navigate(nav.route);
      if (nav.label) {
        toast({ title: "Giulia opent", description: nav.label });
      }
    });

    return () => {
      try { unsub && unsub(); } catch { /* ignore */ }
    };
  }, [navigate, toast]);

  return null;
}