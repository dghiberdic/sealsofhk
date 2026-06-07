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

// Population VO₂max norm (mL/kg·min), age/sex-adjusted. Base is the mid-point of
// the reference's 30-something band (~40–44 men / 35–38 women), declining
// ~8%/decade. Used only to *classify* a reading against typical — never a target.
type Vo2Tier = "low" | "belowAverage" | "aboveAverage" | "high";
function vo2Tier(value: number, age: number, sex: Profile["sex"]): Vo2Tier {
  const base = sex === "male" ? 42 : 36; // female norm covers "other" too
  const norm = base * Math.pow(0.92, Math.max(0, (age - 30) / 10));
  const ratio = value / norm;
  if (ratio < 0.85) return "low";
  if (ratio < 1.0) return "belowAverage";
  if (ratio < 1.18) return "aboveAverage";
  return "high";
}

export function buildInsights(
  metrics: DayMetric[],
  vo2: { date: string; value: number }[],
  biomarkers: Biomarker[],
  profile: Profile,
  fram: FraminghamResult,
): Insight[] {
  const list: Insight[] = [];
  const bm = (k: string) => biomarkers.find((b) => b.key === k);
  const hasMetrics = metrics.length > 0;

  // --- HEART · Framingham 10-year CVD risk (real, published formula) --------
  if (fram.available && fram.riskPct != null) {
    const catStatus: Record<string, Status> = {
      low: "steady",
      moderate: "watch",
      high: "look",
    };
    const catWord = { low: "low", moderate: "moderate", high: "high" } as const;
    const catWordZh = { low: "低", moderate: "中等", high: "高" } as const;
    list.push({
      id: "cvd-risk",
      title: "10-year heart-risk estimate",
      titleZh: "十年心臟風險估算",
      focus: "heart",
      tier: 2,
      status: catStatus[fram.category!],
      oneLine: `Your estimated chance of a cardiovascular event in the next 10 years is about ${fram.riskPct}% — that's in the ${catWord[fram.category!]} band.`,
      oneLineZh: `你未來十年發生心血管事件的估計機會約為 ${fram.riskPct}%——屬於${catWordZh[fram.category!]}風險。`,
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

  // --- HEART · Tier 1 · Blood pressure (cuff reading + watch pattern) -------
  // Classified by the ACC/AHA 2017 stages from the actual cuff numbers — the
  // watch flags a 30-day pattern but never produces a value, so the cuff is the
  // real signal. Omitted entirely if no cuff reading is on file.
  const sysB = bm("systolic");
  const diaB = bm("diastolic");
  const sys = sysB?.value ?? null;
  const dia = diaB?.value ?? null;
  if (sys != null || dia != null) {
    const stage2 = (sys != null && sys >= 140) || (dia != null && dia >= 90);
    const stage1 = (sys != null && sys >= 130) || (dia != null && dia >= 80);
    const bpStatus: Status = stage2 ? "look" : stage1 ? "watch" : "steady";
    const reading =
      sys != null && dia != null
        ? `${sys}/${dia} mmHg`
        : sys != null
          ? `${sys} mmHg (systolic)`
          : `${dia} mmHg (diastolic)`;
    const treated = profile.onBpMeds;
    list.push({
      id: "hypertension",
      title: "Blood pressure",
      titleZh: "血壓",
      focus: "heart",
      tier: 1,
      status: bpStatus,
      oneLine:
        bpStatus === "steady"
          ? `Your blood pressure is ${reading} — comfortably in range.`
          : bpStatus === "watch"
            ? `Your blood pressure is ${reading} — a little above ${treated ? "target while on treatment" : "the ideal range"}.`
            : `Your blood pressure is ${reading} — in the high range.`,
      oneLineZh:
        bpStatus === "steady"
          ? `你的血壓為 ${reading}——處於理想範圍。`
          : bpStatus === "watch"
            ? `你的血壓為 ${reading}——略高於${treated ? "服藥後的目標" : "理想範圍"}。`
            : `你的血壓為 ${reading}——處於偏高範圍。`,
      what: "Blood pressure is the force of blood against your artery walls, read from a cuff. The watch can flag a 30-day vascular pattern, but only a cuff gives an actual number.",
      meaning:
        bpStatus === "steady"
          ? "In-range blood pressure is one of the biggest things you can have working for your heart."
          : `High blood pressure is common, usually silent, and very treatable${treated ? " — yours is already being managed, and these numbers help your doctor fine-tune it" : ""}.`,
      sure: "A single reading can be raised by stress, caffeine or a recent walk — the pattern over time is what counts. The cuff is the real measure; the watch only hints.",
      doThis:
        bpStatus === "steady"
          ? "Nothing — keep doing what you're doing."
          : "Keep a short log of cuff readings at home and review them with your doctor. Never change blood-pressure medication on your own.",
      source: "combined",
    });
  }

  // --- HEART · Tier 1 · Low cardio fitness (VO₂ max), age/sex-adjusted ------
  if (vo2.length) {
    const vo2now = vo2[vo2.length - 1].value;
    const tier = vo2Tier(vo2now, profile.age, profile.sex);
    const low = tier === "low" || tier === "belowAverage";
    const vo2Status: Status = low ? "watch" : "steady";
    const tierWord: Record<Vo2Tier, string> = {
      low: "on the low side",
      belowAverage: "a little below typical",
      aboveAverage: "in the healthy range",
      high: "above typical — excellent",
    };
    const tierWordZh: Record<Vo2Tier, string> = {
      low: "偏低",
      belowAverage: "略低於一般",
      aboveAverage: "在健康範圍內",
      high: "高於一般——非常好",
    };
    list.push({
      id: "vo2",
      title: "Cardio fitness (VO₂ max)",
      titleZh: "心肺適能 (VO₂ max)",
      focus: "heart",
      tier: 1,
      status: vo2Status,
      oneLine: `Your cardio fitness is about ${vo2now} mL/kg·min — ${tierWord[tier]} for your age and sex.`,
      oneLineZh: `你的心肺適能約為 ${vo2now} mL/kg·min——以你的年齡和性別而言${tierWordZh[tier]}。`,
      what: "Cardio fitness (VO₂ max) is an estimate of how much oxygen your body can use when working hard. It's one of the strongest single predictors of long-term health.",
      meaning: low
        ? "A reading on the low side is linked to higher cardiovascular risk over time — but it's also one of the most changeable numbers you have."
        : "A reading in or above the typical range for your age is a genuinely good sign for long-term heart health.",
      sure: "This is age- and sex-adjusted against population norms. The trend over months matters more than any single reading.",
      doThis: low
        ? "Gentle, regular aerobic activity (brisk walks count) tends to raise it. Worth a mention at your next check-up — no urgency."
        : "Nothing needed — keep up whatever you're doing.",
      metric: undefined,
      source: "watch",
    });
  }

  // --- HEART · Tier 2 · Cardiovascular-risk trend ---------------------------
  const rhr = drift(metrics, "restingHR");
  const hrv = drift(metrics, "hrv");
  if (hasMetrics && (rhr.dir === "up" || hrv.dir === "down")) {
    list.push({
      id: "cv-trend",
      title: "Resting heart rate & HRV trend",
      titleZh: "靜止心率及心率變異趨勢",
      focus: "heart",
      tier: 2,
      status: "watch",
      oneLine: `Your resting heart rate has drifted up (about ${round(
        rhr.base,
      )} → ${round(rhr.now)} bpm) while HRV has eased down.`,
      oneLineZh: `你的靜止心率有上升趨勢（約 ${round(rhr.base)} → ${round(
        rhr.now,
      )} bpm），同時心率變異下降。`,
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
      titleZh: "膽固醇（血脂）",
      focus: "heart",
      tier: 2,
      status: high ? "look" : "steady",
      oneLine: high
        ? `Your LDL (“bad” cholesterol) is ${ldl.value} ${ldl.unit}, above the common guidance band${
            apob && apob.value ? `, and ApoB is ${apob.value} ${apob.unit}` : ""
          }.`
        : "Your cholesterol looks to be in a reasonable range.",
      oneLineZh: high
        ? `你的低密度膽固醇（壞膽固醇）為 ${ldl.value} ${ldl.unit}，高於常用指引範圍${
            apob && apob.value ? `，載脂蛋白 B 為 ${apob.value} ${apob.unit}` : ""
          }。`
        : "你的膽固醇看來在合理範圍。",
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
      titleZh: "血糖 (HbA1c)",
      focus: "metabolic",
      tier: 2,
      status: high ? "watch" : "steady",
      oneLine: high
        ? `Your HbA1c is ${hba1c.value}%, just into the “keep an eye on it” range.`
        : "Your blood sugar looks steady.",
      oneLineZh: high
        ? `你的糖化血紅素為 ${hba1c.value}%，剛進入「需要留意」的範圍。`
        : "你的血糖看來平穩。",
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
    titleZh: "手錶的代謝提示",
    focus: "metabolic",
    tier: 3,
    status: "steady",
    oneLine: "Your watch can only hint at metabolic health — your blood work tells the real story.",
    oneLineZh: "手錶只能間接提示代謝健康——你的驗血才是真正的依據。",
    what: "Low HRV, a higher resting heart rate, low fitness and poor sleep can loosely track with metabolic health.",
    meaning:
      "These are indirect correlates only. The watch does not measure blood glucose, so treat anything here as a faint hint, not a finding.",
    sure: "This is an emerging, noisy signal (Tier 3). We show it only for context — your HbA1c and fasting glucose are what matter.",
    doThis: "Nothing to act on. Lean on your blood results for the metabolic picture.",
    source: "watch",
  });

  // --- SECONDARY · Sleep apnea (Tier 1) — 30-day breathing-disturbance pattern
  // The real signal is the Breathing-Disturbances index, not SpO₂ — a sleep-apnea
  // notification needs a 30-day *pattern* of elevated nights, not one odd night.
  if (hasMetrics) {
    const last30 = metrics.slice(-30);
    const elevatedNights = last30.filter(
      (m) => Number(m.breathingDisturbances) >= 8,
    ).length;
    const lowSpo2 = recent(metrics, "spo2") < 95;
    const apneaPattern = elevatedNights >= 10 || lowSpo2;
    list.push({
      id: "apnea",
      title: "Breathing during sleep",
      titleZh: "睡眠時的呼吸",
      focus: "secondary",
      tier: 1,
      status: apneaPattern ? "watch" : "steady",
      oneLine: !apneaPattern
        ? "No concerning pattern of breathing disturbances in your sleep."
        : elevatedNights >= 10
          ? `Breathing disturbances were elevated on ${elevatedNights} of the last 30 nights.`
          : "Your overnight blood oxygen dipped below its usual range on a few nights.",
      oneLineZh: !apneaPattern
        ? "睡眠時的呼吸沒有令人擔心的中斷模式。"
        : elevatedNights >= 10
          ? `過去 30 晚中有 ${elevatedNights} 晚呼吸中斷指數偏高。`
          : "你過夜的血氧在數晚低於平常範圍。",
      what: "The watch tracks interruptions in your breathing during sleep (the Breathing-Disturbances index) — the basis for its sleep-apnea notification.",
      meaning: apneaPattern
        ? "A 30-day pattern of disturbances can suggest sleep apnea, which is very treatable."
        : "Your overnight breathing and blood oxygen look settled.",
      sure: "Sleep-apnea screening is regulator-cleared (Tier 1). It needs a 30-day pattern, not a single odd night.",
      doThis: apneaPattern
        ? "Worth asking your doctor about a sleep study."
        : "Nothing — this is an all-clear.",
      metric: "breathingDisturbances",
      metricUnit: "/h",
      source: "watch",
    });
  }

  // --- SECONDARY · Sleep quality — judged against the person's OWN normal ---
  if (hasMetrics) {
    const sleepNow = recent(metrics, "sleepScore");
    const sleepBase = baseline(metrics, "sleepScore");
    // Flag only if meaningfully below your own baseline, or genuinely low.
    const sleepLow = sleepNow < 60 || (sleepBase > 0 && sleepNow < sleepBase * 0.9);
    list.push({
      id: "sleep",
      title: "Sleep quality",
      titleZh: "睡眠質素",
      focus: "secondary",
      tier: 2,
      status: sleepLow ? "watch" : "steady",
      oneLine: `Your Sleep Score is averaging about ${round(sleepNow)} out of 100 lately${
        sleepLow ? ` — below your own usual of ${round(sleepBase)}` : ""
      }.`,
      oneLineZh: `你最近的睡眠評分平均約為 ${round(sleepNow)} 分（100 分滿分）${
        sleepLow ? `——低於你平常的 ${round(sleepBase)} 分` : ""
      }。`,
      what: "The Sleep Score blends how long you sleep (the biggest lever), how consistent your bedtime is, and how often you wake.",
      meaning:
        "Steady, good sleep supports almost everything else — recovery, mood, heart and metabolic health.",
      sure: "The score is personalised to your own recent history, not a universal ideal — we only flag it when it slips below your normal.",
      doThis: sleepLow
        ? "Look at what's changed — caffeine, alcohol, room temperature, noise — and see if it recovers over a week or two."
        : "Nothing — your sleep looks fine.",
      metric: "sleepScore",
      metricUnit: "/100",
      source: "watch",
    });
  }

  // --- SECONDARY · "Something coming on?" cluster (Tier 2) -------------------
  if (hasMetrics) {
    const t = today(metrics);
    const tempUp = t.wristTempDelta > 0.3;
    const rrUp = t.respiratoryRate > baseline(metrics, "respiratoryRate") + 1.5;
    const clusterCount =
      (t.vitalsOutliers >= 1 ? 1 : 0) + (tempUp ? 1 : 0) + (rrUp ? 1 : 0);
    list.push({
      id: "illness",
      title: "Are you fighting something?",
      titleZh: "身體是否在對抗甚麼？",
      focus: "secondary",
      tier: 2,
      status: clusterCount >= 2 ? "watch" : "steady",
      oneLine:
        clusterCount >= 2
          ? "A few overnight signals drifted together — your body may be working on something."
          : "No sign your body is fighting anything off.",
      oneLineZh:
        clusterCount >= 2
          ? "過夜有幾項訊號一起偏移——你的身體可能正在處理甚麼。"
          : "沒有跡象顯示你的身體正在對抗甚麼。",
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
  }

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
          textZh: "與醫生檢視我的十年心臟風險估算",
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
          textZh: "用血壓計確認我的血壓",
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
          textZh: "討論我偏低的心肺適能 (VO₂ max)",
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
          textZh: "提及我的靜止心率近數週有上升趨勢",
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
          textZh: "考慮我的家族病史，覆檢我的膽固醇",
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
          textZh: "談談我的糖化血紅素（血糖）",
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
          textZh: "詢問是否需要做睡眠測試",
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
