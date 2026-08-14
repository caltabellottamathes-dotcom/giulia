import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import { Map, ChevronDown, ArrowUpRight } from "lucide-react";
import ReactMarkdown from "react-markdown";

/**
 * GiuliaStatusCard — "Waar we staan". Leest de GIULIA-projectkaart en het
 * "GIULIA OS — Stand van Zaken"-document, zodat Salvo bij elke refresh meteen
 * ziet: waar we nu staan, wat werkt, wat nog moet, en hoe we dat gaan doen.
 * Het document is dezelfde bron die alle agenten geïnjecteerd krijgen.
 */
export default function GiuliaStatusCard() {
  const [project, setProject] = useState(null);
  const [doc, setDoc] = useState(null);
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [projs, docs] = await Promise.all([
          base44.entities.Project.filter({ title: "GIULIA" }).catch(() => []),
          base44.entities.Document.filter({ name: "GIULIA OS — Stand van Zaken" }).catch(() => []),
        ]);
        if (!alive) return;
        setProject(projs?.[0] || null);
        setDoc(docs?.[0] || null);
      } catch {
        /* ignore */
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading || !doc) return null;

  const progress = project?.progress ?? null;

  return (
    <div className="max-w-[1280px] mx-auto mb-6">
      <div className="glass-card rounded-[24px] overflow-hidden">
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center gap-3 px-5 py-4 text-left"
        >
          <span className="h-9 w-9 rounded-2xl glass-1 flex items-center justify-center shrink-0">
            <Map className="h-5 w-5 text-ivory" strokeWidth={1.5} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/70 font-semibold">Waar we staan</p>
            <h2 className="text-lg font-display font-semibold text-ivory leading-tight truncate">
              GIULIA OS — Stand van Zaken
            </h2>
          </div>
          {progress != null && (
            <span className="hidden sm:inline-flex items-center gap-2 text-xs text-ivory/80 font-medium">
              <span className="h-1.5 w-16 rounded-full bg-ivory/15 overflow-hidden">
                <span className="block h-full bg-ivory/80 rounded-full" style={{ width: `${Math.min(100, progress)}%` }} />
              </span>
              {progress}%
            </span>
          )}
          {project && (
            <Link
              to={`/projects/${project.id}`}
              onClick={(e) => e.stopPropagation()}
              className="hidden md:inline-flex items-center gap-1 text-xs text-ivory/70 hover:text-ivory transition-colors"
            >
              Project <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
          <ChevronDown className={cn("h-5 w-5 text-ivory/70 transition-transform shrink-0", open && "rotate-180")} />
        </button>

        {open && (
          <div className="px-5 pb-5 pt-1 border-t border-white/10">
            <div className="prose-giulia-status text-ivory/90 text-sm leading-relaxed max-w-none">
              <ReactMarkdown
                components={{
                  h1: () => null,
                  h2: ({ children }) => (
                    <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/60 font-semibold mt-4 mb-2 first:mt-0">
                      {children}
                    </p>
                  ),
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold text-ivory">{children}</strong>,
                  em: ({ children }) => <em className="text-ivory/70 not-italic">{children}</em>,
                  ul: ({ children }) => <ul className="space-y-1.5 mb-2">{children}</ul>,
                  li: ({ children }) => (
                    <li className="flex gap-2">
                      <span className="text-ivory/40 mt-1">•</span>
                      <span className="flex-1">{children}</span>
                    </li>
                  ),
                }}
              >
                {doc.content || ""}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}