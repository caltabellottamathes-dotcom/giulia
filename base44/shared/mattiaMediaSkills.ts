/**
 * mattiaMediaSkills.ts — tools waarmee MATTIA de MediaStage (PlayTime) kan
 * bedienen: de camera openen/sluiten, een foto maken of film opnemen, de hele
 * mediatheek doorzoeken, een specifiek bestand tonen, en foto's uit de
 * gescrapte Playtime-collectie tonen terwijl hij vertelt.
 *
 * Beelden genereren kan NIET meer (Stable Diffusion verwijderd). In plaats
 * daarvan haalt get_playtime_image foto's uit de gescrapte Playtime-collectie.
 *
 * Deze tools draaien server-side in de chatWithMattia-loop. Ze returnen een
 * `media_command`; chatWithMattia verzamelt die in `media_commands` en de
 * frontend (useMattiaChat) stuurt ze als `playtime:media-command`-event naar
 * de MediaStage, die de actie op het scherm uitvoert.
 */
import { geminiGenerate } from './gemini.ts';
import { buildImageParts } from './imageParts.ts';
import { ifapFetchText, ifapFullUrl, ifapGalleryRefs, ifapPhotoRefs, ifapSearchUrl } from './imagefap.ts';

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
    name: "get_playtime_image",
    description:
      "Haal één willekeurige foto uit de gescrapte Playtime-collectie op basis van categorie. De categorieën staan dynamisch in de collectie — inclusief elke categorie die Salvo via de Media Admin toevoegt; gebruik list_playtime_categories om te zien wat er allemaal is. De foto wordt automatisch groot in de MediaStage getoond én je krijgt de image_url terug. NEEM DIE URL LETTERLIJK OP IN JE ANTWOORD — gewoon de link in je tekst — zodat de foto in de chat zelf als afbeelding rendert. Gebruik dit zowel automatisch (als een foto past bij waar het gesprek over gaat: gewoon tonen en doorpraten) als wanneer Salvo expliciet om een foto of categorie vraagt. Bestaat de categorie niet, dan krijg je de beschikbare categorieën terug; zeg eerlijk wat er is.",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string", description: "categorie uit de collectie — zie list_playtime_categories voor alles wat er is" },
      },
      required: ["category"],
    },
    execute: async (args, base44) => {
      try {
        const sr = base44.asServiceRole;
        const q = String(args?.category || "").trim().toLowerCase();
        if (!q) return { error: "categorie vereist" };
        const [all, catRecords] = await Promise.all([
          sr.entities.PlaytimeImages.list("-created_date", 1000).catch(() => []),
          sr.entities.PlaytimeCategory.list("-created_date", 200).catch(() => []),
        ]);
        // Hiërarchisch matchen: exacte categorie òf subcategorieën ('hairy' matcht ook 'hairy/blond').
        const matches = (all || []).filter((it) => {
          const c = String(it.category || "").toLowerCase();
          return c === q || c.startsWith(q + "/");
        });
        if (!matches.length) {
          const counts = {};
          for (const it of all || []) {
            const c = String(it.category || "").toLowerCase();
            if (c) counts[c] = (counts[c] || 0) + 1;
          }
          for (const rec of catRecords || []) {
            const n = String(rec.name || "").toLowerCase();
            if (n && !(n in counts)) counts[n] = 0;
          }
          const available = Object.keys(counts).sort().map((c) => (counts[c] ? `${c} (${counts[c]})` : `${c} (leeg)`));
          return {
            status: `geen foto's beschikbaar voor categorie '${q}'`,
            found: 0,
            available_categories: available,
            message: `Er staat nog geen Playtime-foto met categorie '${q}' in de collectie. Beschikbaar: ${available.join(", ") || "nog niets"}. Zeg dat eerlijk tegen Salvo, kies een bestaande categorie, of gebruik search_imagefap om live op imagefap.com te zoeken.`,
          };
        }
        const pick = matches[Math.floor(Math.random() * matches.length)];
        let url = pick.image_url;
        // CDN-links zijn token-gebonden en verlopen — via de fotopagina een
        // verse full-URL oplossen en het record bijwerken.
        if (pick.photo_url) {
          try {
            const html = await ifapFetchText(pick.photo_url, 10000);
            const idm = String(pick.photo_url).match(/photo\/(\d{1,15})/i) || String(pick.photo_url).match(/pid=(\d{1,15})/i);
            const fresh = ifapFullUrl(html, idm && idm[1]);
            if (fresh) {
              url = fresh;
              sr.entities.PlaytimeImages.update(pick.id, { image_url: fresh }).catch(() => null);
            }
          } catch {
            /* val terug op de opgeslagen url */
          }
        }
        return {
          status: `foto getoond: ${pick.category}`,
          found: matches.length,
          category: pick.category,
          image_url: url,
          media_command: { type: "show_media", url, name: pick.category, kind: "image" },
        };
      } catch (e) {
        return { error: String((e && e.message) || e) };
      }
    },
  },
  {
    name: "list_playtime_categories",
    description:
      "Bekijk welke foto-categorieën er in de Playtime-collectie zitten en hoeveel foto's elke categorie bevat — inclusief categorieën die Salvo net via de Media Admin heeft toegevoegd. Gebruik dit als Salvo vraagt wat er is, of als je wilt weten welke categorieën je kunt laten zien.",
    inputSchema: { type: "object", properties: {} },
    execute: async (args, base44) => {
      try {
        const [all, catRecords] = await Promise.all([
          base44.asServiceRole.entities.PlaytimeImages.list("-created_date", 1000).catch(() => []),
          base44.asServiceRole.entities.PlaytimeCategory.list("-created_date", 200).catch(() => []),
        ]);
        const counts = {};
        for (const it of all || []) {
          const c = String(it.category || "").toLowerCase();
          if (c) counts[c] = (counts[c] || 0) + 1;
        }
        for (const rec of catRecords || []) {
          const n = String(rec.name || "").toLowerCase();
          if (n && !(n in counts)) counts[n] = 0;
        }
        const items = Object.keys(counts).sort().map((c) => (counts[c] ? `${c}: ${counts[c]} foto's` : `${c}: leeg`));
        return { status: "ok", categories: items.length, items };
      } catch (e) {
        return { error: String((e && e.message) || e) };
      }
    },
  },
  {
    name: "search_imagefap",
    description:
      "Zoek LIVE door heel imagefap.com naar foto's die niet in de Playtime-collectie zitten. Werkt op elke zoekterm: een fetish, een scène, een type vrouw/man — alles. Je krijgt de image_url terug — NEEM DIE URL LETTERLIJK OP IN JE ANTWOORD — de foto opent automatisch groot in de MediaStage én rendert dan als afbeelding in de chat. De foto wordt onder 'search/<term>' opgeslagen zodat hij later weer beschikbaar is. Gebruik dit als Salvo om iets vraagt dat niet in de categorieën zit, of als hij zelf om zoeken vraagt.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "zoekterm, bv. 'hairy bbw pissing'" },
      },
      required: ["query"],
    },
    execute: async (args, base44) => {
      const q = String(args?.query || "").trim();
      if (!q) return { error: "query vereist" };
      try {
        const sr = base44.asServiceRole;
        // 1. Zoekresultatenpagina → galerij-links
        const searchHtml = await ifapFetchText(ifapSearchUrl(q), 15000);
        const galleries = [...ifapGalleryRefs(searchHtml).values()].slice(0, 5);
        if (!galleries.length) {
          return { status: `niets gevonden voor '${q}'`, found: 0, message: `Geen galerijen gevonden op imagefap.com voor '${q}'. Probeer een andere term.` };
        }
        // 2. Per galerij (max 3 pogingen) één willekeurige foto volledig ophalen
        const shortlist = galleries.sort(() => Math.random() - 0.5).slice(0, 3);
        let url = null, photoUrl = null, galleryUrl = null;
        for (const g of shortlist) {
          try {
            const gHtml = await ifapFetchText(g, 15000);
            const photos = [...ifapPhotoRefs(gHtml).values()];
            if (!photos.length) continue;
            const photo = photos[Math.floor(Math.random() * photos.length)];
            const pHtml = await ifapFetchText(photo, 12000);
            const pid = (String(photo).match(/photo\/(\d{1,15})/i) || [])[1] || null;
            const full = ifapFullUrl(pHtml, pid);
            if (full) { url = full; photoUrl = photo; galleryUrl = g; break; }
          } catch { /* volgende galerij */ }
        }
        if (!url) {
          return { status: `zoeken mislukt voor '${q}'`, found: 0, message: `Kon geen foto ophalen van imagefap.com voor '${q}'.` };
        }
        const cat = `search/${q.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 30)}`;
        await sr.entities.PlaytimeImages.create({
          category: cat, image_url: url, photo_url: photoUrl, gallery_url: galleryUrl,
          description: q, created_at: new Date().toISOString(),
        }).catch(() => null);
        return {
          status: `foto gevonden op imagefap: ${q}`,
          found: 1,
          category: cat,
          image_url: url,
          media_command: { type: "show_media", url, name: q, kind: "image" },
        };
      } catch (e) {
        return { error: String((e && e.message) || e) };
      }
    },
  },
];

