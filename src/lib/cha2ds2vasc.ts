import type { Biomarker, EcgReading, Profile } from "./types";

// ---------------------------------------------------------------------------
// CHA₂DS₂-VASc — stroke-risk score for atrial fibrillation.
//
// A real, deterministic integer point sum (no model, no estimate fitting). It
// estimates annual stroke risk in patients with AFib and guides anticoagulation
// decisions; it is only clinically meaningful when AFib is present, so the
// result carries an `afibPresent` flag for the report to frame it honestly.
// Validated annual stroke rates from Lip/Friberg cohorts.
// ---------------------------------------------------------------------------

export interface ChaComponent {
  key: string;
  labelEn: string;
  labelZh: string;
  points: number; // points this row contributed
  max: number; // max points this row can contribute
}

export interface ChaResult {
  score: number; // 0–9
  components: ChaComponent[];
  annualStrokePct: number; // adjusted annual stroke rate, %
  band: "low" | "moderate" | "high";
  afibPresent: boolean;
}

// Adjusted annual stroke rate (% / year) by CHA₂DS₂-VASc score.
const ANNUAL_STROKE_PCT = [0, 1.3, 2.2, 3.2, 4.0, 6.7, 9.8, 9.6, 6.7, 15.2];

export function cha2ds2vasc(
  profile: Profile,
  biomarkers: Biomarker[],
  ecg: EcgReading[],
): ChaResult {
  const has = (re: RegExp, xs: string[]) => xs.some((x) => re.test(x));
  const systolic = biomarkers.find((b) => b.key === "systolic")?.value ?? null;

  // Hypertension history: on BP meds, a high cuff reading, or a recorded diagnosis.
  const hypertension =
    profile.onBpMeds ||
    (systolic != null && systolic >= 140) ||
    has(/hypertens|高血壓/i, profile.conditions);
  const diabetes = profile.diabetes || has(/diabet|糖尿/i, profile.conditions);

  const age = profile.age;
  const agePts = age >= 75 ? 2 : age >= 65 ? 1 : 0;

  const components: ChaComponent[] = [
    { key: "C", labelEn: "Heart failure", labelZh: "充血性心臟衰竭", points: profile.priorHeartFailure ? 1 : 0, max: 1 },
    { key: "H", labelEn: "Hypertension", labelZh: "高血壓", points: hypertension ? 1 : 0, max: 1 },
    { key: "A", labelEn: age >= 75 ? "Age ≥ 75" : "Age 65–74", labelZh: age >= 75 ? "年齡 ≥ 75" : "年齡 65–74", points: agePts, max: 2 },
    { key: "D", labelEn: "Diabetes", labelZh: "糖尿病", points: diabetes ? 1 : 0, max: 1 },
    { key: "S", labelEn: "Prior stroke / TIA", labelZh: "曾中風／短暫性腦缺血", points: profile.priorStroke ? 2 : 0, max: 2 },
    { key: "V", labelEn: "Vascular disease", labelZh: "血管疾病", points: profile.knownVascularDisease ? 1 : 0, max: 1 },
    { key: "Sc", labelEn: "Female sex", labelZh: "女性", points: profile.sex === "female" ? 1 : 0, max: 1 },
  ];

  const score = components.reduce((s, c) => s + c.points, 0);
  const annualStrokePct = ANNUAL_STROKE_PCT[Math.min(score, 9)];
  const band: ChaResult["band"] = score === 0 ? "low" : score === 1 ? "moderate" : "high";

  return {
    score,
    components,
    annualStrokePct,
    band,
    afibPresent: ecg.some((e) => e.classification === "atrialFibrillation"),
  };
}
