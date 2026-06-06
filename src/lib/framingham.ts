import type { Biomarker, Profile } from "./types";
import { toUS } from "./units";

// ---------------------------------------------------------------------------
// Framingham General CVD Risk Score — D'Agostino et al., 2008.
// Published, deterministic formula. NOT a diagnosis — a 10-year risk estimate
// for a qualified clinician to interpret. Valid for ages 30–79 with no prior
// CVD event; for secondary prevention we still show it but flag it as not
// validated.
// ---------------------------------------------------------------------------

interface Coef {
  lnAge: number;
  lnTC: number;
  lnHDL: number;
  lnSBPu: number; // untreated systolic
  lnSBPt: number; // treated systolic
  smoker: number;
  diabetes: number;
  mu: number; // mean of the linear predictor
  s0: number; // baseline survival at 10 years
}

const COEF: Record<"male" | "female", Coef> = {
  male: {
    lnAge: 3.06117,
    lnTC: 1.1237,
    lnHDL: -0.93263,
    lnSBPu: 1.93303,
    lnSBPt: 1.99881,
    smoker: 0.65451,
    diabetes: 0.57367,
    mu: 23.9802,
    s0: 0.88936,
  },
  female: {
    lnAge: 2.32888,
    lnTC: 1.20904,
    lnHDL: -0.70833,
    lnSBPu: 2.76157,
    lnSBPt: 2.82263,
    smoker: 0.52873,
    diabetes: 0.69154,
    mu: 26.1931,
    s0: 0.95012,
  },
};

export type RiskCategory = "low" | "moderate" | "high";

export interface FraminghamInputs {
  age: number;
  sex: "male" | "female";
  totalCholMgdl: number;
  hdlMgdl: number;
  sbp: number;
  treated: boolean;
  smoker: boolean;
  diabetes: boolean;
}

export interface FraminghamResult {
  available: boolean;
  reason?: string; // why we couldn't compute it
  riskPct?: number; // 10-year risk %
  category?: RiskCategory;
  color?: "green" | "yellow" | "red";
  inputs?: FraminghamInputs;
  notes: string[];
}

function categorise(riskPct: number): {
  category: RiskCategory;
  color: "green" | "yellow" | "red";
} {
  if (riskPct < 10) return { category: "low", color: "green" };
  if (riskPct <= 20) return { category: "moderate", color: "yellow" };
  return { category: "high", color: "red" };
}

export function framingham(
  profile: Profile,
  biomarkers: Biomarker[],
): FraminghamResult {
  const notes: string[] = [];
  const bm = (k: string) => biomarkers.find((b) => b.key === k)?.value ?? null;

  if (profile.sex !== "male" && profile.sex !== "female") {
    return {
      available: false,
      reason: "The Framingham score needs a recorded sex of male or female.",
      notes,
    };
  }

  const tcSi = bm("totalChol");
  const hdlSi = bm("hdl");
  const sbp = bm("systolic");
  if (tcSi == null || hdlSi == null || sbp == null) {
    return {
      available: false,
      reason:
        "Needs total cholesterol, HDL and a systolic blood-pressure reading. Add the missing lab values.",
      notes,
    };
  }

  if (profile.age < 30 || profile.age > 79) {
    notes.push(
      "Age is outside the formula's validated range (30–79); the score is shown for context only.",
    );
  }
  if (profile.priorStroke || profile.priorHeartFailure || profile.knownVascularDisease) {
    notes.push(
      "Patient has prior cardiovascular disease — this score is for primary prevention and is not validated for secondary prevention.",
    );
  }

  const c = COEF[profile.sex];
  const totalCholMgdl = toUS("totalChol", tcSi)!.value;
  const hdlMgdl = toUS("hdl", hdlSi)!.value;
  const treated = profile.onBpMeds;
  const smoker = profile.smoker === "current";
  const diabetes = profile.diabetes;

  // Σ = β·ln(age) + β·ln(TC) + β·ln(HDL) + β·ln(SBP) + β·smoker + β·diabetes − μ
  // Treated/untreated SBP: only one term is active; the other ln(SBP) = 0.
  const sum =
    c.lnAge * Math.log(profile.age) +
    c.lnTC * Math.log(totalCholMgdl) +
    c.lnHDL * Math.log(hdlMgdl) +
    (treated ? c.lnSBPt : c.lnSBPu) * Math.log(sbp) +
    c.smoker * (smoker ? 1 : 0) +
    c.diabetes * (diabetes ? 1 : 0) -
    c.mu;

  const riskRaw = 100 * (1 - Math.pow(c.s0, Math.exp(sum)));
  const riskPct = Math.max(0, Math.min(99, Math.round(riskRaw * 10) / 10));
  const { category, color } = categorise(riskPct);

  return {
    available: true,
    riskPct,
    category,
    color,
    notes,
    inputs: {
      age: profile.age,
      sex: profile.sex,
      totalCholMgdl,
      hdlMgdl,
      sbp,
      treated,
      smoker,
      diabetes,
    },
  };
}
