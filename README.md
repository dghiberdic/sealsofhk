# HeartSum

> Your health, served in small plates.

A calm web app that gathers Apple Watch / Health data and blood-test results into
one easy-to-understand dashboard — learns your personal "normal," gently flags
what's worth a look, and gets you ready for your doctor. An early-warning layer
and a bridge to real care — **never a diagnosis**.

Built from [`HeartSum-product-brief.md`](./HeartSum-product-brief.md). Every
metric, insight and evidence tier traces back to the two clinical reference PDFs;
blood biomarkers are clearly marked as conservative general knowledge.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
```

## What's inside

- **Onboarding** — Welcome → Profile setup → Connect data (simulated import).
- **Today** — the calm daily landing screen ("Everything looks steady").
- **Health** — the two focus areas (Heart & circulation, Metabolic & longevity)
  plus secondary insights, each with its evidence tier.
- **Insight detail** — the four plain-language questions + a baseline-band trend chart.
- **Trends** — direction-of-travel charts over 90 days.
- **What to ask your doctor** — checklist generated from your flagged signals.
- **Doctor report** — print-to-PDF + a read-only shareable link (`/r/:token`).
- **Learn** — tiers, the canary signals, and the honest "what it can't do" list.
- **Settings** — connected data, carer access, dark mode, export, delete.

## Notes for the demo

- Watch data is a believable **simulation** (seeded, stable across reloads) — the
  brief deliberately doesn't solve real device integration.
- State lives in `localStorage`; **Settings → Delete all my data** resets it.
- The sample profile ("Margaret", 67) is chosen so the signals are meaningful:
  a cleared hypertension pattern, low cardio fitness, a Tier-2 resting-HR drift,
  and elevated cholesterol / HbA1c from self-entered labs.

## Stack

Vite · React · TypeScript · Tailwind CSS · React Router. Client-side only.
