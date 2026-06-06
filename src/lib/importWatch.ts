import type { DayMetric, EcgClass, EcgReading, RhythmEvent } from "./types";

// ---------------------------------------------------------------------------
// Parse exported Apple Health / HealthKit CSVs into the app's day-by-day model.
//
// Expects one CSV per metric (as Apple Health exports them), with the header
//   creationDate,startDate,endDate,value,unit,sourceName
// and one row per day. ECG files use
//   creationDate,classification,averageHeartRate,sourceName
//
// Everything here is local parsing — no network, no LLM, no credits. Metrics the
// upload doesn't include are filled with neutral defaults so the dashboard and
// the trend rules stay well-behaved (a flat default can't trigger a trend alert).
// ---------------------------------------------------------------------------

type Field =
  | "restingHR"
  | "hrv"
  | "spo2"
  | "steps"
  | "walkingHR"
  | "respiratoryRate"
  | "wristTempDelta"
  | "breathingDisturbances"
  | "activeEnergy";

const FILE_FIELD: { test: RegExp; field: Field; label: string }[] = [
  { test: /restingheart/i, field: "restingHR", label: "Resting heart rate" },
  { test: /walkingheart/i, field: "walkingHR", label: "Walking heart rate" },
  { test: /(hrv|heartratevariability|sdnn)/i, field: "hrv", label: "Heart-rate variability" },
  { test: /(oxygensaturation|spo2|bloodoxygen)/i, field: "spo2", label: "Blood oxygen" },
  { test: /(stepcount|steps)/i, field: "steps", label: "Steps" },
  { test: /respiratoryrate/i, field: "respiratoryRate", label: "Respiratory rate" },
  { test: /(wristtemp|wristtemperature)/i, field: "wristTempDelta", label: "Wrist temperature" },
  { test: /breathingdisturb/i, field: "breathingDisturbances", label: "Breathing disturbances" },
  { test: /activeenergy/i, field: "activeEnergy", label: "Active energy" },
];

export interface RawFile {
  name: string;
  text: string;
}

export interface WatchImport {
  metrics: DayMetric[];
  ecg: EcgReading[];
  vo2: { date: string; value: number }[];
  rhythm: RhythmEvent[];
  summary: { label: string; days: number }[];
  warnings: string[];
}

const round = (n: number) => Math.round(n);
const r1 = (n: number) => Math.round(n * 10) / 10;
const r2 = (n: number) => Math.round(n * 100) / 100;
const datePart = (s: string) => (s || "").trim().slice(0, 10); // "2026-03-07 …" → "2026-03-07"

function parseCsv(text: string): string[][] {
  return text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split(",").map((c) => c.trim()));
}

function normaliseEcg(raw: string): EcgClass {
  const s = raw.toLowerCase();
  if (s.includes("atrial") || s.includes("afib") || s.includes("fibrillation"))
    return "atrialFibrillation";
  if (s.includes("sinus")) return "sinusRhythm";
  return "inconclusive";
}

function colIndex(header: string[], names: string[], fallback: number): number {
  for (const n of names) {
    const i = header.indexOf(n);
    if (i >= 0) return i;
  }
  return fallback;
}

