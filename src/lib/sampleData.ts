import type {
  Biomarker,
  DayMetric,
  EcgReading,
  Profile,
  RhythmEvent,
} from "./types";

// ---------------------------------------------------------------------------
// Seeded pseudo-random so the demo looks the same every time it loads.
// (Real device integration is out of scope — this is a believable simulation.)
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DAYS = 90;

function isoDaysAgo(n: number): string {
  const d = new Date("2026-06-06T00:00:00");
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// Generate 90 days of believable Apple Watch / Health metrics.
// Built-in story for the demo:
//   • resting HR drifts gently UP over the last ~5 weeks (58 → ~65)
//   • HRV drifts gently DOWN over the same window (48 → ~38)
//   • everything else sits comfortably in a personal "normal" band
// This produces ONE honest Tier-2 cardiovascular-trend signal, not a pile of alarms.
export function generateMetrics(): DayMetric[] {
  const rand = mulberry32(20260606);
  const out: DayMetric[] = [];

  for (let i = DAYS - 1; i >= 0; i--) {
    const daysAgo = i;
    // trend factor: 0 early on, ramps to 1 over the final 35 days
    const t = Math.max(0, (35 - daysAgo) / 35);

    const restingHR = Math.round(58 + t * 7 + (rand() - 0.5) * 3);
    const hrv = Math.round(48 - t * 13 + (rand() - 0.5) * 6);
    const respiratoryRate = +(14 + (rand() - 0.5) * 1.2).toFixed(1);
    const wristTempDelta = +((rand() - 0.5) * 0.5).toFixed(2);
    const spo2 = Math.round(97 + (rand() - 0.5) * 1.5);
    // Walking HR rises only mildly (~+7%) — below the W9 threshold by design.
    const walkingHR = Math.round(86 + t * 6 + (rand() - 0.5) * 4);

    const sleepDuration = Math.round(38 + (rand() - 0.4) * 12); // /50
    const sleepBedtime = Math.round(22 + (rand() - 0.4) * 8); // /30
    const sleepInterruptions = Math.round(15 + (rand() - 0.4) * 5); // /20
    const sleepScore = Math.min(
      100,
      Math.max(0, sleepDuration + sleepBedtime + sleepInterruptions),
    );

    const steps = Math.round(5200 + rand() * 4200);
    const activeEnergy = Math.round(240 + rand() * 260);

    // Outliers track the drift loosely — most nights are clean.
    const outlierRoll = rand();
    const vitalsOutliers =
      t > 0.7 && outlierRoll > 0.78 ? (outlierRoll > 0.93 ? 2 : 1) : 0;

    out.push({
      date: isoDaysAgo(daysAgo),
      restingHR,
      hrv,
      walkingHR,
      respiratoryRate,
      wristTempDelta,
      spo2,
      sleepScore,
      sleepDuration,
      sleepBedtime,
      sleepInterruptions,
      steps,
      activeEnergy,
      vitalsOutliers,
    });
  }
  return out;
}

// VO₂ max is sampled roughly weekly from outdoor walks/runs/hikes.
// Margaret sits at the low end for her age band — enough to gently surface
// the Tier-1 "Low Cardio Fitness" notification, framed as modifiable.
export function generateVo2(): { date: string; value: number }[] {
  const rand = mulberry32(771);
  const out: { date: string; value: number }[] = [];
  for (let w = 12; w >= 0; w--) {
    out.push({
      date: isoDaysAgo(w * 7),
      value: +(24 + (rand() - 0.5) * 1.6).toFixed(1),
    });
  }
  return out;
}

// On-demand ECG readings — a few over the last month, all sinus rhythm here, so
// the AFib rule (W6) stays clear and the report can show an "ECG: OK" line.
export function generateEcg(): EcgReading[] {
  const rand = mulberry32(412);
  return [28, 16, 4].map((d) => ({
    date: isoDaysAgo(d),
    classification: "sinusRhythm" as const,
    heartRate: Math.round(68 + (rand() - 0.5) * 8),
  }));
}

// No irregular-rhythm notifications in the default demo (W7 stays clear).
export function generateRhythmEvents(): RhythmEvent[] {
  return [];
}

// Default profile: "Margaret", 67 — a realistic elderly CVD-monitoring profile,
// chosen so both the Framingham score and the watch rules produce meaningful,
// non-alarming results (moderate risk + a couple of yellow trends).
export const defaultProfile: Profile = {
  name: "Margaret",
  age: 67,
  sex: "female",
  heightCm: 162,
  weightKg: 64,
  conditions: ["Hypertension", "High cholesterol (hyperlipidemia)"],
  medications: ["Amlodipine 5 mg — once daily", "Atorvastatin 20 mg — once daily"],
  familyHistory: ["Father — heart disease (heart attack at 70)"],
  allergies: ["Penicillin"],
  smoker: "never",
  activity: "low",
  setUpByCarer: true,
  onBpMeds: true,
  diabetes: false,
  priorStroke: false,
  priorHeartFailure: false,
  knownVascularDisease: false,
};

// Self-entered lab results. ALL general medical knowledge — NOT from the watch
// and NOT from the reference PDFs. Reference bands are conservative and labelled
// as general guidance, never as a HeartSum verdict.
export const sampleBiomarkers: Biomarker[] = [
  {
    key: "totalChol",
    name: "Total cholesterol",
    plain: "The overall amount of cholesterol in your blood.",
    value: 5.9,
    unit: "mmol/L",
    refHigh: 5.2,
    highIsConcern: true,
    fromWatch: false,
    generalKnowledge: true,
    date: isoDaysAgo(12),
  },
  {
    key: "ldl",
    name: "LDL (“bad” cholesterol)",
    plain: "The kind that can build up in artery walls.",
    value: 3.8,
    unit: "mmol/L",
    refHigh: 3.4,
    highIsConcern: true,
    fromWatch: false,
    generalKnowledge: true,
    date: isoDaysAgo(12),
  },
  {
    key: "hdl",
    name: "HDL (“good” cholesterol)",
    plain: "The kind that helps clear cholesterol away.",
    value: 1.5,
    unit: "mmol/L",
    refLow: 1.2,
    highIsConcern: false,
    fromWatch: false,
    generalKnowledge: true,
    date: isoDaysAgo(12),
  },
  {
    key: "trig",
    name: "Triglycerides",
    plain: "A blood fat tied to diet and metabolism.",
    value: 1.4,
    unit: "mmol/L",
    refHigh: 1.7,
    highIsConcern: true,
    fromWatch: false,
    generalKnowledge: true,
    date: isoDaysAgo(12),
  },
  {
    key: "apob",
    name: "ApoB",
    plain: "A count of the cholesterol particles most linked to artery risk.",
    value: 1.05,
    unit: "g/L",
    refHigh: 1.0,
    highIsConcern: true,
    fromWatch: false,
    generalKnowledge: true,
    date: isoDaysAgo(12),
  },
  {
    key: "glucose",
    name: "Fasting glucose",
    plain: "Your blood sugar after not eating overnight.",
    value: 5.6,
    unit: "mmol/L",
    refHigh: 5.5,
    highIsConcern: true,
    fromWatch: false,
    generalKnowledge: true,
    date: isoDaysAgo(12),
  },
  {
    key: "hba1c",
    name: "HbA1c",
    plain: "Your average blood sugar over the last ~3 months.",
    value: 5.9,
    unit: "%",
    refHigh: 6.5,
    highIsConcern: true,
    fromWatch: false,
    generalKnowledge: true,
    date: isoDaysAgo(12),
  },
  {
    key: "crp",
    name: "hs-CRP",
    plain: "A sensitive marker of low-grade inflammation.",
    value: 1.1,
    unit: "mg/L",
    refHigh: 3.0,
    highIsConcern: true,
    fromWatch: false,
    generalKnowledge: true,
    date: isoDaysAgo(12),
  },
  {
    key: "systolic",
    name: "Blood pressure — systolic (from a cuff)",
    plain: "The top number, from a blood-pressure cuff (the watch can't give this).",
    value: 138,
    unit: "mmHg",
    refHigh: 140,
    highIsConcern: true,
    fromWatch: false,
    generalKnowledge: true,
    date: isoDaysAgo(12),
  },
  {
    key: "diastolic",
    name: "Blood pressure — diastolic (from a cuff)",
    plain: "The bottom number, from a blood-pressure cuff.",
    value: 86,
    unit: "mmHg",
    refHigh: 90,
    highIsConcern: true,
    fromWatch: false,
    generalKnowledge: true,
    date: isoDaysAgo(12),
  },
];
