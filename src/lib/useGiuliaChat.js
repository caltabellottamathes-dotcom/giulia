import { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";

/**
 * useGiuliaChat — chat-aansluiting op GIULIA-GIULIA's eigen brein
 * (chatWithGiulia, BYOK Gemini — géén Base44-integrationcredits / InvokeLLM).
 *
 *chatWithGiulia is een multi-step Gemini-loop en kan 10–30s duren. In plaats
 * van te pollén, abonneren we ons op de Message-entiteit via realtime
 * subscriptions. Zodra Giulia haar antwoord opslaat, verschijnt het direct
 * in het chatvenster — zonder pagina-herlaad.
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
  const seenIds = useRef(new Set());
  const settledRef = useRef(false);
  const fallbackTimer = useRef(null);

  // Initiale berichtengeschiedenis laden
  useEffect(() => {
    (async () => {
      try {
        const list = await base44.entities.Message.filter({ channel: "in-app" }, "-created_date", 60).catch(() => []);
        const ordered = (list || []).filter((m) => m.content).reverse();
        const normalized = ordered.map(norm);
        normalized.forEach((m) => seenIds.current.add(m.id));
        setMessages(normalized);
      } catch { /* ignore */ }
      setReady(true);
    })();
  }, []);

  // Realtime subscription — Giulia's antwoord verschijnt direct zodra opgeslagen
  useEffect(() => {
    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (event.type !== "create") return;
      const m = event?.data;
      if (!m || !m.content || m.channel !== "in-app" || m.role !== "giulia") return;
      if (seenIds.current.has(m.id)) return;
      if (settledRef.current) return; // invoke heeft het al toegevoegd
      seenIds.current.add(m.id);
      settledRef.current = true;
      setMessages((prev) => [...prev, norm(m)]);
      setSending(false);
      if (fallbackTimer.current) { clearTimeout(fallbackTimer.current); fallbackTimer.current = null; }
    });
    return unsubscribe;
  }, []);

  const send = useCallback(async (content, opts = {}) => {
    const text = (content || "").trim();
    if (!text || sending) return;
    const atts = Array.isArray(opts.attachments) ? opts.attachments : [];
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", content: text, tool_calls: [], attachments: atts }]);
    settledRef.current = false;
    setSending(true);

    // Fallback: als er na 90s geen antwoord via de subscription is gekomen
    fallbackTimer.current = setTimeout(() => {
      if (settledRef.current) return;
      setSending(false);
      setMessages((prev) => [...prev, { id: `e-${Date.now()}`, role: "assistant", content: "Giulia is even bezet — probeer het zo weer.", tool_calls: [], attachments: [] }]);
      fallbackTimer.current = null;
    }, 90000);

    try {
      const res = await base44.functions.invoke("chatWithGiulia", {
        message: text,
        source: "chat",
        file_urls: opts.file_urls || atts.map((a) => a.url),
        attachments: atts,
      });
      // Als de invoke slaagt vóór de subscription, gebruik het antwoord direct
      if (res?.response && !settledRef.current) {
        settledRef.current = true;
        if (fallbackTimer.current) { clearTimeout(fallbackTimer.current); fallbackTimer.current = null; }
        setMessages((prev) => [...prev, { id: `g-${Date.now()}`, role: "assistant", content: res.response, tool_calls: res.actions_executed || [], attachments: [] }]);
        setSending(false);
      }
    } catch {
      // invoke faalde of timeout — de subscription herstelt het antwoord
      // zodra Giulia het opslaat; anders vuurt de fallback na 90s
    }
  }, [sending]);

  return { messages, send, sending, ready };
}

/**
 * askGiuliaOnce — één shot vraag aan hetzelfde BYOK-brein (chatWithGiulia),
 * gebruikt door widgets die een snelle antwoord nodig hebben.
 */
export async function askGiuliaOnce(content) {
  const text = (content || "").trim();
  if (!text) return null;
  try {
    const res = await base44.functions.invoke("chatWithGiulia", { message: text, source: "chat", persist: false });
    return res?.response || null;
  } catch {
    return null;
  }
}