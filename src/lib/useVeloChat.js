import { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

/**
 * useVeloChat — SYSTEM-chat met de Velo SuperAgent.
 *
 * Velo leeft in een andere Base44-app; de app-scoped agents-SDK kan er niet
 * bij. Daarom verloopt alles via de backend-functie `veloChat` (account-level
 * REST API met de VELO_API_KEY). Geen realtime subscribe — de functie pollt
 * server-side tot de assistant-reply erbij staat en geeft de volledige
 * messages terug.
 */
const CONV_ID = "6a6cc0034bc0607c481f1602";

export function useVeloChat() {
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await base44.functions.invoke("veloChat", { content: "" });
        if (alive) setMessages(res?.data?.messages || []);
      } catch {
        /* negeer — widget toont lege staat */
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => { alive = false; };
  }, []);

  const send = useCallback(async (content) => {
    const c = String(content || "").trim();
    if (!c) return;
    setSending(true);
    setMessages((m) => [...m, { role: "user", content: c }]);
    try {
      const res = await base44.functions.invoke("veloChat", { content: c });
      setMessages(res?.data?.messages || []);
    } catch {
      /* negeer — sending wordt hieronder gereset */
    }
    setSending(false);
  }, []);

  return { messages, send, sending, ready, conversationId: CONV_ID };
}