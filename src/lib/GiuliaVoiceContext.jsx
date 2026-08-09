import React, { createContext, useContext, useCallback, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";

/**
 * GiuliaVoiceContext — the state machine behind the Concierge system.
 * States: idle | listening | thinking | speaking.
 * Voice flow: record (MediaRecorder) -> upload -> transcribe -> chatWithGiulia
 * -> speak the reply back (GenerateSpeech). Text flow bypasses recording.
 */
const Ctx = createContext(null);

export function GiuliaVoiceProvider({ children }) {
  const [state, setState] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState(null);
  const recRef = useRef(null);
  const chunksRef = useRef([]);
  const audioRef = useRef(null);

  const ask = useCallback(async (text) => {
    setState("thinking");
    setTranscript(text);
    setReply("");
    try {
      const res = await base44.functions.invoke("chatWithGiulia", { message: text });
      const data = res?.data ?? res ?? {};
      const replyText = data.response || "";
      setReply(replyText);
      if (replyText) {
        setState("speaking");
        try {
          const { url } = await base44.integrations.Core.GenerateSpeech({ text: replyText.slice(0, 900) });
          const audio = new Audio(url);
          audioRef.current = audio;
          audio.onended = () => setState("idle");
          audio.onerror = () => setState("idle");
          await audio.play();
        } catch {
          setState("idle");
        }
      } else {
        setState("idle");
      }
    } catch {
      setError("Giulia reageert niet. Probeer het opnieuw.");
      setState("idle");
    }
  }, []);

  const startListening = useCallback(async (e) => {
    e?.preventDefault?.();
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (ev) => ev.data.size && chunksRef.current.push(ev.data);
      recorder.start();
      recRef.current = { recorder, stream };
      setState("listening");
    } catch {
      setError("Microfoon niet beschikbaar.");
    }
  }, []);

  const stopListening = useCallback(async (e) => {
    e?.preventDefault?.();
    const rec = recRef.current;
    if (!rec) return;
    recRef.current = null;
    const { recorder, stream } = rec;

    const blob = await new Promise((resolve) => {
      recorder.onstop = () => resolve(new Blob(chunksRef.current, { type: "audio/webm" }));
      if (recorder.state !== "inactive") recorder.stop();
      else resolve(new Blob(chunksRef.current, { type: "audio/webm" }));
    });
    stream.getTracks().forEach((t) => t.stop());

    if (!blob.size) { setState("idle"); return; }
    setState("thinking");
    try {
      const file = new File([blob], "voice.webm", { type: "audio/webm" });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const text = (await base44.integrations.Core.TranscribeAudio({ audio_url: file_url }) || "").trim();
      if (!text) { setState("idle"); return; }
      await ask(text);
    } catch {
      setError("Kon je niet verstaan. Probeer opnieuw.");
      setState("idle");
    }
  }, [ask]);

  const sendText = useCallback((text) => {
    if (!text?.trim()) return;
    ask(text.trim());
  }, [ask]);

  const reset = useCallback(() => {
    setState("idle"); setTranscript(""); setReply(""); setError(null);
  }, []);

  return (
    <Ctx.Provider value={{ state, transcript, reply, error, startListening, stopListening, sendText, reset }}>
      {children}
    </Ctx.Provider>
  );
}

export function useGiuliaVoice() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useGiuliaVoice must be used within a GiuliaVoiceProvider");
  return ctx;
}