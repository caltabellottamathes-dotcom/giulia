import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useBeeldbank } from "@/lib/BeeldbankContext";
import { IMAGES } from "@/lib/images";
import { Image } from "@/components/ui/image";
import { Upload, Trash2, Camera, ArrowLeft } from "lucide-react";

/**
 * Beeldbank — volledige pagina. Toont alle foto's in het systeem (website +
 * eigen uploads), laat eigen foto's uploaden/verwijderen, en schakelt de
 * beeldbank-modus in (klik elke foto in de app om hem te wisselen).
 */
export default function Beeldbank() {
  const { mode, toggleMode, assets, upload, uploading, removeAsset } = useBeeldbank();
  const fileRef = useRef(null);
  const [q, setQ] = useState("");

  const website = Object.entries(IMAGES);
  const ql = q.toLowerCase();
  const filtered = q ? website.filter(([k]) => k.toLowerCase().includes(ql)) : website;
  const uploaded = assets || [];

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <Link to="/" className="text-xs text-foreground/60 hover:text-foreground inline-flex items-center gap-1 mb-2">
            <ArrowLeft className="h-3 w-3" /> Dashboard
          </Link>
          <h1 className="text-3xl font-display font-semibold tracking-[-0.02em]">Change the Look!</h1>
          <p className="text-sm text-foreground/60 mt-1 max-w-xl">
            Alle foto's in je systeem. Upload je eigen beeld of wissel elke foto in de app via de Beeldbank modus.
          </p>
        </div>
        <button
          onClick={toggleMode}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition shrink-0 ${
            mode ? "bg-olive text-ivory" : "bg-foreground/[0.06] border border-foreground/10 text-foreground hover:bg-foreground/10"
          }`}
        >
          <Camera className="h-4 w-4" /> {mode ? "Modus actief — afsluiten" : "Beeldbank modus"}
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Zoek foto's…"
          className="flex-1 h-10 rounded-full px-4 bg-foreground/[0.04] border border-foreground/10 text-sm focus:outline-none"
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold bg-charcoal text-ivory"
        >
          <Upload className="h-4 w-4" /> Upload foto
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={async (e) => {
            const files = [...(e.target.files || [])];
            for (const f of files) await upload(f);
            e.target.value = "";
          }}
        />
      </div>

      {uploading && <p className="text-xs text-foreground/50 mb-3">Uploaden…</p>}

      {uploaded.length > 0 && (
        <section className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-foreground/50 mb-3">Geüpload · {uploaded.length}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {uploaded.map((a) => (
              <div key={a.id} className="group relative aspect-square rounded-2xl overflow-hidden ring-1 ring-foreground/10">
                <Image src={a.url} className="h-full w-full" fittingType="fill" />
                <button
                  onClick={() => removeAsset(a.id)}
                  className="absolute top-2 right-2 h-8 w-8 rounded-full bg-charcoal/60 text-ivory flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <p className="text-[11px] uppercase tracking-[0.2em] text-foreground/50 mb-3">Website · {filtered.length}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {filtered.map(([k, url]) => (
            <div key={k} className="group relative aspect-square rounded-2xl overflow-hidden ring-1 ring-foreground/10">
              <Image src={url} className="h-full w-full" fittingType="fill" />
              <span className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/75 to-transparent px-2 py-1 text-[9px] text-ivory truncate opacity-0 group-hover:opacity-100 text-left">
                {k}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}