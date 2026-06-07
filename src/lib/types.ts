// UI language — English or Traditional Chinese (Hong Kong).
export type Lang = "en" | "zh";

// Evidence tiers, straight from the "Conditions & Early Signals" reference.
export type Tier = 1 | 2 | 3;

export const TIER_LABEL: Record<Tier, string> = {
  1: "Cleared by regulators",
  2: "Strong research",
  3: "Early hint",
};

export const TIER_BLURB: Record<Tier, string> = {
  1: "The watch is designed and regulator-cleared to flag this, and actively notifies you.",
  2: "Not a built-in alert, but well-documented in peer-reviewed studies and readable from your data.",
  3: "Plausible and researched, but noisy and not validated for individuals — treat it as a gentle hint.",
};

export type FocusArea = "heart" | "metabolic" | "secondary";

// How an insight is feeling right now — drives the calm/concern visual tone.
export type Status = "steady" | "watch" | "look";

export interface DayMetric {
  date: string; // ISO date
  restingHR: number; // bpm — HKQuantityTypeIdentifierRestingHeartRate
  hrv: number; // ms (SDNN) — HKQuantityTypeIdentifierHeartRateVariabilitySDNN
  walkingHR: number; // bpm — HKQuantityTypeIdentifierWalkingHeartRateAverage
  respiratoryRate: number; // breaths/min
  wristTempDelta: number; // °C deviation from baseline
  spo2: number; // % — HKQuantityTypeIdentifierOxygenSaturation
  breathingDisturbances: number; // index — AppleSleepingBreathingDisturbances (apnea screen)
  sleepScore: number; // 0–100
  sleepDuration: number; // 0–50 component
  sleepBedtime: number; // 0–30 component
  sleepInterruptions: number; // 0–20 component
  steps: number; // HKQuantityTypeIdentifierStepCount
  activeEnergy: number; // kcal
  vitalsOutliers: number; // count of overnight Vitals outliers
}

// On-demand single-lead ECG — we read the watch's CLASSIFICATION label only,
// never the raw waveform (reading the signal would make us a signal processor).
export type EcgClass = "sinusRhythm" | "atrialFibrillation" | "inconclusive";

export interface EcgReading {
  date: string;
  classification: EcgClass;
  heartRate: number; // bpm reported alongside the classification
}

// Apple's own background AFib-detection notification firing.
export interface RhythmEvent {
  date: string;
}

export interface Biomarker {
  key: string;
  name: string;
  plain: string; // plain-language meaning
  value: number | null;
  unit: string;
  // A conservative, general-knowledge reference band — clearly NOT a diagnosis.
  refLow?: number;
  refHigh?: number;
  // Higher value = more concern (true) or lower = more concern (false, e.g. HDL).
  highIsConcern: boolean;
  fromWatch: false; // biomarkers are never from the watch
  generalKnowledge: true; // beyond the reference PDFs
  date?: string;
}

export interface Profile {
  name: string;
  age: number;
  sex: "female" | "male" | "other";
  heightCm: number;
  weightKg: number;
  conditions: string[];
  medications: string[];
  familyHistory: string[];
  allergies: string[];
  smoker: "never" | "former" | "current";
  activity: "low" | "moderate" | "high";
  setUpByCarer: boolean;
  // Clinical flags — feed the Framingham CVD score and CHA₂DS₂-VASc context.
  onBpMeds: boolean; // on blood-pressure medication (changes the SBP coefficient)
  diabetes: boolean; // diagnosed diabetes
  priorStroke: boolean; // prior stroke / TIA
  priorHeartFailure: boolean; // prior heart-failure diagnosis
  knownVascularDisease: boolean; // known vascular disease
}

// A derived, plain-language insight — the "dish".
export interface Insight {
  id: string;
  title: string;
  titleZh?: string; // Traditional-Chinese title (for the bilingual report/cards)
  focus: FocusArea;
  tier: Tier;
  status: Status;
  oneLine: string; // short headline shown on cards
  oneLineZh?: string; // Traditional-Chinese one-liner
  what: string; // What is this?
  meaning: string; // What might it mean?
  sure: string; // How sure are we? (beyond the tier blurb)
  doThis: string; // What should I do?
  metric?: keyof DayMetric; // which series to chart, if any
  metricUnit?: string;
  source: "watch" | "blood" | "combined";
}

export interface DoctorQuestion {
  id: string;
  text: string;
  textZh?: string;
  why: string;
  tier: Tier;
  insightId?: string;
  source: "watch" | "blood" | "combined";
  custom?: boolean;
}
