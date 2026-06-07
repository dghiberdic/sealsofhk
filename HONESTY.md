# HONESTY.md

> Mandatory disclosure for the hackathon. This file lives at the root of your repository. Judges cross-check it against your code and your technical video.
>
> **The deal:** disclosed shortcuts are **not** penalized — that is the entire point of this file. Hidden ones are. Undisclosed pre-built code is heavily penalized, each undisclosed mock carries a small penalty, and a faked demo is heavily penalized. Telling the truth here costs you nothing.

---

## 1. Team — who did what
Judges compare this against `git shortlog -sn`, so keep it honest.

| Member | GitHub handle | Main contributions |
|---|---|---|
| David Ghiberdic | dghiberdic | development, tech demo  |
| Rareș Garalbatin | raresgaralbatin | market research, business video, pitch  |
| Andrei Maftei | motanuglivei | research, business video, pitch |
| Luca Moșu | Luk012 | development, video editing |


---

## 2. What is fully working

Real logic, real data, end to end:

- **Apple Health import** — drop in your `watch_data` folder (or its CSVs) and we parse the HealthKit export (resting/walking HR, HRV, SpO₂, steps, ECG) into the daily model, all on-device. (`src/lib/importWatch.ts`)
- **Trend alerts W1–W9** — every metric is compared to *your own* 30-day baseline, rolled up to green/yellow/red, with a plain bilingual line for your carer. (`src/lib/rules.ts`)
- **Framingham 10-year CVD risk** — the real published D'Agostino 2008 formula, not a guess. (`src/lib/framingham.ts`)
- **CHA₂DS₂-VASc stroke-risk score** — a real point sum from your profile, shown beside Framingham. (`src/lib/cha2ds2vasc.ts`)
- **Reading a lab report** — snap or upload a lab PDF and Claude pulls the values into your biomarkers; you confirm before anything saves. (`src/lib/extractLabs.ts`)
- **eHealth record** — a FHIR R4 bundle (parsed locally) or a clinical PDF/photo (read by Claude). (`src/lib/fhir.ts`, `src/lib/ehealth.ts`)
- **Doctor report** — built deterministically from the data (no LLM writes it), shown 中文 + English, with print-to-PDF, a share link and a FHIR export.
- **Whole app in English or 繁體中文**, toggled anywhere.

---

## 3. What is mocked, stubbed, or hardcoded

| What's faked | Where | Why | The real version |
|---|---|---|---|
| Sample "Margaret" data shown before you upload anything | `src/lib/sampleData.ts` | so the dashboard isn't empty on first run | an empty "connect your data" state |
| "Connecting" Apple Health is a file upload, not a live device link | `src/components/WatchUpload.tsx` | a web app can't read HealthKit | a native app, or an `export.xml` reader |
| Watch metrics we don't get (sleep, resp. rate, wrist temp, walking HR) are filled with neutral defaults | `src/lib/importWatch.ts` | basic exports omit them | read them continuously from the watch stream / from a full export |
| The eHRSS link is an upload, not a live connection | `src/components/EHealthUpload.tsx` | eHRSS needs HCP registration + patient consent (Cap. 625) | an authenticated FHIR pull |
| The **shareable report link** opens the report from the *same browser's* storage — it doesn't actually send it anywhere | `src/pages/Report.tsx`, `src/App.tsx` | no backend | a server that stores the report behind the token |
| The FHIR **export** is R4-shaped but not strictly valid (missing subject refs / coded systems) | `buildFhirBundle` in `src/lib/fhir.ts` | nothing ingests it yet | add the references to pass a validator — the FHIR *input* parser and the bundled sample are already strict |
| Carer "access" just stores a name locally | `src/pages/Settings.tsx` | no accounts | real auth + permissions |
| Biomarker reference bands | `src/lib/extractLabs.ts` | conservative general-knowledge guidance | a clinician sets personalised targets — we never present them as a verdict |

---

## 4. External APIs, services & data sources

| Service / API / dataset | Used for | Real or mocked? | Auth |
|---|---|---|---|
| **Anthropic API — Claude Haiku 4.5** | reading lab reports & clinical PDFs/photos into structured data | **real**, called straight from the browser | your own API key, from `.env.local` or pasted in (kept in `localStorage`). It's a client-side key so it's visible in the browser — use a throwaway one. None is committed. |
| Google Fonts | typography (Fraunces, Inter) | real CDN fetch | none |
| Hackathon demo data (watch CSVs, lab/medical PDFs) | test input | real files | none |
| `ground_truth.json` | **checking only** — an offline script scores our extraction/rules against it | **never fed into the app** | none |

No database, no auth server, nothing else — everything else runs locally in the browser (or natively on mobile in a real version).

---

## 5. Pre-existing code

All app code was written during the hackathon — but built **with Claude Code** (an AI coding agent); commits are co-authored. We're flagging that rather than passing it off as hand-written. Also not ours:

- React, Vite, Tailwind, lucide-react — standard OSS (MIT).
- **graphify** — a local dev tool (a knowledge-graph over our own code to cut token use). Not shipped; gitignored (`.claude/`, `graphify-out/`).

---

## 6. Known limitations & next steps

- **Demo is a webapp.** The real version would be a mobile & desktop app, with a real server side backend. Additionally, all data would be securely encrypted on a database.
- **Alerts only fire while the app is open.** A real version would watch the data server-side and message you (HeartSum directly/WhatsApp) the moment a threshold is crossed or abnormal patterns are detected.
- **No live device or eHRSS integration** — everything arrives as an upload.
- **The share link is browser-local** and the **FHIR export isn't strictly valid** — both just need a small backend / a bit more markup.
- **The AI key lives in the browser** — fine for a demo, not production; a server-side proxy fixes it.
- A few deep screens (insight-detail prose, the More-info body, upload button labels) are still English-only. This is to limit our usage of a language none of us are fluent in, and ensure no major mistakes are made.
