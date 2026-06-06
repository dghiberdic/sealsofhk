import type { SupportedMediaType } from "./extractLabs";

// ---------------------------------------------------------------------------
// Read an eHealth / clinical summary record (PDF or photo) into the profile's
// clinical fields, via Claude vision. Same browser-fetch approach as the lab
// extractor (see extractLabs.ts for the rationale). Always confirmed by the
// user before it touches the profile.
// ---------------------------------------------------------------------------

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

export interface EHealthRecord {
  conditions: string[];
  medications: string[];
  allergies: string[];
  diabetes: boolean;
  onBpMeds: boolean;
  smoker: "never" | "former" | "current" | null;
}

const SYSTEM = `You read a patient's eHealth / clinical summary (a "Patient Medical Summary", problem list, or medication record) from a photo or PDF and return a structured JSON object.

Return ONLY a single JSON object — no prose, no markdown fences.

Shape:
{"conditions":string[],"medications":string[],"allergies":string[],"diabetes":boolean,"onBpMeds":boolean,"smoker":"never"|"former"|"current"|null}

Rules:
- "conditions": active diagnoses, in plain English (e.g. "Type 2 diabetes mellitus", "Essential hypertension"). Drop billing codes.
- "medications": current medications with dose if shown (e.g. "Metformin 500mg twice daily").
- "allergies": known drug/substance allergies; [] if none recorded.
- "diabetes": true if any diabetes diagnosis appears in the conditions.
- "onBpMeds": true if any blood-pressure medication is present (e.g. amlodipine, lisinopril, losartan, ramipril, atenolol, bisoprolol, hydrochlorothiazide) OR the record states the patient is on BP medication.
- "smoker": from any smoking/lifestyle field — "never", "former", or "current"; null if not stated.
- Read both English and Chinese text if present. Omit anything illegible; never invent. If nothing is readable, return all empty arrays/false/null.`;

function stripToJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start)
    throw new Error("Claude did not return JSON we could read.");
  return body.slice(start, end + 1);
}

function coerce(raw: unknown): EHealthRecord {
  const o = raw as Partial<EHealthRecord>;
  const arr = (x: unknown): string[] =>
    Array.isArray(x) ? x.map(String).map((s) => s.trim()).filter(Boolean) : [];
  const smoker =
    o.smoker === "never" || o.smoker === "former" || o.smoker === "current"
      ? o.smoker
      : null;
  return {
    conditions: arr(o.conditions),
    medications: arr(o.medications),
    allergies: arr(o.allergies),
    diabetes: Boolean(o.diabetes),
    onBpMeds: Boolean(o.onBpMeds),
    smoker,
  };
}

export async function extractEHealthFromFile(opts: {
  apiKey: string;
  base64: string;
  mediaType: SupportedMediaType;
  model?: string;
}): Promise<EHealthRecord> {
  const source =
    opts.mediaType === "application/pdf"
      ? {
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: opts.base64 },
        }
      : {
          type: "image",
          source: { type: "base64", media_type: opts.mediaType, data: opts.base64 },
        };

  let res: Response;
  try {
    res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": opts.apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: opts.model || "claude-haiku-4-5",
        max_tokens: 2048,
        system: SYSTEM,
        messages: [
          {
            role: "user",
            content: [
              source,
              { type: "text", text: "Read this clinical record and return the JSON." },
            ],
          },
        ],
      }),
    });
  } catch {
    throw new Error("Couldn't reach Claude — check your internet connection.");
  }

  if (!res.ok) {
    let detail = "";
    try {
      const j = (await res.json()) as { error?: { message?: string } };
      detail = j.error?.message ?? "";
    } catch {
      /* ignore */
    }
    if (res.status === 401)
      throw new Error("That API key was rejected. Check it and try again.");
    if (res.status === 429)
      throw new Error("Anthropic is rate-limiting right now — wait a moment and retry.");
    throw new Error(`Couldn't read the record (${res.status}). ${detail}`.trim());
  }

  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const textBlock = data.content?.find((b) => b.type === "text");
  if (!textBlock?.text) throw new Error("Claude returned no text to read.");
  return coerce(JSON.parse(stripToJson(textBlock.text)));
}
