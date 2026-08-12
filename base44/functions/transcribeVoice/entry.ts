import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { geminiTranscribe } from '../../shared/gemini.ts';

/**
 * transcribeVoice — zet een opgenomen audiofragment (base64) om in tekst via de
 * eigen multimodale Gemini-sleutel. Vervangt Core.UploadFile + Core.TranscribeAudio
 * (integration credits). Verwacht { audio: "data:audio/webm;base64,..." } of
 * { audio: "<base64>", mime: "audio/webm" }.
 */
export default async function (req) {
  try {
    createClientFromRequest(req); // auth
    const body = await req.json().catch(() => ({}));
    const raw = body.audio || body.data || "";
    if (!raw) return Response.json({ error: "No audio provided" }, { status: 400 });

    let base64 = raw;
    let mime = body.mime || body.mimeType || "audio/webm";
    const m = String(raw).match(/^data:([^;]+);base64,(.*)$/);
    if (m) { mime = m[1]; base64 = m[2]; }

    const text = await geminiTranscribe({ audioBase64: base64, mimeType: mime });
    return Response.json({ text: text || "" });
  } catch (error) {
    return Response.json({ error: error.message, text: "" }, { status: 500 });
  }
}