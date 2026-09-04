import React, { useState } from "react";
import { Folder, Pencil, Trash2 } from "lucide-react";
import { isInternalDrag, readDrag, DRAG_FOLDER } from "./dnd";

/** FolderTile — map-tegel in de verkenner. Sleep bestanden of andere mappen
 *  erop om te verplaatsen; sleep de tegel zelf naar een andere map. */
export default function FolderTile({ folder, count, onOpen, onRename, onDelete, onDropFiles, onDropFolder }) {
  const [over, setOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOver(false);
    const d = readDrag(e);
    if (!d) return;
    if (d.type === "files") onDropFiles(d.ids, folder.path);
    else onDropFolder(d.path, folder.path);
  };

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(DRAG_FOLDER, folder.path);
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={(e) => { if (isInternalDrag(e)) { e.preventDefault(); setOver(true); } }}
      onDragLeave={() => setOver(false)}
      onDrop={handleDrop}
      onClick={() => onOpen(folder.path)}
      className={`group relative aspect-square rounded-2xl cursor-pointer flex flex-col items-center justify-center gap-2.5 transition
        ${over ? "ring-2 ring-olive bg-olive/10 scale-[0.97]" : "ring-1 ring-foreground/10 bg-foreground/[0.04] hover:bg-foreground/[0.08]"}`}
      title={folder.path}
    >
      <Folder className={`h-8 w-8 transition ${over ? "text-olive" : "text-foreground/40"}`} />
      <span className="text-[12px] font-medium text-foreground/80 text-center px-3 line-clamp-2 break-all leading-tight">{folder.name}</span>
      <span className="text-[10px] font-mono text-foreground/35 tabular-nums">{count}</span>
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={(e) => { e.stopPropagation(); onRename(folder); }}
          className="h-7 w-7 rounded-full bg-charcoal/70 text-ivory flex items-center justify-center"
          title="Map hernoemen"
        >
          <Pencil className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(folder); }}
          className="h-7 w-7 rounded-full bg-charcoal/70 text-ivory flex items-center justify-center"
          title="Map verwijderen"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}