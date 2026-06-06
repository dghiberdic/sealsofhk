import type { Biomarker } from "./types";

// ---------------------------------------------------------------------------
// Photo / scan → structured lab values, via Claude's vision.
//
// This is the demo's "wow factor": a user photographs a paper lab report (or
// uploads the PDF), and Claude reads the values straight off the page into the
// app's biomarker model — the user just confirms. The call runs directly from
// the browser against the Anthropic Messages API with a user-supplied key.
//
// We call the REST endpoint with `fetch` rather than the npm SDK on purpose:
// the SDK bundles an agent-toolset that imports Node built-ins (node:fs/stream/
// crypto/…), which a browser Vite build can't resolve. For a single
// messages.create call the only thing the SDK adds is two headers, which we set
// here — including `anthropic-dangerous-direct-browser-access`, the header that
// opts a browser request into Anthropic's CORS support.
//
// The values Claude returns are always shown for confirmation before saving —
// never written silently — keeping the "self-entered lab results" framing.
// ---------------------------------------------------------------------------

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

export type LabKey =
  | "totalChol"
  | "hdl"
  | "ldl"
  | "trig"
  | "apob"
  | "glucose"
  | "hba1c"
  | "crp"
  | "systolic"
  | "diastolic";

export interface ExtractedLab {
  key: LabKey;
  name: string;
  value: number;
  unit: string;
}

export interface ExtractionResult {
  results: ExtractedLab[];
  collectionDate: string | null;
}

export type SupportedMediaType =
  | "image/jpeg"
  | "image/png"
  | "image/gif"
  | "image/webp"
  | "application/pdf";

// The canonical biomarker definitions the app understands. Used to build a
// proper Biomarker entry (plain-language meaning + conservative reference band)
// when a freshly-extracted value isn't already on file. Reference bands are
// general medical knowledge, shown as guidance — never a HeartSum verdict.
const CATALOG: Record<LabKey, Omit<Biomarker, "value" | "date">> = {
  totalChol: { key: "totalChol", name: "Total cholesterol", plain: "The overall amount of cholesterol in your blood.", unit: "mmol/L", refHigh: 5.2, highIsConcern: true, fromWatch: false, generalKnowledge: true },
  hdl: { key: "hdl", name: "HDL (“good” cholesterol)", plain: "The kind that helps clear cholesterol away.", unit: "mmol/L", refLow: 1.0, highIsConcern: false, fromWatch: false, generalKnowledge: true },
  ldl: { key: "ldl", name: "LDL (“bad” cholesterol)", plain: "The kind that can build up in artery walls.", unit: "mmol/L", refHigh: 3.4, highIsConcern: true, fromWatch: false, generalKnowledge: true },
  trig: { key: "trig", name: "Triglycerides", plain: "A blood fat tied to diet and metabolism.", unit: "mmol/L", refHigh: 1.7, highIsConcern: true, fromWatch: false, generalKnowledge: true },
  apob: { key: "apob", name: "ApoB", plain: "A count of the cholesterol particles most linked to artery risk.", unit: "g/L", refHigh: 1.0, highIsConcern: true, fromWatch: false, generalKnowledge: true },
  glucose: { key: "glucose", name: "Fasting glucose", plain: "Your blood sugar after not eating overnight.", unit: "mmol/L", refHigh: 5.5, highIsConcern: true, fromWatch: false, generalKnowledge: true },
  hba1c: { key: "hba1c", name: "HbA1c", plain: "Your average blood sugar over the last ~3 months.", unit: "%", refHigh: 6.5, highIsConcern: true, fromWatch: false, generalKnowledge: true },
  crp: { key: "crp", name: "hs-CRP", plain: "A sensitive marker of low-grade inflammation.", unit: "mg/L", refHigh: 3.0, highIsConcern: true, fromWatch: false, generalKnowledge: true },
  systolic: { key: "systolic", name: "Blood pressure — systolic (from a cuff)", plain: "The top number, from a blood-pressure cuff.", unit: "mmHg", refHigh: 130, highIsConcern: true, fromWatch: false, generalKnowledge: true },
  diastolic: { key: "diastolic", name: "Blood pressure — diastolic (from a cuff)", plain: "The bottom number, from a blood-pressure cuff.", unit: "mmHg", refHigh: 80, highIsConcern: true, fromWatch: false, generalKnowledge: true },
};

