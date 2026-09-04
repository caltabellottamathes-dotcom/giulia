import React from "react";
import { Trash2, Film, Music, FileText, ImageIcon, Send, Folder, Pencil, Check, Loader2 } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Image } from "@/components/ui/image";
import { kindOfUpload } from "@/lib/useMediaLibrary";
import { DRAG_FILES } from "./dnd";

function KindIcon({ kind, className }) {
  if (kind === "video") return <Film className={className} />;
  if (kind === "music") return <Music className={className} />;
  if (kind === "doc") return <FileText className={className} />;
  return <ImageIcon className={className} />;
}

/** FileTile — bestand in de verkenner: aanklikbaar om te openen, versleepbaar
 *  naar mappen, met selectie-vinkje en acties (verzenden, verplaatsen, hernoemen, verwijderen). */
export default function FileTile({
  item, selected, dragIds, onToggleSelect, onOpen, onRemove, onRename, onSend, sending, onMove, moveTargets, projects, onMoveToProject,
}) {
  const kind = kindOfUpload(item);
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(DRAG_FILES, JSON.stringify(dragIds));
        e.dataTransfer.setData("text/plain", item.filename);
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={() => onOpen(item)}
      className={`group relative aspect-square rounded-2xl overflow-hidden flex items-center justify-center text-left cursor-pointer ring-1 transition
        ${selected ? "ring-2 ring-olive bg-olive/10" : "ring-foreground/10 bg-foreground/[0.04] hover:bg-foreground/[0.07]"}`}
    >
      {kind === "image" ? (
        <Image src={item.file_url} className="h-full w-full" fittingType="fill" />
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 text-foreground/45">
          <KindIcon kind={kind} className="h-7 w-7" />
          <span className="text-[10px] text-center px-2 line-clamp-2 text-foreground/55">{item.filename}</span>
        </div>
      )}
      {/* selectie-vinkje */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleSelect(item.id); }}
        className={`absolute top-2 left-2 z-10 h-5 w-5 rounded-md border flex items-center justify-center transition
          ${selected ? "bg-olive border-olive text-ivory" : "bg-charcoal/55 backdrop-blur border-ivory/40 text-transparent opacity-0 group-hover:opacity-100"}`}
        title={selected ? "Deselecteer" : "Selecteer"}
      >
        <Check className="h-3 w-3" />
      </button>
      <span className="absolute top-2 right-2 text-[9px] uppercase tracking-[0.16em] font-bold text-ivory bg-charcoal/55 backdrop-blur px-2 py-0.5 rounded-full">
        {kind === "music" ? "audio" : kind}
      </span>
      <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={(e) => { e.stopPropagation(); onSend(item); }}
          disabled={sending}
          className="h-8 w-8 rounded-full bg-charcoal/70 text-ivory flex items-center justify-center disabled:opacity-50"
          title="Verzend naar GIULIA"
        >
          {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button onClick={(e) => e.stopPropagation()} className="h-8 w-8 rounded-full bg-charcoal/70 text-ivory flex items-center justify-center" title="Verplaats naar map">
              <Folder className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-charcoal text-ivory border-white/10 max-h-[320px] overflow-y-auto">
            <DropdownMenuItem onClick={() => onMove([item.id], "")} className="text-[12px] focus:bg-ivory/10">Niet-ingedeeld</DropdownMenuItem>
            {moveTargets.length > 0 && <DropdownMenuSeparator className="bg-ivory/10" />}
            {moveTargets.map((f) => (
              <DropdownMenuItem key={f.id} onClick={() => onMove([item.id], f.path)} className="text-[12px] focus:bg-ivory/10 truncate">{f.path}</DropdownMenuItem>
            ))}
            {projects.length > 0 && <DropdownMenuSeparator className="bg-ivory/10" />}
            {projects.length > 0 && (
              <p className="px-2 pt-1 pb-0.5 text-[9px] uppercase tracking-[0.18em] text-ivory/40 font-bold">Projecten</p>
            )}
            {projects.map((p) => (
              <DropdownMenuItem key={p.id} onClick={() => onMoveToProject(item.id, p)} className="text-[12px] focus:bg-ivory/10 truncate">{p.title}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <button onClick={(e) => { e.stopPropagation(); onRename(item); }} className="h-8 w-8 rounded-full bg-charcoal/70 text-ivory flex items-center justify-center" title="Hernoem">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onRemove(item.id); }} className="h-8 w-8 rounded-full bg-charcoal/70 text-ivory flex items-center justify-center" title="Verwijder">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}