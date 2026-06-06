# HONESTY.md — HeartSum

> Mandatory hackathon disclosure. Disclosed shortcuts are not penalised — hidden ones are. This file states plainly what's real, what's simulated, what calls out to a real API, and what we reused.

**Medical-safety framing (applies throughout):** HeartSum is a wellness early-warning layer and a bridge to a clinician. It is **not** a diagnostic device, and it never advises starting, stopping, or changing any treatment. "Signals, not diagnoses" is enforced in the UI copy and the report.

---

## 1. Team — who did what

| Member | GitHub handle | Main contributions |
|---|---|---|
| David Ghiberdic | dghiberdic | Product direction, data/clinical spec, manual testing, review, decisions on scope |
| *(add teammates)* |  |  |

**AI assistance — disclosed up front:** the implementation in this repo was written with **Claude Code** (Anthropic's AI coding agent) pair-programming with the team. Commits are co-authored (`Co-Authored-By: Claude …`). A human directed every step, reviewed the output, and ran the tests; the AI wrote most of the code and prose. We're flagging this explicitly rather than passing AI-written code off as hand-written.

---

## 2. What is fully working

End-to-end on the live app, with real data and real logic:

- **Apple Health import (real parsing).** Upload the `watch_data` folder or its CSVs; we parse the HealthKit export schema locally — resting/walking HR, HRV (SDNN), SpO₂, steps, ECG classification, VO₂, rhythm notifications — into the day-by-day model. No network, no LLM. `src/lib/importWatch.ts`, `src/components/WatchUpload.tsx`.
- **Watch trend rules W1–W9 (real, deterministic).** Threshold rules comparing a recent window to the patient's own 30-day baseline, with combined green/yellow/red status and a bilingual caretaker alert. `src/lib/rules.ts`. (Documented in-app under *More info → The watch alert rules*.)
- **Framingham 10-year CVD risk (real published formula).** D'Agostino et al. (2008) with sex-specific coefficients, treated/untreated SBP logic, and SI→mg/dL conversion. `src/lib/framingham.ts`. Flagged as not-validated outside ages 30–79 or with prior CVD. *(See the known discrepancy in §6.)*
- **Lab report extraction via Claude vision (real API call).** Photograph or upload a lab PDF; Claude reads the values into SI-unit biomarkers; the user confirms before saving. `src/lib/extractLabs.ts`, `src/components/LabPhotoUpload.tsx`.
- **eHealth record input (two real paths).** (a) A **FHIR R4 bundle** (`.json`) parsed entirely on-device into conditions/medications/allergies + LOINC-coded lab Observations (`parseFhirBundle` in `src/lib/fhir.ts`); (b) a clinical **PDF/photo** read by Claude (`src/lib/ehealth.ts`). Both require user confirmation.
- **Doctor report (templated, no LLM).** Every sentence maps to a data point; reproducible. Print-to-PDF, a shareable read-only view, and a FHIR bundle export. `src/pages/Report.tsx`, `src/lib/fhir.ts`.
- **The rest of the app.** "What to ask your doctor" (derived from flagged signals), the Today dashboard, per-metric trends with hover/zoom, More-info reference, and Settings — all driven by the real/derived data above. State persists in the browser (`localStorage`); there is **no backend**.

---

## 3. What is mocked, stubbed, or hardcoded

| What is faked | Where | Why | What the real version would do |
|---|---|---|---|
| **Sample fallback data** ("Margaret" — 90-day seeded series, default profile, sample lab values) | `src/lib/sampleData.ts`; used by `src/lib/store.tsx` when nothing is uploaded | So the dashboard renders before the user imports anything | Show an empty/"connect your data" state instead of stand-in numbers |
| **Live Apple Health connection** | `WatchUpload` is a file upload, not a device link | No HealthKit access from a web app | Native iOS app reading HealthKit, or parsing the official `export.xml` |
| **Missing watch metrics filled with neutral defaults** (sleep score, respiratory rate, wrist temp, walking HR when absent from a CSV) | `src/lib/importWatch.ts` | Basic exports don't include them | Read them from a full HealthKit export |
| **eHRSS / eHealth integration** | Upload a FHIR bundle or PDF; no live eHRSS call | eHRSS needs HCP registration + patient consent (Cap. 625) | Authenticated FHIR pull from eHRSS with consent |
| **FHIR *export* bundle** is R4-*shaped* but not strictly conformant (missing `subject` refs, `fullUrl`s, coded `clinicalStatus`) | `buildFhirBundle` in `src/lib/fhir.ts` | Output isn't ingested anywhere yet; a lenient parser accepts it | Add patient references + terminology systems to pass HL7 validation. *(The sample input bundle in `samples/` IS strict R4.)* |
| **"Shareable report link"** (`/r/:token`) | `src/App.tsx`, `src/pages/Report.tsx` | No backend to store/serve a report | The link's read-only view reads the **same browser's** `localStorage`; it does **not** transmit the report to another device. A real version needs a server to store the report behind the token. |
| **Carer / family access** (Settings "grant access") | `src/pages/Settings.tsx` | No auth system | Stores a name locally only; real version needs accounts + permissions |
| **Biomarker reference bands** | `src/lib/extractLabs.ts`, `src/lib/fhir.ts` | General medical knowledge, kept conservative | Shown as guidance, never as a HeartSum verdict; a clinician sets personalised targets |

ECG note: we use the watch's **classification label** (`atrialFibrillation` / `sinusRhythm` / `inconclusive`) only — never raw waveform voltage.

---

## 4. External APIs, services & data sources

| Service / API / dataset | Used for | Real or mocked? | Auth |
|---|---|---|---|
| **Anthropic Messages API** — Claude **Haiku 4.5** | Reading lab reports & clinical PDFs/photos into structured data (vision) | **Real call**, made **directly from the browser** (`fetch` to `api.anthropic.com` with the `anthropic-dangerous-direct-browser-access` header) | **User-supplied API key** — from `VITE_ANTHROPIC_API_KEY` (a gitignored `.env.local`) or pasted into the UI and stored in `localStorage`. **Security caveat:** any key in a client-side build/field is visible in the browser; use a scoped/disposable key. No key is committed. |
| **Google Fonts** (Fraunces, Inter) | Typography | Real CDN fetch at runtime | None |
| Hackathon **demo data** (watch CSVs, lab/medical PDFs) | Test input | Real files, parsed/extracted as above | None |
| **`ground_truth.json`** (demo) | **Checker only** | Used by an offline eval script (outside the app) to score extraction/rules against expected values | **Never an input to the app** — verified by code search; the app reads only the watch CSVs, the profile form, and uploaded labs/records |

There is no database, no auth server, and no other third-party service. Everything except the two Anthropic/Google calls above runs locally in the browser.

---

## 5. Pre-existing code & tooling

**All application code in this repo was written during the hackathon window** (with Claude Code, as disclosed in §1). What we did *not* write from scratch:

| Item | Source | Amount | License |
|---|---|---|---|
| React, React Router, Vite, Tailwind CSS, lucide-react | npm (standard OSS) | dependencies | MIT |
| **graphify** (`graphifyy`) | PyPI / github.com/safishamsi/graphify | A **local dev tool** only — builds a code knowledge-graph to cut our own token use. **Not part of the shipped app**; its config + output are gitignored (`.claude/`, `CLAUDE.md`, `graphify-out/`). | MIT |
| Two reference PDFs (*Apple Watch Health Data*, *Conditions & Early Signals*), `data-spec.md` | Provided to us | Source of truth for metrics, evidence tiers, and the W1–W9 thresholds — **content/spec, not code** | provided |

No prior personal projects, forks, or boilerplate beyond the standard Vite + React template scaffolding (generated during the window).

---

## 6. Known limitations & next steps

- **Framingham vs demo ground truth.** Our score is faithful to the published D'Agostino formula and reproduces the paper's own worked example, but it **differs from the demo's `expected_framingham` for male patients** (e.g. PatientB ≈70% vs the demo's 27.4%). The entire gap is the men's mean-of-linear-predictor constant: the demo's generator used ~25.30 where the published value (which we use) is 23.9802. We left our value formula-correct; this is documented, not hidden.
- **No real device / eHRSS integration** — watch data is an uploaded export; eHealth is an uploaded bundle/PDF (see §3).
- **Shareable link is browser-local** — it can't open the report on another device without a backend (see §3).
- **FHIR *export* isn't strictly R4-valid** — a validator would flag missing references/systems (the *input* parser and the bundled sample are strict).
- **Client-side AI key exposure** — extraction calls run from the browser with the user's key; fine for a demo, not for production (a server-side proxy would fix it).
- **SPA deep links on a static host** — opening/refreshing `/report` (or a `/r/…` link) on a host with no `index.html` fallback returns 404; needs a one-line host rewrite config.
- **Sample-data ambiguity** — before any upload, the dashboard shows the seeded "Margaret" data; a clearer empty state would avoid mistaking it for real data.

Next: server-side report storage for real sharing, a server-side Claude proxy, strict-R4 export, a full HealthKit/`export.xml` importer, and reconciling the Framingham constant with whatever the organisers consider canonical.
