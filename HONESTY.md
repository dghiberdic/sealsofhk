# HONESTY.md — what's real, what's mocked

HeartSum is a wellness early-warning layer and a bridge to a clinician. It is
**not** a diagnostic device and never advises starting, stopping, or changing
any treatment. This file states plainly which parts are real and which are
simulated for the hackathon.

## Must be real (and is)

- **Framingham General CVD Risk score** — implemented from the published
  D'Agostino et al. (2008) formula with the correct sex-specific coefficients,
  treated/untreated systolic-BP logic, and SI→mg/dL unit conversion. See
  `src/lib/framingham.ts`. Valid for ages 30–79 without prior CVD; outside that
  range, or with prior CVD, the report flags the score as not validated.
- **Watch trend rules (W1–W9)** — deterministic, threshold-based rules that
  compare a recent window against the patient's own 30-day baseline, with the
  combined green/yellow/red alert logic from the data spec. See `src/lib/rules.ts`.
- **Report generation** — every sentence in the clinician summary maps to a
  data point. No LLM is involved in the summary; it is templated and
  reproducible. See `src/pages/Report.tsx`.

## Mocked / simulated for the hackathon

- **Apple Watch data** — synthetic but realistic 90-day time series (resting
  HR, HRV/SDNN, walking HR, SpO₂, steps, ECG classifications, rhythm events),
  seeded so the demo is stable. In production a native iOS app reads HealthKit,
  or we parse a HealthKit `export.xml`. We would read the watch's **ECG
  classification label only**, never the raw waveform voltage.
- **Blood biomarkers** — pre-loaded sample lab values. The product supports
  manual entry and photo-extraction (LLM vision) of a paper lab report; in this
  preview the values are pre-filled.
- **eHealth / clinical history** — mocked as a FHIR R4 bundle matching the eHRSS
  data model (Patient, Condition, MedicationStatement, Observation,
  AllergyIntolerance, RiskAssessment). See `src/lib/fhir.ts`. In production this
  requires HCP registration and patient sharing consent under the Electronic
  Health Record Sharing System Ordinance (Cap. 625).

## Limits (so nothing is over-read)

- The watch cannot measure blood chemistry (glucose, cholesterol, hormones) and
  gives a blood-pressure *pattern*, not a number — a cuff is still needed.
- Signals overlap (illness vs stress vs overtraining look alike) and false
  alarms happen (fit, motion, skin, region).
- Regulatory clearances and feature availability differ by country and region.
