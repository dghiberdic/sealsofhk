import type { FraminghamResult } from "./framingham";
import type { ExtractedLab, LabKey } from "./extractLabs";
import type { Biomarker, Profile } from "./types";

// ---------------------------------------------------------------------------
// Mocked eHealth integration — FHIR R4 bundle matching the eHRSS data model
// (Patient, Condition, MedicationStatement, Observation, AllergyIntolerance,
// RiskAssessment). In production this needs HCP registration and patient
// sharing consent under the Electronic Health Record Sharing System Ordinance
// (Cap. 625). See HONESTY.md.
// ---------------------------------------------------------------------------

const LOINC: Record<string, { code: string; display: string }> = {
  totalChol: { code: "2093-3", display: "Total Cholesterol" },
  hdl: { code: "2085-9", display: "HDL Cholesterol" },
  ldl: { code: "2089-1", display: "LDL Cholesterol" },
  trig: { code: "2571-8", display: "Triglycerides" },
  glucose: { code: "1558-6", display: "Fasting Glucose" },
  hba1c: { code: "4548-4", display: "HbA1c" },
  systolic: { code: "8480-6", display: "Systolic Blood Pressure" },
  diastolic: { code: "8462-4", display: "Diastolic Blood Pressure" },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = Record<string, any>;

export function buildFhirBundle(
  profile: Profile,
  biomarkers: Biomarker[],
  framingham: FraminghamResult,
): Json {
  const entries: Json[] = [];

  entries.push({
    resource: {
      resourceType: "Patient",
      id: "patient-001",
      name: [{ text: profile.name }],
      gender: profile.sex,
    },
  });

  for (const cond of profile.conditions) {
    entries.push({
      resource: {
        resourceType: "Condition",
        code: { text: cond },
        clinicalStatus: { coding: [{ code: "active" }] },
      },
    });
  }

  for (const med of profile.medications) {
    entries.push({
      resource: {
        resourceType: "MedicationStatement",
        medicationCodeableConcept: { text: med },
        status: "active",
      },
    });
  }

  for (const allergy of profile.allergies) {
    entries.push({
      resource: {
        resourceType: "AllergyIntolerance",
        code: { coding: [{ display: allergy }] },
        clinicalStatus: { coding: [{ code: "active" }] },
      },
    });
  }

  for (const b of biomarkers) {
    if (b.value == null) continue;
    const loinc = LOINC[b.key];
    entries.push({
      resource: {
        resourceType: "Observation",
        status: "final",
        code: loinc
          ? { coding: [{ system: "http://loinc.org", code: loinc.code, display: loinc.display }] }
          : { text: b.name },
        valueQuantity: { value: b.value, unit: b.unit },
        effectiveDateTime: b.date,
      },
    });
  }

  if (framingham.available && framingham.riskPct != null) {
    entries.push({
      resource: {
        resourceType: "RiskAssessment",
        status: "final",
        method: { text: "Framingham General CVD Risk (D'Agostino 2008)" },
        prediction: [
          {
            outcome: { text: "Cardiovascular disease" },
            probabilityDecimal: framingham.riskPct / 100,
            whenRange: { high: { value: 10, unit: "years" } },
          },
        ],
      },
    });
  }

  return {
    resourceType: "Bundle",
    type: "collection",
    entry: entries,
  };
}

export function downloadFhir(
  profile: Profile,
  biomarkers: Biomarker[],
  framingham: FraminghamResult,
) {
  const bundle = buildFhirBundle(profile, biomarkers, framingham);
  const blob = new Blob([JSON.stringify(bundle, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "heartsum-fhir-bundle.json";
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// FHIR R4 INPUT — parse an uploaded bundle into the app's model.
//
// Reads a FHIR R4 Bundle (the kind an EHR / eHRSS would export, and the kind
// HeartSum itself exports) and pulls out the clinical record (Patient,
// Condition, MedicationStatement/Request, AllergyIntolerance) plus any lab/vital
// Observations keyed by LOINC. Local only — no LLM, no network. Tolerant of the
// common shape variations (code.text vs code.coding[].display, etc.).
// ---------------------------------------------------------------------------

// Reverse of the LOINC table above, plus a couple of extras we understand.
const LOINC_TO_KEY: Record<string, LabKey> = {
  "2093-3": "totalChol",
  "2085-9": "hdl",
  "2089-1": "ldl",
  "2571-8": "trig",
  "1558-6": "glucose",
  "4548-4": "hba1c",
  "8480-6": "systolic",
  "8462-4": "diastolic",
  "1884-6": "apob", // Apolipoprotein B
  "30522-7": "crp", // hs-CRP
};

const BP_MEDS =
  /amlodipine|lisinopril|losartan|valsartan|ramipril|perindopril|enalapril|atenolol|bisoprolol|metoprolol|nifedipine|telmisartan|candesartan|hydrochlorothiazide|indapamide/i;

export interface FhirParseResult {
  patch: {
    name?: string;
    sex?: "male" | "female" | "other";
    conditions: string[];
    medications: string[];
    allergies: string[];
    diabetes: boolean;
    onBpMeds: boolean;
  };
  labs: ExtractedLab[];
  collectionDate: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ccText(cc: any): string {
  if (!cc) return "";
  if (cc.text) return String(cc.text);
  const coding = Array.isArray(cc.coding) ? cc.coding : [];
  const withDisplay = coding.find((c: Json) => c.display);
  return String(withDisplay?.display ?? coding[0]?.code ?? "");
}

export function parseFhirBundle(json: unknown): FhirParseResult {
  const bundle = json as Json;
  if (!bundle || bundle.resourceType !== "Bundle" || !Array.isArray(bundle.entry)) {
    throw new Error(
      'That doesn\'t look like a FHIR bundle (expected resourceType "Bundle" with an "entry" array).',
    );
  }
  const resources: Json[] = bundle.entry
    .map((e: Json) => e?.resource)
    .filter(Boolean);

  let name: string | undefined;
  let sex: "male" | "female" | "other" | undefined;
  const conditions: string[] = [];
  const medications: string[] = [];
  const allergies: string[] = [];
  const labs: ExtractedLab[] = [];
  let collectionDate: string | null = null;

  for (const r of resources) {
    switch (r.resourceType) {
      case "Patient": {
        const n = Array.isArray(r.name) ? r.name[0] : r.name;
        name =
          n?.text ||
          [(n?.given ?? []).join(" "), n?.family].filter(Boolean).join(" ") ||
          undefined;
        const g = String(r.gender ?? "").toLowerCase();
        sex = g === "male" || g === "female" ? g : g ? "other" : undefined;
        break;
      }
      case "Condition": {
        const t = ccText(r.code);
        if (t) conditions.push(t);
        break;
      }
      case "MedicationStatement":
      case "MedicationRequest": {
        const t = r.medicationCodeableConcept
          ? ccText(r.medicationCodeableConcept)
          : r.medicationReference?.display ?? "";
        if (t) medications.push(t);
        break;
      }
      case "AllergyIntolerance": {
        const t = ccText(r.code);
        if (t) allergies.push(t);
        break;
      }
      case "Observation": {
        const coding = Array.isArray(r.code?.coding) ? r.code.coding : [];
        const loinc =
          coding.find((c: Json) => String(c.system ?? "").includes("loinc"))?.code ??
          coding[0]?.code;
        const key = loinc ? LOINC_TO_KEY[String(loinc)] : undefined;
        const value = r.valueQuantity?.value;
        if (key && typeof value === "number") {
          labs.push({
            key,
            name: ccText(r.code) || key,
            value,
            unit: String(r.valueQuantity?.unit ?? ""),
          });
          if (!collectionDate && typeof r.effectiveDateTime === "string") {
            collectionDate = r.effectiveDateTime.slice(0, 10);
          }
        }
        break;
      }
    }
  }

  return {
    patch: {
      name,
      sex,
      conditions,
      medications,
      allergies,
      diabetes: conditions.some((c) => /diabet/i.test(c)),
      onBpMeds: medications.some((m) => BP_MEDS.test(m)),
    },
    labs,
    collectionDate,
  };
}
