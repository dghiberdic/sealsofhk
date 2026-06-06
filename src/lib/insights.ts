import { baseline, drift, recent, round, today } from "./analysis";
import type { FraminghamResult } from "./framingham";
import type {
  Biomarker,
  DayMetric,
  DoctorQuestion,
  Insight,
  Profile,
  Status,
} from "./types";

// ---------------------------------------------------------------------------
// Turn raw data into plain-language insights.
//
// IMPORTANT: the medical *logic, thresholds and evidence tiers* below come from
// the two reference documents (and, for blood work, conservative general
// knowledge clearly marked as such). Nothing here invents a diagnosis — every
// insight is framed as a signal to consider and, where relevant, to raise with
// a clinician.
// ---------------------------------------------------------------------------

export function buildInsights(
  metrics: DayMetric[],
  vo2: { date: string; value: number }[],
  biomarkers: Biomarker[],
  profile: Profile,
  fram: FraminghamResult,
): Insight[] {
  const list: Insight[] = [];
  const bm = (k: string) => biomarkers.find((b) => b.key === k);

  // --- HEART · Framingham 10-year CVD risk (real, published formula) --------
  if (fram.available && fram.riskPct != null) {
    const catStatus: Record<string, Status> = {
      low: "steady",
      moderate: "watch",
      high: "look",
    };
    const catWord = { low: "low", moderate: "moderate", high: "high" } as const;
    list.push({
      id: "cvd-risk",
      title: "10-year heart-risk estimate",
      focus: "heart",
      tier: 2,
      status: catStatus[fram.category!],
      oneLine: `Your estimated chance of a cardiovascular event in the next 10 years is about ${fram.riskPct}% — that's in the ${catWord[fram.category!]} band.`,
      what: "This is the Framingham General CVD Risk score — a long-established formula that combines your age, sex, cholesterol, blood pressure, smoking and diabetes into a single 10-year estimate.",
      meaning:
        fram.category === "low"
          ? "A low estimate is reassuring. Keeping it there is mostly about staying active and keeping your numbers steady."
          : "A moderate-to-high estimate doesn't mean anything is wrong now — it means the levers (blood pressure, cholesterol, activity) are worth a conversation with your doctor.",
      sure: "The formula is published and validated for ages 30–79 without prior heart disease. It's an estimate to discuss, not a verdict.",
      doThis:
        fram.category === "low"
          ? "Nothing in particular — keep doing what you're doing."
          : "Bring this number to your doctor. The inputs that move it most — blood pressure and cholesterol — are very treatable.",
      source: "combined",
    });
  }

  // --- HEART · Tier 1 · Hypertension pattern (cleared, watchOS 26) ----------
  list.push({
    id: "hypertension",
    title: "Blood-pressure pattern",
    focus: "heart",
    tier: 1,
    status: "look",
    oneLine: "Your watch noticed a pattern that can suggest higher blood pressure.",
    what: "Over 30 days, the watch quietly studied how your blood vessels respond to each heartbeat. It spotted a pattern that can go with chronic high blood pressure.",
    meaning:
      "High blood pressure is common, very treatable, and usually has no symptoms — which is exactly why a quiet pattern like this is worth knowing about.",
    sure: "This is a regulator-cleared notification. But the watch flags a pattern, not a number — it can't give you a real blood-pressure reading.",
    doThis:
      "Confirm it with a blood-pressure cuff at home or at the clinic, and mention it to your doctor. There's nothing to do on your own beyond that.",
    source: "watch",
  });

  // --- HEART · Tier 1 · Low cardio fitness (VO₂ max) ------------------------
  const vo2now = vo2[vo2.length - 1].value;
  list.push({
    id: "vo2",
    title: "Cardio fitness (VO₂ max)",
    focus: "heart",
    tier: 1,
    status: "watch",
    oneLine: `Your cardio fitness is sitting at the low end for your age — about ${vo2now} mL/kg·min.`,
    what: "Cardio fitness (VO₂ max) is an estimate of how much oxygen your body can use when working hard. It's one of the strongest single predictors of long-term health.",
    meaning:
      "A persistently low reading is linked to higher cardiovascular risk over time. The good news: it's one of the most changeable numbers you have.",
    sure: "This is a cleared notification, age- and sex-adjusted. The trend over months matters more than any single reading.",
    doThis:
      "Gentle, regular aerobic activity (brisk walks count) tends to raise it. Worth a mention at your next check-up — no urgency.",
    metric: undefined,
    source: "watch",
  });

  // --- HEART · Tier 2 · Cardiovascular-risk trend ---------------------------
  const rhr = drift(metrics, "restingHR");
  const hrv = drift(metrics, "hrv");
  if (rhr.dir === "up" || hrv.dir === "down") {
    list.push({
      id: "cv-trend",
      title: "Resting heart rate & HRV trend",
      focus: "heart",
      tier: 2,
      status: "watch",
      oneLine: `Your resting heart rate has drifted up (about ${round(
        rhr.base,
      )} → ${round(rhr.now)} bpm) while HRV has eased down.`,
      what: "Resting heart rate is your heart at complete rest. HRV is the tiny beat-to-beat timing variation that reflects recovery. Read together over weeks, they hint at how your cardiovascular system is doing.",
      meaning:
        "A slow rise in resting heart rate alongside a falling HRV can point toward deconditioning or general cardiovascular strain — but it can equally come from a stretch of stress, poor sleep, or less activity.",
      sure: "This is well-documented in research (Tier 2), but it's a trend to consider, not a conclusion. Single days mean nothing here — the direction over weeks is the point.",
      doThis:
        "Keep an eye on it and notice your sleep, stress and activity. If the drift continues, it's a good thing to raise with your doctor.",
      metric: "restingHR",
      metricUnit: "bpm",
      source: "watch",
    });
  }

  // --- HEART · blood · Cholesterol given family history ---------------------
  const ldl = bm("ldl");
  const apob = bm("apob");
  const familyHeart = profile.familyHistory.some((h) =>
    /heart|cardio|attack|stroke/i.test(h),
  );
  if (ldl && ldl.value !== null) {
    const high = ldl.refHigh != null && ldl.value > ldl.refHigh;
    list.push({
      id: "lipids",
      title: "Cholesterol (lipid panel)",
      focus: "heart",
      tier: 2,
      status: high ? "look" : "steady",
      oneLine: high
        ? `Your LDL (“bad” cholesterol) is ${ldl.value} ${ldl.unit}, above the common guidance band${
            apob && apob.value ? `, and ApoB is ${apob.value} ${apob.unit}` : ""
          }.`
        : "Your cholesterol looks to be in a reasonable range.",
      what: "These are blood-test numbers (your watch can't measure them). LDL is the cholesterol that builds up in artery walls; ApoB counts the particles most linked to artery risk.",
      meaning: high
        ? `Higher LDL/ApoB is a well-established heart-risk lever${
            familyHeart
              ? ", and it matters a little more for you given your family history of heart disease"
              : ""
          }.`
        : "Lipids in range are one fewer thing to worry about.",
      sure: "Cholesterol's link to heart risk is strong and well-established (general medical knowledge — not something the watch or the reference covers). The exact target for you is your doctor's call.",
      doThis: high
        ? "This is a good one to discuss with your doctor — especially what target is right for you. Don't change anything on your own."
        : "Nothing — keep doing what you're doing.",
      source: "blood",
    });
  }

  // --- METABOLIC · blood · Blood sugar (HbA1c / fasting glucose) ------------
  const hba1c = bm("hba1c");
  if (hba1c && hba1c.value !== null) {
    const high = hba1c.refHigh != null && hba1c.value > hba1c.refHigh;
    list.push({
      id: "glucose",
      title: "Blood sugar (HbA1c)",
      focus: "metabolic",
      tier: 2,
      status: high ? "watch" : "steady",
      oneLine: high
        ? `Your HbA1c is ${hba1c.value}%, just into the “keep an eye on it” range.`
        : "Your blood sugar looks steady.",
      what: "HbA1c is your average blood sugar over about three months — a blood test, not a watch reading. Your watch genuinely can't measure blood sugar at all.",
      meaning: high
        ? "A reading a little above the usual band can be an early, very modifiable sign worth watching — often it never progresses, especially with activity and diet."
        : "Blood sugar in range is reassuring.",
      sure: "This is the real metabolic signal (general medical knowledge). The watch's “metabolic” hints are only indirect (Tier 3) — this blood test is what actually counts.",
      doThis: high
        ? "Worth mentioning at your next visit. Movement after meals and steady sleep are gentle, sensible levers."
        : "Nothing — keep living your life.",
      source: "blood",
    });
  }

  // --- METABOLIC · Tier 3 · indirect watch hint (clearly soft) --------------
  list.push({
    id: "metabolic-watch-hint",
    title: "Metabolic hints from the watch",
    focus: "metabolic",
    tier: 3,
    status: "steady",
    oneLine: "Your watch can only hint at metabolic health — your blood work tells the real story.",
    what: "Low HRV, a higher resting heart rate, low fitness and poor sleep can loosely track with metabolic health.",
    meaning:
      "These are indirect correlates only. The watch does not measure blood glucose, so treat anything here as a faint hint, not a finding.",
    sure: "This is an emerging, noisy signal (Tier 3). We show it only for context — your HbA1c and fasting glucose are what matter.",
    doThis: "Nothing to act on. Lean on your blood results for the metabolic picture.",
    source: "watch",
  });

  // --- SECONDARY · Sleep apnea (Tier 1) — clear in this demo ----------------
  const breathingOk = recent(metrics, "spo2") > 95;
  list.push({
    id: "apnea",
    title: "Breathing during sleep",
    focus: "secondary",
    tier: 1,
    status: breathingOk ? "steady" : "watch",
    oneLine: breathingOk
      ? "No concerning pattern of breathing disturbances in your sleep."
      : "Some breathing disturbances showed up overnight.",
    what: "The watch watches for interruptions in your breathing during sleep — the basis for its sleep-apnea notification.",
    meaning: breathingOk
      ? "Your overnight blood oxygen and breathing look settled."
      : "A 30-day pattern of disturbances can suggest sleep apnea, which is very treatable.",
    sure: "Sleep-apnea screening is regulator-cleared (Tier 1). It needs a 30-day pattern, not a single odd night.",
    doThis: breathingOk
      ? "Nothing — this is an all-clear."
      : "Worth asking your doctor about a sleep study.",
    metric: "spo2",
    metricUnit: "%",
    source: "watch",
  });

  // --- SECONDARY · Sleep quality (Tier 2-ish, from Sleep Score) -------------
  const sleepNow = recent(metrics, "sleepScore");
  list.push({
    id: "sleep",
    title: "Sleep quality",
    focus: "secondary",
    tier: 2,
    status: sleepNow > 70 ? "steady" : "watch",
    oneLine: `Your Sleep Score is averaging about ${round(sleepNow)} out of 100 lately.`,
    what: "The Sleep Score blends how long you sleep (the biggest lever), how consistent your bedtime is, and how often you wake.",
    meaning:
      "Steady, good sleep supports almost everything else — recovery, mood, heart and metabolic health.",
    sure: "The score is personalised to your own recent history, not a universal ideal.",
    doThis:
      sleepNow > 70
        ? "Nothing — your sleep looks fine."
        : "If it dips, look at what's waking you (caffeine, alcohol, room temperature, noise).",
    metric: "sleepScore",
    metricUnit: "/100",
    source: "watch",
  });

  // --- SECONDARY · "Something coming on?" cluster (Tier 2) -------------------
  const t = today(metrics);
  const tempUp = t.wristTempDelta > 0.3;
  const rrUp = t.respiratoryRate > baseline(metrics, "respiratoryRate") + 1.5;
  const clusterCount =
    (t.vitalsOutliers >= 1 ? 1 : 0) + (tempUp ? 1 : 0) + (rrUp ? 1 : 0);
  list.push({
    id: "illness",
    title: "Are you fighting something?",
    focus: "secondary",
    tier: 2,
    status: clusterCount >= 2 ? "watch" : "steady",
    oneLine:
      clusterCount >= 2
        ? "A few overnight signals drifted together — your body may be working on something."
        : "No sign your body is fighting anything off.",
    what: "When resting heart rate, breathing rate and wrist temperature rise together overnight while HRV dips, it often means your body is busy — an infection coming on, or just a hard night or a drink.",
    meaning:
      "This is the classic “two or more Vitals outliers in one night” pattern. One signal alone is usually nothing; several together is more telling.",
    sure: "Well-documented (Tier 2) — but the infection, stress, overtraining and hangover signatures look nearly identical. The watch can't tell them apart; only you can add the context.",
    doThis:
      clusterCount >= 2
        ? "Rest, hydrate, and see how you feel in a day or two. See a doctor if you actually feel unwell."
        : "Nothing — all calm.",
    source: "watch",
  });

  return list;
}

