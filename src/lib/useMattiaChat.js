import { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { bumpRefresh } from "@/lib/refreshBus";

/**
 * useMattiaChat — chat-aansluiting op Mattia (chatWithMattia, BYOK MATTIA
 * Gemini-key — géén integration-credits). Parallel aan useGiuliaChat, maar
 * voor de Mattia-draad (Message role="mattia").
 *
 * chatWithMattia is een multi-step Gemini-loop en kan even duren. Net als bij
 * Giulia abonneren we ons op de Message-entiteit; zodra Mattia zijn antwoord
 * opslaat (role="mattia"), verschijnt het direct in het chatvenster.
 */
const norm = (m) => ({
  id: m.id,
  role: m.role === "user" ? "user" : "assistant",
  content: m.content || "",
  tool_calls: Array.isArray(m.tool_calls) ? m.tool_calls : [],
  attachments: Array.isArray(m.attachments) ? m.attachments : [],
});

export function useMattiaChat() {
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [ready, setReady] = useState(false);
  const seenIds = useRef(new Set());
  const settledRef = useRef(false);
  const fallbackTimer = useRef(null);

  // Initiele Mattia-draad laden (user + mattia, in-app, niet giulia)
  useEffect(() => {
    (async () => {
      try {
        const list = await base44.entities.Message.filter({ thread_id: "mattia" }, "-created_date", 60).catch(() => []);
        const ordered = (list || []).filter((m) => m.content).reverse();
        const normalized = ordered.map(norm);
        normalized.forEach((m) => seenIds.current.add(m.id));
        setMessages(normalized);
      } catch { /* ignore */ }
      setReady(true);
    })();
  }, []);

  // Realtime subscription — Mattia's antwoord verschijnt direct zodra opgeslagen
  useEffect(() => {
    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (event.type !== "create") return;
      const m = event?.data;
      if (!m || !m.content || m.thread_id !== "mattia" || m.role !== "mattia") return;
      if (seenIds.current.has(m.id)) return;
      if (settledRef.current) return;
      seenIds.current.add(m.id);
      settledRef.current = true;
      setMessages((prev) => [...prev, norm(m)]);
      setSending(false);
      if (fallbackTimer.current) { clearTimeout(fallbackTimer.current); fallbackTimer.current = null; }
      bumpRefresh();
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

    fallbackTimer.current = setTimeout(() => {
      if (settledRef.current) return;
      setSending(false);
      setMessages((prev) => [...prev, { id: `e-${Date.now()}`, role: "assistant", content: "Mattia is even bezig met zijn hoofd — probeer het zo weer.", tool_calls: [], attachments: [] }]);
      fallbackTimer.current = null;
    }, 90000);

    try {
      const res = await base44.functions.invoke("chatWithMattia", {
        message: text,
        source: "chat",
        file_urls: opts.file_urls || atts.map((a) => a.url),
        attachments: atts,
      });
      if (res?.response && !settledRef.current) {
        settledRef.current = true;
        if (fallbackTimer.current) { clearTimeout(fallbackTimer.current); fallbackTimer.current = null; }
        setMessages((prev) => [...prev, { id: `m-${Date.now()}`, role: "assistant", content: res.response, tool_calls: res.actions_executed || [], attachments: [] }]);
        setSending(false);
        bumpRefresh();
      }
    } catch {
      // invoke faalde of timeout — de subscription herstelt het antwoord;
      // anders vuurt de fallback na 90s
    }
  }, [sending]);

  return { messages, send, sending, ready };
}

/** askMattiaOnce — één shot vraag aan Mattia (BYOK), voor widgets. */
export async function askMattiaOnce(content) {
  const text = (content || "").trim();
  if (!text) return null;
  try {
    const res = await base44.functions.invoke("chatWithMattia", { message: text, source: "chat", persist: false });
    return res?.response || null;
  } catch {
    return null;
  }
}