export function importWatchFiles(files: RawFile[]): WatchImport {
  const perField: Partial<Record<Field, Map<string, number[]>>> = {};
  const ecg: EcgReading[] = [];
  const vo2: { date: string; value: number }[] = [];
  const rhythm: RhythmEvent[] = [];
  const summary: { label: string; days: number }[] = [];
  const warnings: string[] = [];

  for (const f of files) {
    const lower = f.name.toLowerCase();
    if (!lower.endsWith(".csv")) continue;
    const rows = parseCsv(f.text);
    if (rows.length < 2) {
      warnings.push(`Empty or unreadable: ${f.name}`);
      continue;
    }
    const header = rows[0].map((h) => h.toLowerCase());
    const body = rows.slice(1).filter((r) => r.length >= 2);

    // ECG
    if (/ecg/i.test(lower) || header.includes("classification")) {
      const dI = colIndex(header, ["creationdate", "startdate"], 0);
      const cI = colIndex(header, ["classification"], 1);
      const hI = colIndex(header, ["averageheartrate", "value"], 2);
      for (const r of body) {
        ecg.push({
          date: datePart(r[dI]),
          classification: normaliseEcg(r[cI] || ""),
          heartRate: round(Number(r[hI]) || 0),
        });
      }
      summary.push({ label: "ECG readings", days: body.length });
      continue;
    }

    // Irregular-rhythm notifications
    if (/irregular|rhythmnotif|rhythmevent/i.test(lower)) {
      const dI = colIndex(header, ["creationdate", "startdate"], 0);
      for (const r of body) rhythm.push({ date: datePart(r[dI]) });
      summary.push({ label: "Rhythm notifications", days: body.length });
      continue;
    }

    // VO₂ max
    if (/vo2/i.test(lower)) {
      const dI = colIndex(header, ["startdate", "creationdate"], 1);
      const vI = colIndex(header, ["value"], 3);
      for (const r of body) {
        const v = Number(r[vI]);
        if (!Number.isNaN(v)) vo2.push({ date: datePart(r[dI]), value: r1(v) });
      }
      summary.push({ label: "Cardio fitness (VO₂ max)", days: body.length });
      continue;
    }

    const match = FILE_FIELD.find((m) => m.test.test(lower));
    if (!match) {
      warnings.push(`Skipped unrecognised file: ${f.name}`);
      continue;
    }
    const dI = colIndex(header, ["startdate", "creationdate"], 0);
    const vI = colIndex(header, ["value"], 3);
    const map = (perField[match.field] ??= new Map<string, number[]>());
    for (const r of body) {
      const date = datePart(r[dI]);
      const v = Number(r[vI]);
      if (!date || Number.isNaN(v)) continue;
      const arr = map.get(date) ?? [];
      arr.push(v);
      map.set(date, arr);
    }
    summary.push({ label: match.label, days: map.size });
  }

  // Union of every date seen, ascending (oldest → newest, like the app expects).
  const dateSet = new Set<string>();
  for (const field of Object.keys(perField) as Field[])
    for (const d of perField[field]!.keys()) dateSet.add(d);
  const dates = Array.from(dateSet).sort();

  const avg = (field: Field, date: string): number | undefined => {
    const vs = perField[field]?.get(date);
    if (!vs || !vs.length) return undefined;
    return vs.reduce((a, b) => a + b, 0) / vs.length;
  };

  const metrics: DayMetric[] = dates.map((date) => {
    const rhr = avg("restingHR", date);
    return {
      date,
      restingHR: round(rhr ?? 62),
      hrv: round(avg("hrv", date) ?? 40),
      // Flat default keeps the walking-HR trend rule (W9) quiet when not provided.
      walkingHR: round(avg("walkingHR", date) ?? 95),
      respiratoryRate: r1(avg("respiratoryRate", date) ?? 14),
      wristTempDelta: r2(avg("wristTempDelta", date) ?? 0),
      spo2: round(avg("spo2", date) ?? 97),
      breathingDisturbances: round(avg("breathingDisturbances", date) ?? 2),
      // Sleep isn't in the basic export; neutral, non-alarming placeholder.
      sleepScore: 80,
      sleepDuration: 40,
      sleepBedtime: 25,
      sleepInterruptions: 15,
      steps: round(avg("steps", date) ?? 6000),
      activeEnergy: round(avg("activeEnergy", date) ?? 350),
      vitalsOutliers: 0,
    };
  });

  const byDate = (a: { date: string }, b: { date: string }) =>
    a.date < b.date ? -1 : 1;

  return {
    metrics,
    ecg: ecg.sort(byDate),
    vo2: vo2.sort(byDate),
    rhythm: rhythm.sort(byDate),
    summary,
    warnings,
  };
}
