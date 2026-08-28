import React, { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMediaLibrary, kindOfUpload } from "@/lib/useMediaLibrary";
import { useMediaViewer } from "@/lib/MediaViewerContext";
import { Image } from "@/components/ui/image";
import { Upload, Trash2, ArrowLeft, Film, Music, FileText, ImageIcon, Play, Loader2, Cloud, HardDrive, FolderPlus, Pencil, Folder } from "lucide-react";
import LocalMedia from "@/system/pages/media/LocalMedia";

const TABS = [
  { key: "all", label: "Alles" },
  { key: "image", label: "Foto's" },
  { key: "video", label: "Video" },
  { key: "music", label: "Audio" },
  { key: "doc", label: "Docs" },
];

const SOURCES = [
  { key: "cloud", label: "Cloud", icon: Cloud },
  { key: "local", label: "Lokaal", icon: HardDrive },
];

function KindIcon({ kind, className }) {
  if (kind === "video") return <Film className={className} />;
  if (kind === "music") return <Music className={className} />;
  if (kind === "doc") return <FileText className={className} />;
  return <ImageIcon className={className} />;
}

function CloudThumb({ item, onOpen, onRemove, onRename, onMove }) {
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
      <span className="absolute inset-0 flex items-center justify-center bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors pointer-events-none">
        <span className="h-10 w-10 rounded-full bg-ivory/90 text-charcoal flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="h-4 w-4 ml-0.5" />
        </span>
      </span>
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={(e) => { e.stopPropagation(); onRename(item); }}
          className="h-8 w-8 rounded-full bg-charcoal/60 text-ivory flex items-center justify-center"
          title="Hernoem"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onMove(item); }}
          className="h-8 w-8 rounded-full bg-charcoal/60 text-ivory flex items-center justify-center"
          title="Verplaats naar map"
        >
          <Folder className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
          className="h-8 w-8 rounded-full bg-charcoal/60 text-ivory flex items-center justify-center"
          title="Verwijder"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function CloudMedia() {
  const { items, loading, uploading, upload, remove, rename, setFolder } = useMediaLibrary();
  const { openMedia } = useMediaViewer();
  const fileRef = useRef(null);
  const [tab, setTab] = useState("all");
  const [folder, setFolderState] = useState(null); // null = alles

  const folders = useMemo(() => [...new Set((items || []).map((i) => i.folder).filter(Boolean))], [items]);

  const visible = useMemo(() => {
    return (items || []).filter((i) => (tab === "all" || kindOfUpload(i) === tab) && (folder == null || i.folder === folder));
  }, [items, tab, folder]);

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

  const doMove = (item) => {
    const name = window.prompt("Naam van de map", item.folder || "");
    if (name !== null) setFolder(item.id, name.trim());
  };

  const newFolder = () => {
    const name = window.prompt("Naam van de nieuwe map");
    if (name && name.trim()) setFolderState(name.trim());
  };

  return (
    <div>
      {/* Mappen-balk */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => setFolderState(null)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${folder == null ? "bg-charcoal text-ivory" : "bg-foreground/[0.04] text-foreground/60 hover:text-foreground"}`}
        >
          <Folder className="h-3.5 w-3.5" /> Alles
        </button>
        {folders.map((f) => (
          <button
            key={f}
            onClick={() => setFolderState(f)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${folder === f ? "bg-charcoal text-ivory" : "bg-foreground/[0.04] text-foreground/60 hover:text-foreground"}`}
          >
            <Folder className="h-3.5 w-3.5" /> {f}
          </button>
        ))}
        {folder && !folders.includes(folder) && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-charcoal text-ivory">
            <Folder className="h-3.5 w-3.5" /> {folder}
          </span>
        )}
        <button onClick={newFolder} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-foreground/[0.04] text-foreground/60 hover:text-foreground transition">
          <FolderPlus className="h-3.5 w-3.5" /> Nieuwe map
        </button>
        {folder && (
          <span className="text-[10px] text-foreground/45 ml-1">Uploads gaan naar: <b className="text-foreground/70">{folder}</b></span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex items-center gap-1 bg-foreground/[0.04] border border-foreground/10 rounded-full p-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((t) => (
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
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading > 0}
          className="sm:ml-auto inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold bg-charcoal text-ivory disabled:opacity-60"
        >
          {uploading > 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading > 0 ? `Uploaden (${uploading})…` : "Upload media"}
        </button>
        <input ref={fileRef} type="file" accept="image/*,video/*,audio/*,application/pdf,.pdf" multiple className="hidden" onChange={onFiles} />
      </div>

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
            Nog geen media hier. Upload een foto, video, audio of pdf — of schakel naar Lokaal voor je schijf.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {visible.map((item) => (
            <CloudThumb key={item.id} item={item} onOpen={open} onRemove={remove} onRename={doRename} onMove={doMove} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MediaPlayer() {
  const [source, setSource] = useState("cloud");

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-6">
        <Link to="/" className="text-xs text-foreground/60 hover:text-foreground inline-flex items-center gap-1 mb-2">
          <ArrowLeft className="h-3 w-3" /> Dashboard
        </Link>
        <h1 className="text-3xl font-display font-semibold tracking-[-0.02em]">Media</h1>
        <p className="text-sm text-foreground/60 mt-1 max-w-xl">
          Jouw bibliotheek: upload documenten naar de cloud of kies vanaf je schijf. Maak mappen, hernoem of verwijder — alles op één plek.
        </p>
      </div>

      <div className="flex items-center gap-1 bg-foreground/[0.04] border border-foreground/10 rounded-full p-1 mb-6 w-fit">
        {SOURCES.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              onClick={() => setSource(s.key)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition ${
                source === s.key ? "bg-charcoal text-ivory" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {s.label}
            </button>
          );
        })}
      </div>

      {source === "cloud" ? <CloudMedia /> : <LocalMedia />}
    </div>
  );
}