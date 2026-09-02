/**
 * mattiaMediaSkills.ts — tools waarmee MATTIA de MediaStage (PlayTime) kan
 * bedienen: de camera openen/sluiten, een foto maken of film opnemen, de hele
 * mediatheek doorzoeken, een specifiek bestand tonen, en foto's uit de
 * PlayTime-map (submappen per naam/persoon) tonen terwijl hij vertelt.
 *
 * Beelden genereren kan NIET meer (Stable Diffusion verwijderd). In plaats
 * daarvan haalt show_playtime_photo foto's uit de bestaande PlayTime-map.
 *
 * Deze tools draaien server-side in de chatWithMattia-loop. Ze returnen een
 * `media_command`; chatWithMattia verzamelt die in `media_commands` en de
 * frontend (useMattiaChat) stuurt ze als `playtime:media-command`-event naar
 * de MediaStage, die de actie op het scherm uitvoert.
 */
const IMG_EXTS = ["png", "jpg", "jpeg", "gif", "webp"];
const VID_EXTS = ["mp4", "mov", "webm", "mkv"];
const AUD_EXTS = ["mp3", "wav", "m4a", "flac", "aac", "ogg"];

function kindFromName(name) {
  const ext = (name || "").split(".").pop().split("?")[0].toLowerCase();
  if (IMG_EXTS.includes(ext)) return "image";
  if (VID_EXTS.includes(ext)) return "video";
  if (AUD_EXTS.includes(ext)) return "music";
  return "doc";
}

export const MATTIA_MEDIA_SKILLS = [
  {
    name: "control_camera",
    description:
      "Bedien de camera in de MediaStage (PlayTime). action: 'open' (zet camera aan & toon camera-tab), 'close' (sluit camera & terug naar bibliotheek), 'photo' (maak nu een foto), 'start_film' (begin video-opname), 'stop_film' (stop video-opname). Foto's en films worden automatisch in de map PlayTime opgeslagen.",
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["open", "close", "photo", "start_film", "stop_film"] },
      },
      required: ["action"],
    },
    execute: async (args) => {
      const action = args?.action;
      if (!["open", "close", "photo", "start_film", "stop_film"].includes(action)) {
        return { error: "unknown action", status: "onbekende actie" };
      }
      const status = {
        open: "camera aangezet",
        close: "camera uit",
        photo: "foto gemaakt en opgeslagen in PlayTime",
        start_film: "video-opname gestart",
        stop_film: "video-opname gestopt en opgeslagen in PlayTime",
      }[action];
      return { status, media_command: { type: "camera", action } };
    },
  },
  {
    name: "search_media",
    description:
      "Doorzoek de volledige Media Library (cloud-mediatheek). Geef een zoekterm (query) en optioneel een soort (image/video/music/doc). Geeft de matches terug als lijst en toont de bibliotheek-tab in de MediaStage met die filter.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "zoekterm op bestandsnaam of map" },
        kind: { type: "string", enum: ["image", "video", "music", "doc"] },
      },
    },
    execute: async (args, base44) => {
      try {
        const sr = base44.asServiceRole;
        const all = await sr.entities.Upload.filter({ uploaded_for: "media" }, "-created_date", 500).catch(() => []);
        const q = (args?.query || "").toLowerCase().trim();
        const kind = args?.kind;
        let matches = (all || []).filter((it) => {
          if (kind && kindFromName(it.filename) !== kind) return false;
          if (q) {
            const fn = (it.filename || "").toLowerCase();
            const folder = (it.folder || "").toLowerCase();
            if (!(fn.includes(q) || folder.includes(q))) return false;
          }
          return true;
        });
        return {
          count: matches.length,
          items: matches.slice(0, 20).map((it) => `${it.filename || "bestand"} | ${it.file_url} | ${it.folder || "Losse bestanden"}`),
          media_command: { type: "show_library", query: q, kind: kind || null },
        };
      } catch (e) {
        return { error: String((e && e.message) || e) };
      }
    },
  },
  {
    name: "show_media",
    description:
      "Toon een specifiek bestand groot in de MediaStage. Geef url, name en kind (image/video/music/doc) mee — haal de url uit search_media.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string" },
        name: { type: "string" },
        kind: { type: "string", enum: ["image", "video", "music", "doc"] },
      },
      required: ["url"],
    },
    execute: async (args) => {
      if (!args?.url) return { error: "url required" };
      return { status: "toon bestand", media_command: { type: "show_media", url: args.url, name: args.name || "bestand", kind: args.kind || "image" } };
    },
  },
  {
    name: "show_playtime_photo",
    description:
      "Haal een foto uit de PlayTime-map (met submappen per naam/persoon) en toon hem groot in de MediaStage tijdens het gesprek. Geef een naam of zoekterm mee (bv. 'Carina', 'Johan', 'Timo', 'Debora', 'Nancy', 'Soraya'). De tool zoekt in de PlayTime-map en submappen naar een matchende foto (op bestandsnaam of mapnaam) en opent een willekeurige ervan op het scherm. Gebruik dit terwijl je vertelt over iemand of een scene, in plaats van zelf beelden te genereren. Bij geen match gebeurt er niets.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "naam of zoekterm, bv. 'Carina', 'Johan', 'Timo', 'Debora', 'Nancy', 'Soraya'" },
      },
      required: ["name"],
    },
    execute: async (args, base44) => {
      try {
        const sr = base44.asServiceRole;
        const all = await sr.entities.Upload.filter({ uploaded_for: "media" }, "-created_date", 500).catch(() => []);
        const q = (args?.name || "").toLowerCase().trim();
        const inPlay = (it) => /playtime/i.test(it.folder || "");
        const imgs = (all || []).filter((it) => inPlay(it) && kindFromName(it.filename) === "image");
        let matches = imgs;
        if (q) {
          matches = imgs.filter((it) => {
            const fn = (it.filename || "").toLowerCase();
            const folder = (it.folder || "").toLowerCase();
            return fn.includes(q) || folder.includes(q);
          });
          if (!matches.length) matches = imgs; // fallback: any PlayTime photo
        }
        if (!matches.length) return { status: "geen foto's in PlayTime-map", found: 0 };
        const pick = matches[Math.floor(Math.random() * matches.length)];
        return {
          status: "foto uit PlayTime getoond",
          found: matches.length,
          media_command: { type: "show_media", url: pick.file_url, name: pick.filename, kind: "image" },
        };
      } catch (e) {
        return { error: String((e && e.message) || e) };
      }
    },
  },
];