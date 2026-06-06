# HeartSum — Product Brief

*A calm, trustworthy web app that gathers a person's scattered health data and turns it into one easy-to-understand dashboard — an early-warning layer and a bridge to their doctor, never a diagnosis.*

**Version:** 1.0 (product vision brief) · **Date:** June 2026
**Audience for this document:** designers, product managers, content writers, and anyone who needs to understand the whole vision before build begins.
**Nature of this document:** plain-English product description. No code, no frameworks, no databases, no technical implementation.

---

## Table of contents

1. [Overview & elevator pitch](#1--overview--elevator-pitch)
2. [Product principles](#2--product-principles)
3. [Name, brand & tagline](#3--name-brand--tagline)
4. [Who it's for (with personas)](#4--who-its-for-with-personas)
5. [Design & accessibility direction (the "Claude" aesthetic)](#5--design--accessibility-direction-the-claude-aesthetic)
6. [The data it brings together](#6--the-data-it-brings-together)
7. [The focus areas](#7--the-focus-areas)
8. [How it turns data into understanding](#8--how-it-turns-data-into-understanding)
9. [The experience, screen by screen](#9--the-experience-screen-by-screen)
10. [The "What to ask your doctor" feature](#10--the-what-to-ask-your-doctor-feature)
11. [The doctor report (PDF + shareable link)](#11--the-doctor-report-pdf--shareable-link)
12. [Voice & example microcopy](#12--voice--example-microcopy)
13. [Trust, safety & privacy](#13--trust-safety--privacy)
14. [Reference appendix — metrics, conditions & evidence tiers](#14--reference-appendix--metrics-conditions--evidence-tiers)
15. [Assumptions made & open questions for you](#15--assumptions-made--open-questions-for-you)

---

## 1 · Overview & elevator pitch

**HeartSum** is a web app that gathers all of a person's scattered health data — the numbers from their Apple Watch and Apple Health, their blood-test results, and a little personal history — and turns it into **one calm, easy-to-understand dashboard**.

Most people who wear a smartwatch end up with a pile of charts they don't really understand. The numbers are there, but the *meaning* isn't. HeartSum reads that data the way a knowledgeable, warm friend would: it learns your personal "normal," quietly watches for meaningful drifts over time, and gently highlights the few things actually worth paying attention to. When something looks a little off, it explains *why* in plain words, tells you *how confident* the evidence is, and gives you specific, concrete things to ask your doctor about.

And with one button, HeartSum produces a clean, professional report you can hand or send to that doctor — clearly flagging the items worth a closer look — so the next appointment is faster and more useful for both of you.

The guiding feeling is **reassurance, not alarm**. On most days the honest message is *"everything looks steady,"* and the app says so warmly. HeartSum is an early-warning layer and a translator between your body's data and your doctor — never a diagnosis, and never a source of health anxiety.

**The elevator pitch, in one line:** *HeartSum makes sense of all your health numbers, tells you calmly when something's worth a look, and gets you ready for your doctor — in plain English, every day.*

**Two headline features** carry the product:

- **"What to ask your doctor"** — a running, personalised list of specific questions and topics, built from your own flagged signals.
- **The doctor report** — a polished, shareable summary that makes your appointment shorter and sharper.

**A note on the clinical source of truth.** Every health claim, metric, meaning, and "evidence strength" label in HeartSum traces back to two reference documents that accompany this brief:

- *Apple Watch Health Data — Complete Reference* (the catalogue of every data point the watch records and every insight it can produce).
- *Apple Watch — Conditions & Early Signals* (which conditions the data can flag early, and how solid the evidence is, organised into three tiers).

Where HeartSum goes beyond those documents — most importantly, **blood-test biomarkers, which a watch cannot measure** — this brief says so explicitly and keeps those additions medically conservative.

---

## 2 · Product principles

These seven principles come straight from the spirit of the reference documents. They are not decoration — they should be visible in the product, shape every screen, and settle any design argument.

### 2.1 Signals, not diagnoses
Everything HeartSum shows is **wellness information** that helps someone decide when to rest, re-test, or talk to a doctor. It never diagnoses a condition, and it never tells anyone to start, stop, or change any medication or treatment. This framing is visible and consistent throughout the app — woven into the words on the screens, not buried in a legal footer.

### 2.2 Honest about confidence
The app always shows **how strong the evidence is** behind any signal, using the three tiers from the reference:

- **Tier 1 — Cleared / built-in.** The watch is regulator-cleared to flag these and actively notifies you (e.g. AFib, sleep apnea, the hypertension pattern, low cardio fitness). The closest the watch comes to "something may be off."
- **Tier 2 — Strong research.** Not a built-in alert, but well-documented in peer-reviewed studies; the signals can be read reliably from the data (e.g. respiratory infection coming on, cardiovascular-risk trends, heart-failure decompensation in already-diagnosed people).
- **Tier 3 — Emerging / weak.** Plausible and researched, but noisy and not validated for individual use — a hint at most (e.g. mood proxies, thyroid hints, metabolic/diabetes hints from the watch alone).

Tier 3 items are shown **gently and clearly labelled as soft hints**, never as findings.

### 2.3 Your normal, not a universal ideal
Insights are based on **each person's own baseline** and on **sustained drifts over time**, not on single odd nights or one-off spikes. (The watch's own Vitals feature needs about a week of wear to learn a baseline; HeartSum follows the same patience.) The app explicitly teaches: *learn your normal, watch for trends.*

### 2.4 Clusters matter more than single numbers
One metric drifting is usually harmless. **Two or more drifting together** is a far stronger signal. HeartSum reflects this everywhere — it's calmer about a lone blip and pays more attention when several signals move the same way at once.

### 2.5 Plain language, always
Every number gets a plain-English meaning. No unexplained acronyms — ever. Every insight answers four questions: *What is this? Why does it matter? How sure are we? What should I do (if anything)?*

### 2.6 Reduce anxiety, don't manufacture it
The default emotional tone is calm and reassuring. Most of the time the honest message is *"you look normal — here's your steady baseline,"* and the app says so warmly. Concern is shown gently and rarely; good news is shown generously.

### 2.7 A bridge to real care
The app's highest purpose is to make the conversation with a real clinician **better and faster** — never to replace it. Every flag points outward toward a good question for a professional, not inward toward a self-diagnosis.

---

## 3 · Name, brand & tagline

### 3.1 The chosen name: HeartSum

The app is called **HeartSum**.

It's a friendly pun on **dim sum** (點心) — the little plates of food enjoyed over morning tea, a ritual especially loved by Hong Kong elders. *Dim sum* literally means something close to **"touch the heart,"** which is perfect for an app whose headline focus is heart health and whose whole job is to care for you. "Sum" also nods to the app *summing up* your scattered numbers into one clear picture.

The brand leans lightly into this **yum cha (morning tea) warmth**:

- Each health insight is a small, digestible **"dish."**
- The daily summary is like the **cart of dishes** brought to your table.
- The report you take to your doctor is the **"bill"** you settle together.

Keep this metaphor as a **light, warm garnish** — a touch of personality in the naming and microcopy — never so heavy that it makes the app feel gimmicky or undermines trust. The substance stays serious and trustworthy; the personality is gentle and human. A good test: an elder should feel *welcomed* by the warmth, and a clinician should feel *respected* by the seriousness, both at once.

### 3.2 Alternate names (in case you want options)

| Name | The idea behind it | Feel |
|---|---|---|
| **Longevi-Tea** | Longevity + Hong Kong milk tea. Leans into the metabolic/longevity focus and the tea ritual. | Playful, optimistic, a little cheeky |
| **Tai Chi Checkup** | The morning park-exercise ritual of HK elders — calm, daily, preventive. | Gentle, routine, reassuring |
| **Yum Cha Vitals** | Morning tea + the watch's "Vitals." Directly evokes the daily check-in over tea. | Warm, literal, friendly |
| **Po's Pulse** | "Po" (婆婆) = grandma. Affectionate, family-centred, heart-rate pun built in. | Tender, family-first, memorable |
| **Steady** *(spare option)* | Built on the product's core promise — "everything looks steady." Plain, calm, universal. | Minimal, trustworthy, age-neutral |

**Recommendation:** keep **HeartSum**. It carries the heart-health focus, the "touch the heart" meaning, the "sum up your numbers" promise, and the tea-house warmth — all without being hard to say or read for an older user.

### 3.3 Tagline & one-line description

**Tagline (recommended):** *Your health, served in small plates.*

Other taglines in the same spirit:
- *A little dish of insight, every day.*
- *Touch the heart of your health.*
- *Your numbers, finally making sense.*

**One-line description:** *HeartSum gathers your watch data and blood results into one calm dashboard, tells you plainly when something's worth a look, and gets you ready for your doctor.*

---

## 4 · Who it's for (with personas)

HeartSum serves two overlapping groups.

1. **Health-conscious adults** who already wear a smartwatch, enjoy seeing their numbers, and want to genuinely *understand* them and catch problems early — without needing a medical degree.
2. **Older and higher-risk adults** (think 50+, or anyone with cardiovascular or metabolic risk factors) who are focused on **prevention** and on getting more value out of their doctor visits. Many are less comfortable with cluttered, jargon-heavy apps, and some are set up and helped by an adult child or carer.

Because of the second group, **clarity and accessibility are first-class requirements, not afterthoughts**: large, readable text; high contrast; simple, uncluttered screens; plain language with zero unexplained jargon; generous tap targets; and an option for a trusted family member to help with setup or to view the dashboard.

A guiding question for every design decision: **would a smart 68-year-old who is not a "tech person" find this calm and obvious?**

### Personas

**Margaret, 67 — "I just want to know if I'm okay."**
Retired schoolteacher in Hong Kong. Got an Apple Watch as a gift from her daughter and likes it, but the Health app overwhelms her — too many charts, too many words she doesn't know. She has slightly high blood pressure and a family history of heart disease, and she sees her GP twice a year. She wants reassurance most days and a clear heads-up when something genuinely needs attention. She reads on a tablet, holds it close, and bumps the text size up. *HeartSum should feel to her like a calm friend who already did the worrying for her.*

**David, 41 — "Show me the trends, not the noise."**
Works long hours, wears his watch constantly, recently got a full blood panel from a private clinic. He's data-curious and wants to actually act on what he sees — improve his VO₂ max, watch his cholesterol, sleep better. He wants HeartSum to connect his watch data and his lab results and tell him what *matters* over months, not bury him in daily blips. *HeartSum should feel to him like a sharp, honest dashboard that respects his time.*

**Karen, 38 — "I'm setting this up for my dad."**
David's friend; helping her father (72, recently widowed, mild AFib history) get organised before his cardiology appointment. She'll do the setup, enter his medications, and check in on his dashboard remotely with his permission. She needs a clean "help a family member" path and the ability to view his picture and his doctor report. *HeartSum should make her feel like a capable, trusted helper — not a tech-support hotline.*

---

## 5 · Design & accessibility direction (the "Claude" aesthetic)

HeartSum should feel like it was designed by Anthropic — the same **warm, calm, human** aesthetic as Claude's own interface. The net effect: **trustworthy and premium, but warm and unintimidating** — the opposite of a scary medical dashboard. The warm cream-and-clay palette pairs naturally with the teahouse brand warmth.

### 5.1 Warm, paper-like backgrounds
Soft cream / ivory / warm off-white surfaces rather than stark clinical white or cold grey. The overall feeling is closer to a **quiet, well-lit room** than a hospital. Backgrounds feel like good paper — calm to rest your eyes on.

### 5.2 One warm signature accent
A muted **terracotta / clay / soft-coral** colour, used sparingly, for emphasis and key actions — warm and human, not a harsh medical blue or an alarming bright red. It marks the things you can *do* (the main buttons, the active state) and the occasional thing worth your eye, without ever shouting.

### 5.3 Soft, readable typography
An **elegant serif** for headlines and big numbers, paired with a **clean, friendly sans-serif** for body text. Comfortable sizes and generous line spacing — easy on older eyes. Numbers are large and confident; labels are plain words, never codes.

### 5.4 Calm, spacious layout
Lots of whitespace and breathing room. **Soft rounded cards** with gentle hairline borders and very subtle shadows. A clear visual hierarchy — one obvious thing to look at first on every screen. Never cramped, never busy. If a screen feels full, it's wrong.

### 5.5 A calm data-visualisation palette
Muted, harmonious colours for charts. **Reserve red strictly for genuine "please look at this" moments** — and even then, a warm, non-frightening red, never an emergency-siren red. Good is shown calmly (soft greens and neutrals); concern is shown gently. Charts emphasise your baseline band and the direction of travel, not jagged daily noise.

### 5.6 Editorial, human tone in the visuals
It should feel like **thoughtful writing and design**, not a control panel. Plain-language labels everywhere. Generous use of short, kind sentences alongside the numbers. The visual personality says: *someone who cares made this.*

### 5.7 Accessibility baked in
Treated as principles, not afterthoughts:

- **Strong contrast** between text and background, comfortably beyond the minimum.
- **Scalable text** — the whole layout stays calm and usable when text is enlarged.
- **Keyboard- and screen-reader-friendly** — everything reachable and clearly labelled in plain words.
- **Generous tap targets** — easy to hit, forgiving of imprecise taps.
- **A gentle optional dark mode** — warm and dim rather than harsh black-and-neon, for evening reading.
- **No reliance on colour alone** — a flag is always backed by words and a clear label, never just a coloured dot.

---

## 6 · The data it brings together

HeartSum unifies **three sources** of data. The first reference document is the definitive catalogue for everything the watch provides; the brief stays faithful to it and clearly marks anything that goes beyond it.

### 6.1 Wearable data (Apple Watch / Apple Health)

HeartSum imports the full range of metrics catalogued in the reference, grouped in plain language the way the reference groups them.

**Heart & circulation.** Heart rate; resting heart rate (your heart at complete rest — a daily summary); walking heart-rate average (a fitness trend indicator); heart-rate variability, or HRV (beat-to-beat timing variation that reflects recovery and nervous-system balance); heart-rate recovery (how fast your heart settles after exercise — higher is fitter); high and low heart-rate alerts (when your rate is unusual while you're at rest); irregular-rhythm notifications (a passive background check for a possible atrial-fibrillation rhythm); ECG results (an on-demand single-lead reading classified as Sinus / AFib / High or Low HR / Inconclusive); AFib History (for diagnosed users, the estimated share of time spent in atrial fibrillation); cardio fitness, or VO₂ max (estimated maximum oxygen uptake — a strong overall-health predictor); and the **hypertension notification** (signs of chronic high blood pressure detected over 30 days of passive vascular analysis — a *pattern*, not a blood-pressure number).

**Activity & energy.** Active energy (the Move ring) and resting energy; exercise minutes and stand minutes/hours; step count; walking + running distance; flights climbed; and overall daily movement.

**Workout performance.** Running, cycling, swimming and other workout metrics — pace, power, cadence, stride, swim strokes, and so on — described at a high level, since they matter mostly to the fitness-minded user.

**Mobility & gait.** Walking speed; walking step length; walking asymmetry (left/right timing differences — a limp or imbalance indicator); double-support time (how much of each stride has both feet down — lower is steadier); **walking steadiness** (classified OK / Low / Very Low — predicts fall risk); and the six-minute walk distance (a clinical mobility benchmark). Together these are the fall-risk and recovery signals.

**Respiratory & overnight vitals.** Respiratory rate (breaths per minute, mostly measured during sleep); blood oxygen, or SpO₂ (the share of hemoglobin carrying oxygen); overnight wrist temperature (nightly deviation from your personal baseline); and **breathing disturbances** during sleep (the basis for the sleep-apnea notification).

**Sleep.** Sleep stages (Awake, REM, Core/light, Deep, plus In Bed); time asleep and time in bed; the **0–100 Sleep Score** and its three parts — *duration* (the biggest lever), *bedtime consistency* (regularity, not late nights per se), and *interruptions* (how fragmented the night was); and the sleep-apnea notification (a 30-day pattern of breathing disturbances).

**Secondary domains (described more briefly, since they're not this app's focus).** Body measurements (weight, height, BMI, body-fat %, lean mass, waist — entered manually or from a smart scale, used to calibrate calculations); hearing (environmental and headphone sound exposure, with loud-exposure alerts); mind & lifestyle (mindful minutes, State of Mind mood logs, time in daylight, handwashing); and reproductive health / cycle tracking (menstrual logging, wrist-temperature ovulation estimates, and related fertility indicators).

> **On data import for this version.** Connecting the watch can be shown as a **realistic simulated / sample import** — the brief does not need to solve real device integration. What matters is the *experience* of connecting and then seeing your real-feeling data populate the dashboard. The sample data should be believable and varied enough to demonstrate baselines, trends, the occasional gentle flag, and the doctor report.

### 6.2 Blood biomarkers — where HeartSum goes beyond the watch

The reference is explicit: **the watch cannot measure blood chemistry** — no glucose, no cholesterol, no hormones, no real blood test. The watch's "metabolic / diabetes" and "thyroid" reads are indirect Tier-3 hints only. HeartSum fills this gap by letting people add their **lab results**, which is exactly what the heart-and-metabolic focus needs.

> **Source note.** The specific biomarkers below come from **general medical knowledge**, not from the two reference documents (the watch can't produce them). They are kept deliberately conservative, and HeartSum always presents them as *self-entered lab results to support a clinician's review* — never as diagnoses, and never with a HeartSum-invented "normal range" presented as medical fact.

Two friendly ways to add them:

1. **Manual entry** through simple forms, each test accompanied by a plain-language explanation of what it is and why it matters.
2. **Upload a lab report** (a PDF or a photo). The app reads it, pulls out the values, and then **asks the user to confirm** each one before anything is saved — *"We found 8 results. Please check these look right."*

The biomarkers to support for the app's focus areas:

| Biomarker | Plain-language meaning | Why HeartSum cares |
|---|---|---|
| Total cholesterol | The overall amount of cholesterol in your blood | Core heart-risk picture |
| LDL ("bad" cholesterol) | The kind that builds up in artery walls | A key cardiovascular lever |
| HDL ("good" cholesterol) | The kind that helps clear cholesterol away | Part of the lipid balance |
| Triglycerides | A blood fat tied to diet and metabolism | Heart and metabolic risk |
| ApoB *(ideal to include)* | A count of the cholesterol particles most linked to artery risk | A refined, modern heart-risk marker |
| Blood pressure (from a cuff) | Systolic/diastolic numbers | The reference notes the watch gives only a *pattern*, not a number — the cuff completes it |
| Fasting glucose | Blood sugar after not eating | Core metabolic signal the watch *cannot* measure |
| HbA1c | Your average blood sugar over ~3 months | The real, durable metabolic read |
| hs-CRP | A sensitive marker of low-grade inflammation | Links inflammation to heart risk |

A sensible **broader set** may be offered later (e.g. kidney and liver panels, thyroid labs, vitamin D, full blood count) — but always clearly noted as **beyond the reference documents' scope**, and always conservative.

### 6.3 Personal profile & history

A short, friendly setup captures the context that personalises everything: **age, sex, height/weight, known conditions, current medications, family history** (especially heart and metabolic conditions), and **lifestyle basics** (smoking, activity level). HeartSum uses this to interpret signals sensibly and to decide which risks to watch most closely — for example, weighting cholesterol more heavily for someone with a strong family history of heart disease.

This is framed as *"a little about you, so we can read your numbers the way they apply to you"* — never as a clinical intake form.

---

## 7 · The focus areas

HeartSum watches a person's whole picture, but it **leads with two focus areas**, because that's where the data and evidence are strongest and most actionable for our users. Everything else still surfaces — always with its correct evidence tier — but lower down.

### 7.1 Focus A — Heart & circulation (the headline)

HeartSum keeps an eye on cardiovascular and rhythm health by combining three layers:

- **The Tier-1 cleared flags.** Atrial fibrillation (irregular-rhythm notifications + on-demand ECG + AFib History burden); the hypertension *pattern* notification; low cardio fitness (VO₂ max), which is one of the strongest predictors of cardiovascular events and all-cause mortality; and high/low heart-rate events at rest.
- **The Tier-2 readable trends.** Overall cardiovascular-disease risk (low VO₂ max, a rising resting-heart-rate trend, and chronically low HRV — each independently linked to risk across large cohorts, with trends over months mattering most); stroke risk (indirect — via AFib detection, since AFib roughly 5× raises stroke risk); and heart-failure decompensation signals (rising resting HR, falling HRV, rising respiratory rate, dropping activity) — most useful for people *already diagnosed* and tracking their stability.
- **The blood biomarkers that complete the picture.** Cholesterol and the full lipid panel, blood pressure (from a cuff), and inflammation (hs-CRP).

HeartSum blends these into a clear, calm read on heart health — always tied to the person's own baseline and trends, never to a single reading. The headline message most days is a steady, reassuring summary; the detail is there when someone wants it.

### 7.2 Focus B — Metabolic health & longevity

HeartSum looks at the signals that track long-term metabolic health and healthspan:

- **From the watch (labelled by tier).** Cardio fitness (VO₂ max) as one of the strongest predictors of long-term health; resting-HR and HRV trends; activity levels; sleep quality; and body measurements. **Honest caveat, stated plainly:** the watch's "metabolic / diabetes" reads are **Tier-3 indirect hints only** — it does *not* measure blood sugar.
- **From blood work (the real metabolic signal).** Fasting glucose and HbA1c, the lipid panel, and inflammation markers.

This focus is framed around **prevention and longevity**: trends over months, gentle nudges, and the **modifiable levers** the reference highlights — aerobic fitness (which raises VO₂ max), sleep, and activity. The emotional register here is encouraging and forward-looking, not anxious.

### 7.3 Everything else (secondary insights)

Other conditions in the reference still surface in the app as **secondary insights** — always with their correct evidence tier: sleep apnea (Tier 1), respiratory infections coming on (Tier 2), fall risk and frailty (Tier 2), and the gentler Tier-3 hints (mood/depression, anxiety/stress, burnout, long-COVID recovery, anemia hints, thyroid hints, dehydration/heat strain, metabolic/diabetes hints, and menstrual/ovulation patterns). They live lower in the experience, shown calmly, and clearly marked as hints where the evidence is weak.

---

## 8 · How it turns data into understanding

This is the heart of the product. The "thinking" is described here non-technically, and it is grounded entirely in the reference documents — **the underlying logic, thresholds, and evidence tiers come from the references, not from an AI inventing medical claims.**

### 8.1 Learn the baseline
HeartSum learns each person's **personal normal** for the key signals. It needs a stretch of wear-time first — the way the watch's own Vitals feature needs about a week of nights before it can call anything "typical" or an "outlier." Everything afterward is judged against *your* normal, not a universal ideal.

### 8.2 Watch for drifts, not blips
Insights are based on **sustained changes** over days, weeks, and months — never one odd reading. A single high resting heart rate after a late night means little; a steady upward drift over weeks means something. HeartSum teaches this explicitly, so people don't over-react to noise.

### 8.3 The "canary" signals
The reference's reverse-map idea: a handful of signals do most of the early-warning work. When one drifts from baseline, HeartSum explains — in calm, plural, non-scary language — what it *might* point to:

| Canary signal | When it drifts, it may point to… |
|---|---|
| Resting heart rate ↑ | Infection, fever, overtraining, dehydration, stress, alcohol, early pregnancy, thyroid; a sustained upward trend → cardiovascular risk |
| HRV ↓ | Stress, poor recovery, infection onset, overtraining, anxiety/low mood, alcohol |
| Respiratory rate ↑ | Respiratory infection, fever, heart-failure worsening, alcohol |
| Wrist temperature ↑ | Infection/fever, menstrual-cycle phase, alcohol, a hot sleeping room |
| Blood oxygen (SpO₂) ↓ | Altitude, respiratory infection, sleep apnea, lung issues |
| Irregular pulse / ECG abnormality | Atrial fibrillation or another arrhythmia → the stroke-risk pathway |
| VO₂ max ↓ (trend) | Deconditioning; rising cardiovascular and mortality risk |
| Walking steadiness / gait ↓ | Fall risk, frailty, a neurological or musculoskeletal change |
| 2+ Vitals as outliers in one night | The general "something is off" alarm — most often illness, overtraining, travel, or alcohol |

The language is always *"this can point to a few things — here's what's worth keeping an eye on,"* never *"you have X."*

### 8.4 Combine signals responsibly
HeartSum recreates the reference's "combining signals" logic: certain *patterns* of several signals together point to certain interpretations — always shown as **possibilities to consider, never conclusions**.

| Pattern across signals | Most likely corresponds to |
|---|---|
| Resting HR up · HRV down · wrist temp up · respiratory rate up — together, overnight | Something coming on (or heavy alcohol / acute stress). Two-plus outliers = a stronger signal. |
| Training load "Well Above" · HRV & resting-HR outliers persisting for days | Overtraining / under-recovery — a nudge to rest |
| Repeatedly weak Sleep-Score *duration* · daytime HRV trending down | Accumulating sleep debt dragging on recovery |
| VO₂ max trending down · resting HR trending up over weeks | Deconditioning — fitness is slipping |
| Walking steadiness Low · walking speed falling · asymmetry rising | Elevated fall risk or an unresolved gait problem |
| Overnight SpO₂ dips · high breathing-disturbance index · fragmented sleep | Possible sleep apnea — worth discussing screening |
| Irregular-rhythm notifications · ECG returns "AFib" | Possible atrial fibrillation — worth medical evaluation |
| Hypertension notification · (optional cuff confirms high readings) | Possible chronic high blood pressure — worth clinical follow-up |
| Sleep Score high · Vitals all typical · training load steady/above | Well-recovered and adapting — a calm green light |

### 8.5 Always show the evidence tier
Every insight wears its **Tier 1 / Tier 2 / Tier 3 badge**, so people instantly know how seriously to take it. The badge is plain-worded next to its colour (e.g. *"Tier 1 · Cleared by regulators"*, *"Tier 2 · Strong research"*, *"Tier 3 · Early hint"*) — never colour alone.

### 8.6 Plain-language explanations (the four questions)
For every flag, HeartSum answers four questions in friendly words:
1. **What is this?**
2. **What might it mean?**
3. **How sure are we?** (the tier)
4. **What should I do?** — often simply *"nothing — just keep an eye on it."*

### 8.7 Honest about limits
HeartSum reproduces the reference's "what it can't do" honesty, in the open:
- **No blood chemistry** from the watch — glucose, cholesterol, hormones are indirect correlations at best (which is exactly why HeartSum adds blood work).
- **No blood-pressure number** from the watch — the hypertension notification flags a *pattern*; you still need a cuff.
- **It detects patterns, not single events** — most flags need days-to-weeks of data.
- **False alarms happen** — loose fit, tattoos, cold skin, motion, and artifacts all cause errors, and the watch can also miss real events.
- **Signals overlap** — the infection / stress / overtraining / hangover signatures look nearly identical; context is yours to add.
- **It is not a diagnostic device** for most of this list — Tier-1 features are cleared *screening* tools; Tiers 2–3 are wellness insights.

### 8.8 The role of AI
HeartSum can use AI to **write the plain-language explanations and summaries** and to phrase the doctor report warmly and clearly. But the AI's job is *translation and tone* — the **medical logic, thresholds, and evidence tiers come from the reference documents**, and the AI is never permitted to invent medical claims, diagnose, or recommend treatment changes.

---

## 9 · The experience, screen by screen

Each part is described so a designer and product team can picture and build it. Accessibility and the calm tone from §5 apply to every screen — especially given the older-adult audience.

### 9.1 Welcome & onboarding
A warm, reassuring first run. One or two friendly screens explain — in plain words — **what HeartSum is and is not**: an early-warning helper and a bridge to your doctor, *not* a diagnosis. It sets expectations calmly (*"Most days, we'll just tell you you're steady. Now and then, we'll gently flag something worth a look."*). It introduces the light tea-house warmth without overdoing it. And it offers a clear **"I'm helping a family member set this up"** path from the very start, so a carer like Karen isn't fighting the flow. Big type, one obvious button per screen, nothing to read that isn't kind.

### 9.2 Profile setup
The short, friendly questionnaire from §6.3: age, sex, body basics, known conditions, medications, family history, and lifestyle. Each question explains, in a sentence, *why it helps* (*"Family heart history helps us know which numbers to watch closely for you."*). It's paced gently — a few questions per screen — with easy skip-and-come-back. It never feels like a medical intake form; it feels like a friend getting to know you. Progress is shown calmly, and nothing is mandatory that doesn't need to be.

### 9.3 Connecting your data
Two clear paths, presented side by side:
- **Connect your Apple Watch / Apple Health** — shown as a smooth, believable simulated import that then **fills the dashboard** with the catalogued metrics. Good feedback throughout: *"Reading your last 90 days…"* → *"All set — we've brought in your heart, sleep, activity and vitals."*
- **Add your blood results** — the manual forms and the upload-a-lab-report path from §6.2, with confirmation feedback: *"We found 8 results. Please check these look right before we save them."*

The screen makes clear you can do one now and the other later, and that the dashboard gets richer as you add more.

### 9.4 The home dashboard — "Today"
The calm daily landing screen — *the one a user checks with their morning tea.* At a glance:
- **An overall reassuring status** — most days, *"Everything looks steady."* Shown warmly and large.
- **The day's key signals**, shown simply (a few headline numbers with plain labels and a calm sense of "in your normal range").
- **Any gentle flags worth noticing**, presented as small **"dishes" of insight** — never more than a few, never alarming by default.

Nothing flashes, nothing nags. If there's truly nothing to flag, the screen says so kindly and gets out of the way. The tea-cart metaphor lives here lightly — the day's insights arrive like small plates.

### 9.5 Health overview / the focus areas
A deeper view organised around the two focus areas, **Heart & circulation** and **Metabolic & longevity**, each with:
- a clear, calm summary of how things look,
- the key numbers behind it (with plain labels and evidence tiers),
- and the **trend direction** (steady / improving / worth watching).

**Secondary areas** (sleep, fitness, mobility, respiratory, mind, and so on) live here too, lower down, each shown with its correct tier. The page reads top-to-bottom from "what matters most for you" to "everything else we're keeping an eye on."

### 9.6 Insight detail / deep-dive
When someone taps an insight or a metric, a focused page explains it fully in plain words, structured around the four questions (§8.6): **what it is**, **your personal trend over time**, **what it might point to**, its **evidence tier**, and **what to do** (often: nothing). It includes the relevant chart in the calm visual style — baseline band, gentle line, your direction of travel. From here, the person can add a related item straight to **"What to ask your doctor."**

### 9.7 Trends over time
Friendly, readable charts that emphasise **your baseline and your direction of travel** over weeks and months — the thing that actually matters — rather than noisy daily numbers. Each chart leads with a one-sentence plain reading (*"Your resting heart rate has been steady for three months."*). Muted palette, soft gridlines, your normal range shown as a calm band so a single spike never looks frightening.

### 9.8 "What to ask your doctor"
A signature feature — described in full in **§10**.

### 9.9 The doctor report
The "settle the bill" moment — described in full in **§11**.

### 9.10 Learn / why this matters
A calm education area that mirrors the references: what each metric means, **how the three evidence tiers work**, the core philosophy (*learn your normal · watch for trends · clusters matter*), and the honest **"what this can't do"** list. Written editorially, in short warm pieces — this is where the app earns trust. It's browsable any time and linked contextually from insights (*"Curious what HRV is? Here's the plain version."*).

### 9.11 Notifications & flags
Gentle, infrequent, and never alarmist. A flag is surfaced **only** when a sustained drift or a genuine cluster warrants attention — never for a single blip. Every notification carries calm framing and a clear next step.

**Tone rules for notifications:**
- Lead with calm, not alarm. No red-alert language, no exclamation marks, no urgency where none is warranted.
- Always name the evidence tier in plain words.
- Always say what to do — and let "nothing for now, just keep an eye on it" be a perfectly normal answer.
- Never imply a diagnosis. Never mention medication or treatment changes.
- Be rare. If HeartSum is pinging often, something is wrong with HeartSum.

### 9.12 Settings, privacy & sharing
Manage connected data sources; manage **who can help or view** (family-member / carer access — granted by the user, revocable any time); control sharing; export everything; and delete everything. Privacy and control are **front and centre**, not buried. Plain-language toggles, clear consequences spelled out before any irreversible action.

---

## 10 · The "What to ask your doctor" feature

One of HeartSum's two killer features. It's a clear, **running list of specific, plain-language questions and topics** the app suggests raising with a clinician — generated from the person's *actual* flagged signals and biomarkers, not generic advice.

Examples of generated items (each grounded in the references and tagged with its tier):
- *"Ask about a sleep study"* — from a 30-day breathing-disturbance pattern *(Tier 1)*.
- *"Confirm your blood pressure with a cuff"* — from the hypertension pattern notification *(Tier 1)*.
- *"Discuss your cholesterol given your family history"* — from an entered lipid panel + family history *(blood work + profile)*.
- *"Mention your resting heart rate has been trending up over three months"* — from a Tier-2 cardiovascular-risk trend.

How it behaves:
- Each item **links back to the insight that prompted it** and shows its **evidence tier**, so both the user and the doctor can see *why* it's on the list.
- The person can **tick items off**, **add their own** questions, and reorder by what matters most to them.
- Ticked and added items **carry straight into the doctor report**, so nothing is forgotten in the room.
- The framing is always *"here are good things to raise"* — topics for a conversation, never instructions or self-diagnoses.

In the tea-house metaphor, this is the list of dishes you've decided are worth talking about — the things you'll bring to the table.

---

## 11 · The doctor report (PDF + shareable link)

The second killer feature. With **one clear button**, the user generates a professional summary they can share with their doctor, designed to make the appointment faster and more useful. In the brand's voice, this is **"the bill" you settle together.**

**Two formats, same content:**
- **A polished, print-ready PDF** the person can download, print, or email.
- **A secure shareable link** that opens a clean, read-only web version of the same summary.

**What the report contains and how it reads:**
- **A short, clinician-friendly header** — who the person is (age/sex and relevant history), the date range covered, and a one-line summary of the overall picture.
- **The flagged items worth review**, ordered by importance, each with: the signal or biomarker, the relevant trend or value, its **evidence tier**, and a **neutral, factual description**. Written in a tone a busy clinician will respect — concise, organised, and clearly framed as *patient-reported wellness data and self-entered lab results for your review*, not as diagnoses.
- **The key trends** — heart and metabolic focus first — shown as simple, legible charts or summaries in the calm visual style.
- **The person's questions and topics for the visit**, carried over from "What to ask your doctor."
- **A clear, prominent disclaimer**: this is consumer wellness data plus self-entered lab results to *support* — not replace — the clinician's judgement, and signals are not diagnoses.
- **A clean, calm visual design** matching the app — credible on a doctor's desk, easy to scan in a two-minute appointment window.

**The value, stated plainly:** it saves time in the visit, makes sure nothing important is forgotten, and helps the doctor quickly see *what changed* and *what the patient is worried about*. A patient who walks in with a HeartSum report is a patient the doctor can help faster.

**Consent:** a report is only shared when the person explicitly chooses to generate and share it. A shareable link can be revoked.

---

## 12 · Voice & example microcopy

**The voice:** warm, plain-spoken, calm, honest, and quietly reassuring — *a knowledgeable friend, not a doctor and not a marketer.* Short sentences. No hype, no fear. Always explain acronyms on first use. Always offer a "what to do" — and let that often be simply *"nothing — keep living your life, we'll keep watching."*

**Example microcopy:**

*A reassuring all-clear (the most common message):*
> **Everything looks steady today.** Your heart, sleep, and activity are all sitting comfortably in your normal range. Nothing to do — enjoy your morning tea. ☕

*A gentle Tier-2 flag:*
> **A small thing to keep an eye on.** Your resting heart rate has been drifting up a little over the past few weeks. On its own this is usually nothing — it can come from stress, poor sleep, or just a busy stretch. We'll keep watching the trend. *(Strong research · Tier 2)*

*A soft Tier-3 hint:*
> **Just a hint, not a finding.** A few of your recovery signals have been a touch low lately, which *can* track with stress or run-down stretches. This is an early, uncertain signal — we mention it only so you can notice how you're feeling. There's nothing to act on. *(Early hint · Tier 3)*

*A doctor-report line:*
> **Resting heart rate:** trended upward from ~58 to ~66 bpm over the past 90 days (patient baseline ~58). Reported here as wellness data for your review. *(Strong research · Tier 2)*

*A "what to ask your doctor" item:*
> **Confirm your blood pressure with a cuff.** Your watch noticed a pattern over 30 days that can suggest higher blood pressure — but the watch can't give an actual reading. A cuff at the clinic settles it. *(Cleared by regulators · Tier 1)*

---

## 13 · Trust, safety & privacy

- **"Signals, not diagnoses," everywhere.** The framing appears visibly throughout the app — on the dashboard, on insight pages, in notifications, and on the doctor report — not just in a footer. Every flag points toward a good question for a clinician, never toward a self-diagnosis.
- **Never advises changing treatment.** Taken straight from the references: HeartSum **never** advises starting, stopping, or changing any medication or treatment. This is an absolute rule, enforced in the AI's writing and in every template.
- **Health-data privacy as a core promise.** The person **owns their data**. They control all sharing, can **export or delete everything**, and **explicit consent is required** before any report is shared. Nothing leaves the person's control silently.
- **Family / carer access is granted, not assumed.** A user explicitly grants access to a family member or carer and can **revoke it any time**. The "help a family member set up" path makes this consent clear on both sides.
- **Regional honesty.** As the references state, **regulatory clearances and feature availability differ by country and region.** HeartSum describes signals carefully, avoids over-claiming, and doesn't present a region-restricted feature as universally available.

---

## 14 · Reference appendix — metrics, conditions & evidence tiers

This appendix maps the app's metrics, conditions, and evidence tiers back to the two reference documents, so the team can always trace a claim to its source.

### 14.1 Conditions & their evidence tiers (from *Conditions & Early Signals*)

| Condition / signal | Tier | Signals it reads | What HeartSum does with it |
|---|---|---|---|
| Atrial fibrillation (AFib) | **Tier 1** | Irregular-rhythm notifications, on-demand ECG, AFib History burden | Headline heart flag; feeds "ask your doctor" and report |
| Obstructive sleep apnea | **Tier 1** | Breathing-disturbance index from wrist motion in sleep | Secondary insight; prompts "ask about a sleep study" |
| Chronic hypertension | **Tier 1** | 30-day optical vascular-response pattern (no BP number) | Heart focus; prompts "confirm with a cuff" |
| Low cardiorespiratory fitness | **Tier 1** | Low VO₂ max for age/sex | Both focus areas; framed as modifiable |
| Acute cardiac events (rate) | **Tier 1** | High/low heart-rate notifications at rest | Heart focus; context-aware framing |
| Serious falls / crashes | **Tier 1** | Fall & crash detection (accel, gyro, barometer, GPS) | Safety context; detection, not prediction |
| Respiratory infection (COVID/flu/cold) | **Tier 2** | ↑ resting HR, ↑ respiratory rate, ↑ wrist temp, ↓ HRV overnight | Best-validated Tier 2; cluster signal |
| Cardiovascular disease risk | **Tier 2** | Low VO₂ max, ↑ resting-HR trend, chronically low HRV | Heart focus; trend-led, pairs with biomarkers |
| Pregnancy (early) & its course | **Tier 2** | ↑ resting HR, ↓ HRV, sleep/activity shifts, wrist temp | Surfaced gently if relevant |
| Stroke risk | **Tier 2** | Via AFib detection | Indirect; explained as the AFib pathway |
| Heart-failure decompensation | **Tier 2** | ↑ resting HR, ↓ HRV, ↑ respiratory rate, falling activity | Heart focus; most useful for already-diagnosed |
| Fall risk & frailty | **Tier 2** | Walking steadiness, gait speed, asymmetry, double-support, six-minute walk | Secondary insight; recovery tracking |
| Overtraining syndrome | **Tier 2** | High training load + HRV/resting-HR outliers + poor Sleep Score | Fitness insight; clearest "act now" pattern |
| Depression | **Tier 3** | ↓ HRV, altered REM/sleep timing, reduced activity, low mood logs | Soft hint only |
| Anxiety & chronic stress | **Tier 3** | ↓ HRV, ↑ resting HR, restless sleep, ↑ respiratory rate | Soft hint only |
| Burnout | **Tier 3** | Sustained low HRV + poor sleep + dropping activity | Soft hint, long-trend only |
| Long COVID | **Tier 3** | Persistently ↑ resting HR / altered HRV after infection | Soft hint; recovery tracking |
| Anemia | **Tier 3** | ↓ activity with ↑ HR for the same effort | Soft hint; defer to blood work |
| Thyroid dysfunction | **Tier 3** | ↑ or ↓ resting HR | Soft hint; defer to blood work |
| Dehydration / heat strain | **Tier 3** | ↑ HR at given effort, reduced performance | Soft hint, exertion only |
| Metabolic / diabetes risk | **Tier 3** | Low HRV, ↑ resting HR, low fitness, poor sleep | Soft hint; **watch cannot measure glucose** — defer to blood work |
| Menstrual / ovulation / perimenopause | **Tier 3** | Wrist-temp patterns, resting HR & HRV across the cycle | Soft hint; retrospective only |

### 14.2 Insight engines (from *Apple Watch Health Data*, §3)
- **Sleep Score (0–100)** — three weighted parts: duration (50, the biggest lever), bedtime consistency (30), interruptions (20). Personalised to recent history.
- **Sleep architecture** — Deep, REM, Core, Awake stages and what they mean.
- **Cardio fitness (VO₂ max) tiers** — Low / Below Average / Above Average / High, age- and sex-adjusted; trend matters more than the number.
- **Overnight Vitals** — learns a baseline (≥7 nights), flags each morning Typical or Outlier across resting HR, HRV, respiratory rate, wrist temperature, SpO₂; **two-or-more outliers** is the meaningful alarm.
- **Training Load** — 7-day vs 28-day exertion balance, cross-referenced with Vitals.
- **Heart-rhythm & BP insights** — irregular-rhythm notification, ECG classification, AFib History, high/low HR notifications, hypertension notification.
- **Recovery readiness** — a composite the user can read from HRV, resting HR, respiratory rate, wrist temperature, and Sleep Score.
- **Mobility, hearing & mind insights** — walking steadiness/fall risk, functional decline, hearing protection, wellbeing.

### 14.3 Beyond the references (clearly marked as general medical knowledge)
- **Blood biomarkers** — lipid panel (total cholesterol, LDL, HDL, triglycerides, ApoB), blood pressure (cuff), fasting glucose, HbA1c, hs-CRP, and any broader panel. The watch **cannot** measure any of these; HeartSum adds them via manual entry or lab-report upload, and always presents them conservatively as self-entered data for a clinician's review.
- **Personal profile & history** — age, sex, body basics, conditions, medications, family history, lifestyle. Used to personalise interpretation.

---

## 15 · Assumptions made & open questions for you

### Assumptions I made
1. **Apple-only for v1.** The brief is built around Apple Watch / Apple Health, as the references are. I assumed other wearables (Fitbit, Garmin, Oura, Samsung) are out of scope for now.
2. **Simulated data import for this version.** As you indicated, connecting the watch is shown as a realistic simulated/sample import; real device integration isn't solved here.
3. **English-first, Hong Kong–flavoured.** I assumed the launch language is English with the tea-house warmth as a light cultural garnish. Traditional Chinese localisation is likely wanted eventually but not specified.
4. **Web app, responsive.** I assumed a responsive web app usable on tablets and phones (Margaret reads on a tablet), not a native mobile app, since you said "web app."
5. **AI for wording only.** I assumed AI writes the plain-language text and report prose, while all medical logic and tiers come from the references — never AI-invented claims.
6. **Conservative biomarker handling.** I assumed HeartSum should *not* present its own "normal/abnormal" verdicts on blood results as medical fact, only flag them gently and defer ranges to the clinician. Confirm if you'd like reference ranges shown.
7. **Single-patient accounts with granted carer access.** I assumed each account is one person, with optional revocable family/carer viewing — not a multi-patient "family hub."

### Open questions for you
1. **Final name** — keep **HeartSum**, or do you want to explore one of the alternates (Longevi-Tea, Tai Chi Checkup, Yum Cha Vitals, Po's Pulse, Steady)?
2. **How far should blood work go?** Just the core heart/metabolic panel, or the broader set (kidney, liver, thyroid, vitamin D, full blood count)?
3. **Reference ranges on biomarkers** — show standard ranges with a clear "general guidance, not personalised" caveat, or stay fully neutral and defer entirely to the doctor?
4. **Cultural dial** — how strong should the dim-sum / yum-cha metaphor be in the actual UI copy? Light garnish (my default), or a touch more flavour?
5. **Carer model** — view-only access, or should a carer also be able to *edit* (e.g. enter medications, generate reports) on the user's behalf?
6. **Target region & regulatory posture** — Hong Kong first? This affects which Tier-1 features (SpO₂, hypertension, etc.) you can claim are available.
7. **Localisation priority** — is Traditional Chinese a v1 requirement, or a fast follow?
8. **Report recipients** — is the doctor report purely person-to-doctor, or do you also want a "share with a family member" variant of it?
```

*Prepared as a product vision brief for HeartSum. Every health metric, insight, and evidence tier traces back to the two accompanying reference documents; anything beyond them is marked as general medical knowledge and kept conservative.*
