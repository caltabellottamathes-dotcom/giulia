import React, { useMemo, useRef, useState } from "react";
import { useMediaLibrary, kindOfUpload } from "@/lib/useMediaLibrary";
import { useMediaViewer } from "@/lib/MediaViewerContext";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Image } from "@/components/ui/image";
import {
  Upload, Trash2, Film, Music, FileText, ImageIcon, Play, Loader2,
  FolderPlus, Pencil, Folder, Send, ChevronDown,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const KIND_TABS = [
  { key: "all", label: "Alles" },
  { key: "image", label: "Foto's" },
  { key: "video", label: "Video" },
  { key: "music", label: "Audio" },
  { key: "doc", label: "Docs" },
];

function KindIcon({ kind, className }) {
  if (kind === "video") return <Film className={className} />;
  if (kind === "music") return <Music className={className} />;
  if (kind === "doc") return <FileText className={className} />;
  return <ImageIcon className={className} />;
}

/** FilesManager — de witte hoofdkaart van de FILES-pagina. Volledige
 *  bibliotheek­beheer: mappen aanmaken, bestanden tussen mappen verplaatsen,
 *  hernoemen/verwijderen, openen in de MediaStage, en verzenden naar GIULIA
 *  (opent de chat-stage met het bestand als bijlage). */
export default function FilesManager({ onSendToGiulia }) {
  const { items, loading, uploading, upload, remove, rename, setFolder, reload } = useMediaLibrary();
  const { openMedia } = useMediaViewer();
  const { toast } = useToast();
  const fileRef = useRef(null);
  const [tab, setTab] = useState("all");
  const [folder, setFolderState] = useState(null); // null = Alles
  const [sending, setSending] = useState(null);

  const folders = useMemo(
    () => [...new Set((items || []).map((i) => i.folder).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [items]
  );

  const visible = useMemo(
    () => (items || []).filter((i) =>
      (tab === "all" || kindOfUpload(i) === tab) && (folder == null || i.folder === folder)
    ),
    [items, tab, folder]
  );

  const counts = {
    all: items.length,
    image: items.filter((i) => kindOfUpload(i) === "image").length,
    video: items.filter((i) => kindOfUpload(i) === "video").length,
    music: items.filter((i) => kindOfUpload(i) === "music").length,
    doc: items.filter((i) => kindOfUpload(i) === "doc").length,
  };

  const onFiles = async (e) => {
    const files = [...(e.target.files || [])];
    for (const f of files) await upload(f, folder || "");
    e.target.value = "";
  };

  const open = (item) => openMedia({ name: item.filename, url: item.file_url, type: kindOfUpload(item) });

  const doRename = (item) => {
    const name = window.prompt("Hernoem bestand", item.filename);
    if (name && name.trim()) rename(item.id, name.trim());
  };

  const newFolder = () => {
    const name = window.prompt("Naam van de nieuwe map");
    if (name && name.trim()) setFolderState(name.trim());
  };

  const sendToGiulia = async (item) => {
    setSending(item.id);
    try {
      await base44.functions.invoke("chatWithGiulia", {
        message: `Ik deel dit bestand met je: ${item.filename}`,
        file_urls: [item.file_url],
        attachments: [{ url: item.file_url, name: item.filename, type: kindOfUpload(item) }],
        source: "chat",
        persist: true,
      });
      toast({ title: "Verzonden naar GIULIA", description: item.filename });
      onSendToGiulia?.();
    } catch {
      toast({ title: "Verzenden mislukt", variant: "destructive" });
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="h-full w-full flex">
      {/* Mappen-zijbalk */}
      <div className="w-[200px] shrink-0 border-r border-foreground/10 flex flex-col">
        <div className="px-4 pt-5 pb-3 flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-foreground/45">Mappen</p>
          <button onClick={newFolder} className="h-7 w-7 rounded-full bg-foreground/[0.05] hover:bg-foreground/10 flex items-center justify-center text-foreground/60 transition" title="Nieuwe map">
            <FolderPlus className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
          <FolderRow
            active={folder == null}
            onClick={() => setFolderState(null)}
            label="Alle bestanden"
            count={items.length}
            icon={<Folder className="h-3.5 w-3.5" />}
          />
          {folders.map((f) => (
            <FolderRow
              key={f}
              active={folder === f}
              onClick={() => setFolderState(f)}
              label={f}
              count={(items || []).filter((i) => i.folder === f).length}
              icon={<Folder className="h-3.5 w-3.5" />}
              onDelete={() => {
                // map leeghalen: alle bestanden in deze map naar Geen map
                (items || []).filter((i) => i.folder === f).forEach((i) => setFolder(i.id, ""));
                if (folder === f) setFolderState(null);
              }}
            />
          ))}
          {folder && !folders.includes(folder) && (
            <FolderRow active label={folder} count={0} icon={<Folder className="h-3.5 w-3.5" />} />
          )}
        </div>
      </div>

      {/* Hoofdinhoud */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="px-5 pt-5 pb-3 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-1 bg-foreground/[0.04] border border-foreground/10 rounded-full p-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {KIND_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${
                  tab === t.key ? "bg-charcoal text-ivory" : "text-foreground/60 hover:text-foreground"
                }`}
              >
                {t.label} <span className="opacity-50 ml-1">{counts[t.key] || 0}</span>
              </button>
            ))}
          </div>
          <div className="sm:ml-auto flex items-center gap-2">
            {folder && (
              <span className="text-[10px] text-foreground/45">Uploads gaan naar: <b className="text-foreground/70">{folder}</b></span>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading > 0}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold bg-charcoal text-ivory disabled:opacity-60"
            >
              {uploading > 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading > 0 ? `Uploaden (${uploading})…` : "Upload"}
            </button>
            <input ref={fileRef} type="file" accept="image/*,video/*,audio/*,application/pdf,.pdf" multiple className="hidden" onChange={onFiles} />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-24 text-foreground/40">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-14 w-14 rounded-2xl bg-foreground/[0.05] flex items-center justify-center mb-4">
                <ImageIcon className="h-6 w-6 text-foreground/35" />
              </div>
              <p className="text-sm text-foreground/50 max-w-xs">
                {folder ? `Nog geen bestanden in “${folder}”.` : "Nog geen bestanden. Upload een foto, video, audio of pdf."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {visible.map((item) => (
                <FileThumb
                  key={item.id}
                  item={item}
                  onOpen={open}
                  onRemove={remove}
                  onRename={doRename}
                  onMove={(id, f) => setFolder(id, f)}
                  onSend={sendToGiulia}
                  sending={sending === item.id}
                  folders={folders}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FolderRow({ active, onClick, label, count, icon, onDelete }) {
  return (
    <div className={`group flex items-center gap-2 rounded-xl px-2.5 py-2 transition ${active ? "bg-foreground/10 text-foreground" : "text-foreground/60 hover:bg-foreground/[0.06] hover:text-foreground"}`}>
      <button onClick={onClick} className="flex items-center gap-2 flex-1 min-w-0 text-left">
        <span className="shrink-0 opacity-70">{icon}</span>
        <span className="text-[13px] font-medium truncate">{label}</span>
      </button>
      <span className="text-[10px] font-mono text-foreground/35 tabular-nums">{count}</span>
      {onDelete && (
        <button onClick={(e) => { e.stopPropagation(); if (window.confirm(`Map "${label}" verwijderen? Bestanden gaan naar Alle bestanden.`)) onDelete(); }}
          className="opacity-0 group-hover:opacity-100 h-5 w-5 rounded-full hover:bg-foreground/10 flex items-center justify-center text-foreground/40 transition" title="Map verwijderen">
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

function FileThumb({ item, onOpen, onRemove, onRename, onMove, onSend, sending, folders }) {
  const kind = kindOfUpload(item);
  return (
    <div className="group relative aspect-square rounded-2xl overflow-hidden ring-1 ring-foreground/10 bg-foreground/[0.04] flex items-center justify-center text-left">
      {kind === "image" ? (
        <button onClick={() => onOpen(item)} className="h-full w-full">
          <Image src={item.file_url} className="h-full w-full" fittingType="fill" />
        </button>
      ) : (
        <button onClick={() => onOpen(item)} className="h-full w-full flex flex-col items-center justify-center gap-2 text-foreground/45">
          <KindIcon kind={kind} className="h-7 w-7" />
          <span className="text-[10px] text-center px-2 line-clamp-2 text-foreground/55">{item.filename}</span>
        </button>
      )}
      <span className="absolute top-2 left-2 text-[9px] uppercase tracking-[0.16em] font-bold text-ivory bg-charcoal/55 backdrop-blur px-2 py-0.5 rounded-full">
        {kind === "music" ? "audio" : kind}
      </span>
      {item.folder && (
        <span className="absolute top-2 right-2 text-[9px] font-medium text-ivory bg-charcoal/55 backdrop-blur px-2 py-0.5 rounded-full max-w-[60%] truncate" title={item.folder}>
          {item.folder}
        </span>
      )}
      <span className="absolute inset-0 flex items-center justify-center bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors pointer-events-none">
        <span className="h-10 w-10 rounded-full bg-ivory/90 text-charcoal flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="h-4 w-4 ml-0.5" />
        </span>
      </span>
      <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
        <button onClick={(e) => { e.stopPropagation(); onSend(item); }} disabled={sending}
          className="h-8 w-8 rounded-full bg-charcoal/70 text-ivory flex items-center justify-center disabled:opacity-50" title="Verzend naar GIULIA">
          {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button onClick={(e) => e.stopPropagation()} className="h-8 w-8 rounded-full bg-charcoal/70 text-ivory flex items-center justify-center" title="Verplaats naar map">
              <Folder className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-charcoal text-ivory border-white/10">
            <DropdownMenuItem onClick={() => onMove(item.id, "")} className="text-[12px] focus:bg-ivory/10">Geen map</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-ivory/10" />
            {folders.map((f) => (
              <DropdownMenuItem key={f} onClick={() => onMove(item.id, f)} className="text-[12px] focus:bg-ivory/10">{f}</DropdownMenuItem>
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