export const LAB_KEYS = Object.keys(CATALOG) as LabKey[];

const SYSTEM = `You extract structured biomarker values from a photo or scan of a clinical blood-test / lab report.

Return ONLY a single JSON object — no prose, no explanation, no markdown code fences.

Shape:
{"results":[{"key":string,"name":string,"value":number,"unit":string}],"collectionDate":string|null}

Rules:
- Use ONLY these keys, and only when the test is clearly present and legible: totalChol, hdl, ldl, trig, apob, glucose, hba1c, crp, systolic, diastolic.
- Report values in SI units: mmol/L for cholesterol/LDL/HDL/triglycerides/glucose, % for HbA1c, g/L for ApoB, mg/L for hs-CRP, mmHg for blood pressure.
- If a cholesterol or glucose value is given in mg/dL, convert to mmol/L (cholesterol: divide by 38.67; glucose: divide by 18.02) and round to one decimal.
- "name" is a short human label as printed on the report.
- "collectionDate" is the specimen collection date as YYYY-MM-DD if shown, else null.
- Omit anything you cannot read with confidence. Never invent a value. If nothing is legible, return {"results":[],"collectionDate":null}.`;

function stripToJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("Claude did not return JSON we could read.");
  }
  return body.slice(start, end + 1);
}

function coerce(raw: unknown): ExtractionResult {
  const obj = raw as { results?: unknown; collectionDate?: unknown };
  const valid = new Set<string>(LAB_KEYS);
  const results: ExtractedLab[] = Array.isArray(obj.results)
    ? (obj.results as ExtractedLab[])
        .filter(
          (r) =>
            r &&
            valid.has(r.key) &&
            typeof r.value === "number" &&
            !Number.isNaN(r.value),
        )
        .map((r) => ({
          key: r.key,
          name: String(r.name ?? CATALOG[r.key].name),
          value: r.value,
          unit: String(r.unit ?? CATALOG[r.key].unit),
        }))
    : [];
  const date =
    typeof obj.collectionDate === "string" && obj.collectionDate.trim()
      ? obj.collectionDate.trim()
      : null;
  return { results, collectionDate: date };
}

/** Send the photo/PDF to Claude and get back structured lab values. */
export async function extractLabsFromFile(opts: {
  apiKey: string;
  base64: string; // raw base64, no data: prefix
  mediaType: SupportedMediaType;
  model?: string;
}): Promise<ExtractionResult> {
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

  const body = {
    // Haiku 4.5 by default — fast, cheap, and plenty for reading printed values
    // off a lab report. Bump to claude-sonnet-4-6 (or opus) via VITE_ANTHROPIC_MODEL
    // if a messy / low-light phone photo ever needs the extra vision headroom.
    model: opts.model || "claude-haiku-4-5",
    max_tokens: 2048,
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          source,
          {
            type: "text",
            text: "Read this lab report and return the JSON described in your instructions.",
          },
        ],
      },
    ],
  };

  let res: Response;
  try {
    res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": opts.apiKey,
        "anthropic-version": "2023-06-01",
        // Opt this browser request into Anthropic's CORS support.
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify(body),
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
    throw new Error(`Couldn't read the report (${res.status}). ${detail}`.trim());
  }

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const textBlock = data.content?.find((b) => b.type === "text");
  if (!textBlock?.text) throw new Error("Claude returned no text to read.");
  return coerce(JSON.parse(stripToJson(textBlock.text)));
}

/**
 * Merge extracted values into the existing biomarker list: update the value and
 * date on matching keys, append catalog-backed entries for new ones, and leave
 * everything else untouched.
 */
export function applyExtraction(
  existing: Biomarker[],
  extracted: ExtractedLab[],
  date: string | null,
): Biomarker[] {
  const byKey = new Map(existing.map((b) => [b.key, b]));
  for (const lab of extracted) {
    const prior = byKey.get(lab.key);
    if (prior) {
      byKey.set(lab.key, { ...prior, value: lab.value, date: date ?? prior.date });
    } else {
      byKey.set(lab.key, { ...CATALOG[lab.key], value: lab.value, date: date ?? undefined });
    }
  }
  return Array.from(byKey.values());
}
