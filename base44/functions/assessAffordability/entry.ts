import { geminiDecide } from '../../shared/gemini.ts';

/**
 * assessAffordability — GIULIA's financiële geweten. Beoordeelt een voorgestelde
 * uitgave tegen de volledige actuele financiële context (snapshot vanuit de
 * frontend). Geeft een genuanceerd oordeel (niet alleen ja/nee), impulse check,
 * eventuele wachttijd en advies. Via de Calculator-Gemini-sleutel (BYOK).
 *
 * Aanroep: { query, snapshot }  →  { ok, data }
 */
const SCHEMA = {
  type: "object",
  properties: {
    verdict: { type: "string", enum: ["SAFE_TO_BUY", "AFFORDABLE_BUT_WAIT", "NOT_A_GOOD_IDEA_RIGHT_NOW", "DO_NOT_BUY", "NEEDS_MORE_INFORMATION"] },
    verdictLabel: { type: "string", description: "Korte Nederlandse label" },
    reasoning: { type: "array", items: { type: "string" }, description: "2-4 korte Nederlandse zinnen waarom" },
    impulseCheck: { type: "string", description: "Als de aankoop relatief groot is t.o.v. de vrije ruimte: een nuchtere opmerking. Leeg als niet van toepassing." },
    waitingPeriod: { type: "string", description: "Voorgestelde wachttijd (bv. 'Wacht 48 uur', 'Wacht tot volgend inkomen', 'Wacht tot potjes hersteld') of leeg" },
    advice: { type: "string", description: "Kort financieel advies, of leeg" },
  },
  required: ["verdict", "reasoning"],
};

export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = body.query;
    const snapshot = body.snapshot || "";
    if (!query) return Response.json({ ok: false, error: "query required" }, { status: 400 });

    const prompt =
      "Je bent GIULIA's financiële geweten voor Salvo. Je beoordeelt of een voorgestelde uitgave financieel verstandig is, gegeven zijn volledige actuele situatie.\n\n" +
      "KERNPRINCIPE: 'Having money is not the same as having money available to spend.' En: 'Good financial decisions protect your future freedom, not just your current ability to pay.'\n\n" +
      "METHODE:\n" +
      "1. Bepaal of Salvo dit kan betalen vanuit zijn ECHT VRIJE ruimte (kunnen besteden), niet enkel zijn saldo.\n" +
      "2. Wees genuanceerd — niet alleen ja/nee. Oordeel: SAFE_TO_BUY, AFFORDABLE_BUT_WAIT, NOT_A_GOOD_IDEA_RIGHT_NOW, DO_NOT_BUY, of NEEDS_MORE_INFORMATION.\n" +
      "3. Als de aankoop relatief groot is t.o.v. de vrije ruimte, geef een nuchtere impulse check (niet betuttelend).\n" +
      "4. Voor grotere/niet-noodzakelijke aankopen kan je een wachttijd voorstellen als ingebouwde frictie (geen straf).\n" +
      "5. Persoonlijke veiligheidsregel: financiële impulsiviteit is voor Salvo een relevant risico. Bij signalen van potentieel impulsief uitgeven, wees extra voorzichtig — maar reageer alleen op financiële signalen, diagnosticeer geen stemmingstoestand.\n" +
      "6. Spreek Salvo aan met 'je'. Schrijf Nederlands. Wees concreet met bedragen uit de context.\n\n" +
      `Voorgestelde uitgave / vraag van Salvo: "${query}"\n\n` +
      `Actuele financiële context:\n${snapshot}\n\n` +
      "Geef geldige JSON per schema.";

    const data = await geminiDecide({ prompt, schema: SCHEMA, keyName: "Calculator_Gemini_API_Key", temperature: 0.4 });
    if (!data) return Response.json({ ok: false, error: "generation failed" }, { status: 502 });
    return Response.json({ ok: true, data });
  } catch (error) {
    return Response.json({ ok: false, error: String(error.message) }, { status: 500 });
  }
}