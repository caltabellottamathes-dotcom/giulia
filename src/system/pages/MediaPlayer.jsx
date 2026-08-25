import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMediaLibrary, kindOfUpload } from "@/lib/useMediaLibrary";
import { useMediaViewer } from "@/lib/MediaViewerContext";
import { Image } from "@/components/ui/image";
import { Upload, Trash2, ArrowLeft, Film, Music, ImageIcon, Play, Loader2, Cloud, HardDrive } from "lucide-react";
import LocalMedia from "@/system/pages/media/LocalMedia";

const TABS = [
  { key: "all", label: "Alles" },
  { key: "image", label: "Foto's" },
  { key: "video", label: "Video" },
  { key: "music", label: "Audio" },
];

const SOURCES = [
  { key: "cloud", label: "Cloud", icon: Cloud },
  { key: "local", label: "Lokaal", icon: HardDrive },
];

function CloudThumb({ item, onOpen, onRemove }) {
  const kind = kindOfUpload(item);
  return (
    <button
      onClick={() => onOpen(item)}
      className="group relative aspect-square rounded-2xl overflow-hidden ring-1 ring-foreground/10 bg-foreground/[0.04] flex items-center justify-center text-left"
    >
      {kind === "image" ? (
        <Image src={item.file_url} className="h-full w-full" fittingType="fill" />
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 text-foreground/45">
          {kind === "video" ? <Film className="h-7 w-7" /> : <Music className="h-7 w-7" />}
          <span className="text-[10px] text-center px-2 line-clamp-2 text-foreground/55">{item.filename}</span>
        </div>
      )}
      <span className="absolute top-2 left-2 text-[9px] uppercase tracking-[0.16em] font-bold text-ivory bg-charcoal/55 backdrop-blur px-2 py-0.5 rounded-full">
        {kind === "music" ? "audio" : kind}
      </span>
      <span className="absolute inset-0 flex items-center justify-center bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors">
        <span className="h-10 w-10 rounded-full bg-ivory/90 text-charcoal flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="h-4 w-4 ml-0.5" />
        </span>
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-charcoal/60 text-ivory flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </button>
  );
}

function CloudMedia() {
  const { items, loading, uploading, upload, remove } = useMediaLibrary();
  const { openMedia } = useMediaViewer();
  const fileRef = useRef(null);
  const [tab, setTab] = useState("all");

  const visible = tab === "all" ? items : items.filter((i) => kindOfUpload(i) === tab);
  const counts = {
    all: items.length,
    image: items.filter((i) => kindOfUpload(i) === "image").length,
    video: items.filter((i) => kindOfUpload(i) === "video").length,
    music: items.filter((i) => kindOfUpload(i) === "music").length,
  };

  const onFiles = async (e) => {
    const files = [...(e.target.files || [])];
    for (const f of files) await upload(f);
    e.target.value = "";
  };

  const open = (item) => openMedia({ name: item.filename, url: item.file_url, type: kindOfUpload(item) });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex items-center gap-1 bg-foreground/[0.04] border border-foreground/10 rounded-full p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
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
        <input ref={fileRef} type="file" accept="image/*,video/*,audio/*" multiple className="hidden" onChange={onFiles} />
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
            Nog geen media in de cloud. Upload een foto, video of audio-bestand — of schakel naar Lokaal voor je schijf.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {visible.map((item) => (
            <CloudThumb key={item.id} item={item} onOpen={open} onRemove={remove} />
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
          Cloud-media worden opgeslagen en overal gesynchroniseerd. Lokale media speel je direct vanaf je schijf — niets geüpload.
        </p>
      </div>

      {/* Bron-schakelaar */}
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