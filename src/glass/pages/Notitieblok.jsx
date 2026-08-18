import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PageShell, GlassButton } from "@/glass/components/glass";

export default function Notitieblok() {
  const [title, setTitle] = useState(() => { try { return localStorage.getItem("nb_title") || "Brainstorm"; } catch { return "Brainstorm"; } });
  const [body, setBody] = useState(() => { try { return localStorage.getItem("nb_body") || ""; } catch { return ""; } });

  useEffect(() => { try { localStorage.setItem("nb_title", title); } catch {} }, [title]);
  useEffect(() => { try { localStorage.setItem("nb_body", body); } catch {} }, [body]);

  const words = body.trim() ? body.trim().split(/\s+/).length : 0;

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-marble/50 text-xs">Vrij denken</p>
          <h1 className="text-storm text-2xl sm:text-3xl font-bold tracking-tight">Notitieblok</h1>
        </div>
        <Link to="/glass"><GlassButton className="px-4 py-2 text-storm text-sm">← Terug</GlassButton></Link>
      </div>

      <div className="rounded-2xl border border-marble/20 bg-marble/5 p-6 min-h-[62vh] flex flex-col">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-transparent text-storm text-2xl font-bold outline-none placeholder:text-marble/30"
          placeholder="Titel..."
        />
        <div className="h-px bg-marble/15 my-4" />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Schrijf vrij, brainstorm, laat je gedachten stromen..."
          className="flex-1 bg-transparent text-marble/90 text-base leading-relaxed outline-none resize-none placeholder:text-marble/30 min-h-[42vh]"
        />
        <div className="flex justify-between text-marble/40 text-xs mt-3">
          <span>{words} woorden</span>
          <span>Automatisch opgeslagen</span>
        </div>
      </div>
    </PageShell>
  );
}