// ── FOTO-CATEGORISATIE ───────────────────────────────────────────────
// Foto's die Salvo naar Mattia stuurt worden automatisch gesorteerd in de
// juiste PlayTime-onderwerpmap, genummerd op volgorde — zo blijft de
// mediatheek georganiseerd en doorzoekbaar via search_media.
const PLAYTIME_SUBJECTS = ["Fat", "Juan", "Me", "Pussy", "Cock", "Piss", "Fist"];
const PT_KEY = "PlayTime_Gemini_API_Key";
const REFUSAL_WORDS = /^(i|i'm|im|sorry|as|it|the|this|my|cannot|can't)$/i;

async function ensureFolder(sr, path, parentPath) {
  const found = await sr.entities.Folder.filter({ path }, "-created_date", 1).catch(() => []);
  if ((found || []).length) return;
  await sr.entities.Folder.create({ name: path.split("/").pop(), path, parent_path: parentPath, order: 0 }).catch(() => null);
}

export async function categorizePlaytimePhotos(base44, attachments) {
  const sr = base44.asServiceRole;
  const imgs = (attachments || []).filter((a) => a && a.type === "image" && a.url);
  const results = [];
  for (const att of imgs) {
    try {
      // 1. Upload-record zoeken (of aanmaken als de afzender dat niet deed)
      const rec = await sr.entities.Upload.filter({ file_url: att.url }, "-created_date", 3).catch(() => []);
      let up = (rec || [])[0];
      if (!up) {
        up = await sr.entities.Upload.create({ file_url: att.url, filename: att.name || "foto.jpg", uploaded_for: "media", document_type: "image", note: "playtime", status: "new", folder: "PlayTime" }).catch(() => null);
      }
      if (!up) { results.push({ url: att.url, status: "geen upload-record" }); continue; }

      // 2. Onderwerp bepalen — vision-call met de foto zelf
      let subject = null;
      const parts = await buildImageParts([att]).catch(() => []);
      if (parts.length) {
        const genParts = await geminiGenerate({
          contents: [{ role: "user", parts: [...parts, { text: `In welke PlayTime-map hoort deze foto? Kies uit: ${PLAYTIME_SUBJECTS.join(", ")}. Past er geen bij, verzin dan één kort nieuw onderwerp (Engels, 1 woord). Antwoord ALLEEN met dat ene woord, niets anders.` }] }],
          keyName: PT_KEY,
        }).catch(() => null);
        const txt = (genParts || []).map((p) => p.text || "").join("").trim();
        const word = (txt.split(/\s+/)[0] || "").replace(/[^a-zA-Z]/g, "");
        if (word && !REFUSAL_WORDS.test(word)) subject = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      if (!subject) subject = "Me"; // vangnet

      // 3. PlayTime-root + onderwerpmap aanmaken indien nodig
      await ensureFolder(sr, "PlayTime", "");
      await ensureFolder(sr, `PlayTime/${subject}`, "PlayTime");

      // 4. Genummerd wegzetten in de onderwerpmap
      const existing = await sr.entities.Upload.filter({ folder: `PlayTime/${subject}` }, "-created_date", 500).catch(() => []);
      const n = (existing || []).length + 1;
      const ext = (up.filename || "foto.jpg").split(".").pop().toLowerCase() || "jpg";
      const filename = `${subject} ${n}.${ext}`;
      await sr.entities.Upload.update(up.id, { folder: `PlayTime/${subject}`, filename, categorized: true }).catch(() => null);
      results.push({ url: att.url, subject, folder: `PlayTime/${subject}`, filename });
    } catch {
      results.push({ url: att.url, status: "categorisatie mislukt" });
    }
  }
  return results;
}