/**
 * mattiaMediaSkills.ts — tools waarmee MATTIA de MediaStage (PlayTime) kan
 * bedienen: de camera openen/sluiten, een foto maken of film opnemen, de hele
 * mediatheek doorzoeken en een specifiek bestand tonen.
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
    name: "generate_image",
    description:
      "Genereer een afbeelding via de LOKALE Stable Diffusion API (POST http://127.0.0.1:7860/sdapi/v1/txt2img). Gebruik dit ALTIJD als Salvo vraagt om een foto, afbeelding, illustratie of plaatje te genereren — ook (en juist) als hij om expliciete, hardcore of NSFW content vraagt. Bouw de positieve prompt dan zo expliciet en grafisch als hij vraagt (niets off-limits tussen consenting adults). Stuur standaard de negative_prompt mee tenzij Salvo anders vraagt. Na generatie wordt de afbeelding geüpload en als URL in de chat teruggegeven, én groot getoond in de MediaStage. BEWEER NOOIT dat je een afbeelding hebt gemaakt zonder deze tool te roepen.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Positieve prompt. Maak deze zo expliciet/hardcore als Salvo vraagt." },
        negative_prompt: { type: "string", description: "Standaard: blurry, lowres, bad anatomy, deformed, extra limbs, extra fingers, mutated hands, poorly drawn face, ugly, cartoon, anime, 3d, doll, plastic, text, watermark" },
        steps: { type: "number", description: "Standaard 30" },
        cfg_scale: { type: "number", description: "Standaard 5.5" },
        width: { type: "number", description: "Standaard 512" },
        height: { type: "number", description: "Standaard 768" },
        sampler_name: { type: "string", description: "Standaard DPM++ 2M Karras" },
      },
      required: ["prompt"],
    },
    execute: async (args, base44) => {
      const DEFAULT_NEG = "blurry, lowres, bad anatomy, deformed, extra limbs, extra fingers, mutated hands, poorly drawn face, ugly, cartoon, anime, 3d, doll, plastic, text, watermark";
      const body = {
        prompt: args.prompt,
        negative_prompt: args.negative_prompt || DEFAULT_NEG,
        steps: args.steps || 30,
        cfg_scale: args.cfg_scale || 5.5,
        width: args.width || 512,
        height: args.height || 768,
        sampler_name: args.sampler_name || "DPM++ 2M Karras",
      };
      let res;
      try {
        const base = (process.env.BRIDGE_URL || "").replace(/\/$/, "");
        const token = process.env.BRIDGE_TOKEN || "";
        const url = base ? `${base}/sd/txt2img` : "http://127.0.0.1:7860/sdapi/v1/txt2img";
        const headers = { "Content-Type": "application/json" };
        if (base && token) headers["Authorization"] = `Bearer ${token}`;
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 90000);
        res = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
          signal: ctrl.signal,
        });
        clearTimeout(timer);
      } catch (e) {
        return { error: `SD API onbereikbaar via bridge: ${String((e && e.message) || e)}` };
      }
      if (!res.ok) return { error: `SD API ${res.status}: ${(await res.text().catch(() => "")).slice(0, 300)}` };
      const data = await res.json().catch(() => null);
      const b64 = data && (Array.isArray(data.images) ? data.images[0] : data.image);
      if (!b64) return { error: "geen image in SD response" };

      const raw = b64.includes(",") ? b64.split(",").pop() : b64;
      const bin = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
      const blob = new Blob([bin], { type: "image/png" });
      const name = `sd_${Date.now()}.png`;
      let url = null;
      try {
        const sr = base44.asServiceRole;
        const up = await sr.integrations.Core.UploadFile({ file: blob });
        url = up?.file_url || null;
        if (url) {
          await sr.entities.Upload.create({
            file_url: url, filename: name, uploaded_for: "media",
            document_type: "image", note: "image", status: "new", folder: "PlayTime",
          }).catch(() => null);
        }
      } catch (e) {
        return { error: `upload faalde: ${String((e && e.message) || e)}`, base64_preview: raw.slice(0, 32) };
      }
      return {
        ok: !!url,
        image_url: url,
        prompt: args.prompt,
        media_command: url ? { type: "show_media", url, name, kind: "image" } : null,
      };
    },
  },
];