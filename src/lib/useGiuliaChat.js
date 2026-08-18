import { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";

/**
 * useGiuliaChat — directe chat met GIULIA-GIULIA (het brein). De frontend
 * delegeert elke beurt aan de chatWithGiulia-backendfunctie: een BYOK Gemini
 * function-calling loop op Giulia's EIGEN sleutels (GIULIA_GIULIA_*), met de
 * VOLLEDIGE skill-set — entiteit-CRUD, navigatie (route + panel + section +
 * element), communicatie, food, therapie-koppeling. Hierdoor voert de chat
 * ÉCHT acties uit en kan Giulia Salvo door de hele app sturen.
 *
 * Eén gedeeld, persistent gesprek (Message-entiteiten, channel "in-app") voor
 * zowel de /chat-pagina als het globale ChatWindow. Realtime sync via een
 * Message-subscription (andere tab/venster blijft up-to-date).
 */
const norm = (m) => ({
  id: m.id,
  role: m.role === "user" ? "user" : "assistant",
  content: m.content || "",
  tool_calls: Array.isArray(m.tool_calls) ? m.tool_calls : [],
  attachments: Array.isArray(m.attachments) ? m.attachments : [],
});

export function useGiuliaChat() {
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [ready, setReady] = useState(false);

  const loadHistory = useCallback(async () => {
    const list = await base44.entities.Message.filter({ channel: "in-app" }, "-created_date", 40).catch(() => []);
    const ordered = (list || []).slice().reverse();
    setMessages(ordered.map(norm));
    setReady(true);
  }, []);

  useEffect(() => {
    loadHistory();
    let unsub = null;
    try {
      unsub = base44.entities.Message.subscribe((event) => {
        if (!event) return;
        const m = event.data || event;
        if (!m || !m.id || m.channel !== "in-app") return;
        setMessages((prev) => {
          // update als het bericht al bekend is
          if (prev.find((x) => x.id === m.id)) {
            return prev.map((x) => (x.id === m.id ? norm(m) : x));
          }
          // echte user-msg die overeenkomt met de optimistic temp → vervang temp
          if (m.role === "user" && !String(m.id).startsWith("pending-")) {
            const tempIdx = prev.findIndex(
              (x) => String(x.id).startsWith("pending-") && x.content === (m.content || "")
            );
            if (tempIdx >= 0) {
              const next = prev.slice();
              next[tempIdx] = norm(m);
              return next;
            }
          }
          return [...prev, norm(m)];
        });
      });
    } catch { /* ignore */ }
    return () => { try { unsub && unsub(); } catch { /* ignore */ } };
  }, [loadHistory]);

  const send = useCallback(async (content, opts = {}) => {
    const text = (content || "").trim();
    if (!text) return;
    const atts = Array.isArray(opts.attachments) ? opts.attachments : [];
    const file_urls = Array.isArray(opts.file_urls) ? opts.file_urls : atts.map((a) => a.url).filter(Boolean);
    const tempId = `pending-${Date.now()}`;
    // Optimistisch user-bericht tonen (de backend slaat het ook op; de
    // subscription vervangt de temp zodra de echte record binnenkomt).
    setMessages((prev) => [...prev, { id: tempId, role: "user", content: text, tool_calls: [], attachments: atts }]);
    setSending(true);
    try {
      await base44.functions.invoke("chatWithGiulia", {
        message: text,
        source: "chat",
        persist: true,
        attachments: atts.map((a) => ({ url: a.url, name: a.name, type: a.type })),
        ...(file_urls.length ? { file_urls } : {}),
      });
      // Haal de waarheid op (user + giulia berichten) — vangnet voor als de
      // subscription niet (tijdig) vuurt.
      await loadHistory();
    } catch { /* ignore */ } finally {
      setSending(false);
    }
  }, [loadHistory]);

  return { messages, send, sending, ready };
}

/**
 * askGiuliaOnce — één shot vraag aan GIULIA-GIULIA via dezelfde
 * chatWithGiulia-backend (BYOK). Resolvet met de assistent-reactie. Voor paths
 * die geen volledige chat-draad willen tonen.
 */
export async function askGiuliaOnce(content) {
  const text = (content || "").trim();
  if (!text) return null;
  const res = await base44.functions.invoke("chatWithGiulia", { message: text, source: "chat", persist: true }).catch(() => null);
  return (res && res.response) || null;
}