// Build the "what to ask your doctor" list from the flagged insights + biomarkers.
export function buildQuestions(insights: Insight[]): DoctorQuestion[] {
  const qs: DoctorQuestion[] = [];
  const add = (q: DoctorQuestion) => qs.push(q);

  for (const i of insights) {
    if (i.status === "steady") continue;
    switch (i.id) {
      case "cvd-risk":
        add({
          id: "q-cvd",
          text: "Go over my 10-year heart-risk estimate",
          why: "My Framingham CVD risk came out in the moderate-to-high band — I'd like to understand which levers matter most for me.",
          tier: 2,
          insightId: "cvd-risk",
          source: "combined",
        });
        break;
      case "hypertension":
        add({
          id: "q-bp",
          text: "Confirm my blood pressure with a cuff",
          why: "My watch flagged a 30-day pattern that can suggest higher blood pressure, but it can't give an actual reading.",
          tier: 1,
          insightId: "hypertension",
          source: "watch",
        });
        break;
      case "vo2":
        add({
          id: "q-vo2",
          text: "Discuss my low cardio fitness (VO₂ max)",
          why: "It's sitting at the low end for my age, which links to cardiovascular risk — and I'd like to know how best to improve it.",
          tier: 1,
          insightId: "vo2",
          source: "watch",
        });
        break;
      case "cv-trend":
        add({
          id: "q-cv",
          text: "Mention my resting heart rate has trended up over weeks",
          why: "It's drifted up while my HRV eased down — a trend worth a second opinion.",
          tier: 2,
          insightId: "cv-trend",
          source: "watch",
        });
        break;
      case "lipids":
        add({
          id: "q-lipids",
          text: "Review my cholesterol given my family history",
          why: "My LDL/ApoB are above the usual guidance band, and there's heart disease in my family.",
          tier: 2,
          insightId: "lipids",
          source: "blood",
        });
        break;
      case "glucose":
        add({
          id: "q-glucose",
          text: "Talk about my HbA1c (blood sugar)",
          why: "It's just above the usual range — I'd like to know if anything's worth doing now.",
          tier: 2,
          insightId: "glucose",
          source: "blood",
        });
        break;
      case "apnea":
        add({
          id: "q-apnea",
          text: "Ask about a sleep study",
          why: "My watch noticed a pattern of breathing disturbances overnight.",
          tier: 1,
          insightId: "apnea",
          source: "watch",
        });
        break;
      default:
        break;
    }
  }
  return qs;
}

export function overallStatus(insights: Insight[]): {
  level: "steady" | "watch" | "look";
  count: number;
} {
  const look = insights.filter((i) => i.status === "look").length;
  const watch = insights.filter((i) => i.status === "watch").length;
  if (look > 0) return { level: "look", count: look };
  if (watch > 0) return { level: "watch", count: watch };
  return { level: "steady", count: 0 };
}
