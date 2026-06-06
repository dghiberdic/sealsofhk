import type { FraminghamResult } from "./framingham";
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
