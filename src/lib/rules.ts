import type { DayMetric, EcgReading, RhythmEvent } from "./types";

// ---------------------------------------------------------------------------
// Watch-based alert rules (W1–W9) — deterministic threshold rules on the
// Apple Watch series. Each compares a recent window against the patient's own
// rolling baseline. No model, no diagnosis — just published trend thresholds.
// ---------------------------------------------------------------------------

export type Severity = "yellow" | "red";

export interface FiredRule {
  id: string;
  label: string;
  severity: Severity;
  baseline: number;
  current: number;
  pctChange: number; // signed %, 1 dp
  sustainedDays: number;
  detail: string; // templated clinician-report sentence
  detailZh?: string; // same sentence in Traditional Chinese
}

export interface OkItem {
  label: string;
  labelZh?: string;
  note: string;
  noteZh?: string;
}

export interface WatchAssessment {
  fired: FiredRule[];
  ok: OkItem[];
  status: "green" | "yellow" | "red";
  rhr: { baseline: number; current: number; pct: number };
  hrv: { baseline: number; current: number; pct: number };
  steps: { baseline: number; current: number; pct: number };
  caretaker: { en: string; zh: string };
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const r0 = (n: number) => Math.round(n);
const r1 = (n: number) => Math.round(n * 10) / 10;

// 3-day rolling smoothing — keeps daily sensor noise from breaking "sustained".
function smooth(xs: number[], w = 3): number[] {
  return xs.map((_, i) => mean(xs.slice(Math.max(0, i - w + 1), i + 1)));
}

// Consecutive trailing days (on the smoothed series) that pass a test.
function trailing(smoothed: number[], pass: (v: number) => boolean): number {
  let n = 0;
  for (let i = smoothed.length - 1; i >= 0; i--) {
    if (pass(smoothed[i])) n++;
    else break;
  }
  return n;
}

export function assessWatch(
  metrics: DayMetric[],
  ecg: EcgReading[],
  rhythmEvents: RhythmEvent[],
  name: string,
): WatchAssessment {
  const series = (k: keyof DayMetric) => metrics.map((m) => Number(m[k]));
  // baseline = the patient's earliest stable window; recent = the last 7 days.
  const baseOf = (xs: number[], n = 30) => mean(xs.slice(0, n));
  const recentOf = (xs: number[], n = 7) => mean(xs.slice(-n));

  const fired: FiredRule[] = [];
  const ok: OkItem[] = [];

  // --- Resting HR (W1 yellow / W2 red) ------------------------------------
  const rhr = series("restingHR");
  const rhrBase = baseOf(rhr);
  const rhrNow = recentOf(rhr);
  const rhrPct = ((rhrNow - rhrBase) / rhrBase) * 100;
  const rhrSm = smooth(rhr);
  const rhrUp20 = trailing(rhrSm, (v) => v >= rhrBase * 1.2);
  const rhrUp10 = trailing(rhrSm, (v) => v >= rhrBase * 1.1);
  if (rhrPct > 20 && rhrUp20 >= 3) {
    fired.push({
      id: "W2",
      label: "Resting heart rate sharply up",
      severity: "red",
      baseline: r0(rhrBase),
      current: r0(rhrNow),
      pctChange: r1(rhrPct),
      sustainedDays: rhrUp20,
      detail: `Resting heart rate has increased ${r1(rhrPct)}% over the past 30 days (${r0(rhrBase)} to ${r0(rhrNow)} bpm).`,
      detailZh: `靜止心率在過去 30 天上升了 ${r1(rhrPct)}%（由 ${r0(rhrBase)} 升至 ${r0(rhrNow)} bpm）。`,
    });
  } else if (rhrPct > 10 && rhrUp10 >= 5) {
    fired.push({
      id: "W1",
      label: "Resting heart rate trending up",
      severity: "yellow",
      baseline: r0(rhrBase),
      current: r0(rhrNow),
      pctChange: r1(rhrPct),
      sustainedDays: rhrUp10,
      detail: `Resting heart rate has increased ${r1(rhrPct)}% over the past 30 days (${r0(rhrBase)} to ${r0(rhrNow)} bpm).`,
      detailZh: `靜止心率在過去 30 天上升了 ${r1(rhrPct)}%（由 ${r0(rhrBase)} 升至 ${r0(rhrNow)} bpm）。`,
    });
  }

  // --- HRV / SDNN (W3 yellow / W4 red) ------------------------------------
  const hrv = series("hrv");
  const hrvBase = baseOf(hrv);
  const hrvNow = recentOf(hrv);
  const hrvPct = ((hrvNow - hrvBase) / hrvBase) * 100;
  const hrvSm = smooth(hrv);
  const hrvDn35 = trailing(hrvSm, (v) => v <= hrvBase * 0.65);
  const hrvDn20 = trailing(hrvSm, (v) => v <= hrvBase * 0.8);
  if (hrvPct < -35 && hrvDn35 >= 3) {
    fired.push({
      id: "W4",
      label: "HRV sharply down",
      severity: "red",
      baseline: r0(hrvBase),
      current: r0(hrvNow),
      pctChange: r1(hrvPct),
      sustainedDays: hrvDn35,
      detail: `Heart rate variability has decreased ${Math.abs(r1(hrvPct))}% over the same period (${r0(hrvBase)} to ${r0(hrvNow)} ms).`,
      detailZh: `心率變異在同期下降了 ${Math.abs(r1(hrvPct))}%（由 ${r0(hrvBase)} 降至 ${r0(hrvNow)} ms）。`,
    });
  } else if (hrvPct < -20 && hrvDn20 >= 5) {
    fired.push({
      id: "W3",
      label: "HRV trending down",
      severity: "yellow",
      baseline: r0(hrvBase),
      current: r0(hrvNow),
      pctChange: r1(hrvPct),
      sustainedDays: hrvDn20,
      detail: `Heart rate variability has decreased ${Math.abs(r1(hrvPct))}% over the same period (${r0(hrvBase)} to ${r0(hrvNow)} ms).`,
      detailZh: `心率變異在同期下降了 ${Math.abs(r1(hrvPct))}%（由 ${r0(hrvBase)} 降至 ${r0(hrvNow)} ms）。`,
    });
  }

  // --- SpO2 (W5 red): <93% on ≥2 readings in a day ------------------------
  const lowSpo2Days = metrics.slice(-30).filter((m) => m.spo2 < 93).length;
  if (lowSpo2Days >= 2) {
    fired.push({
      id: "W5",
      label: "Low blood oxygen",
      severity: "red",
      baseline: 95,
      current: r0(recentOf(series("spo2"))),
      pctChange: 0,
      sustainedDays: lowSpo2Days,
      detail: `Blood oxygen fell below 93% on ${lowSpo2Days} readings.`,
      detailZh: `血氧在 ${lowSpo2Days} 次讀數中低於 93%。`,
    });
  } else {
    ok.push({
      label: "Blood oxygen",
      labelZh: "血氧",
      note: `${r0(recentOf(series("spo2")))}% average, no readings below 93%`,
      noteZh: `平均 ${r0(recentOf(series("spo2")))}%，沒有低於 93% 的讀數`,
    });
  }

  // --- ECG (W6 red) -------------------------------------------------------
  const afib = ecg.filter((e) => e.classification === "atrialFibrillation");
  if (afib.length) {
    fired.push({
      id: "W6",
      label: "AFib detected on ECG",
      severity: "red",
      baseline: 0,
      current: afib.length,
      pctChange: 0,
      sustainedDays: 0,
      detail: `${afib.length} ECG reading(s) classified as atrial fibrillation.`,
      detailZh: `${afib.length} 次心電圖讀數被分類為心房顫動。`,
    });
  } else if (ecg.length) {
    ok.push({
      label: "ECG",
      labelZh: "心電圖",
      note: `${ecg.length} readings, all sinus rhythm`,
      noteZh: `${ecg.length} 次讀數，全部為竇性心律`,
    });
  }

  // --- Irregular-rhythm notification (W7 yellow) --------------------------
  if (rhythmEvents.length) {
    fired.push({
      id: "W7",
      label: "Irregular-rhythm notification",
      severity: "yellow",
      baseline: 0,
      current: rhythmEvents.length,
      pctChange: 0,
      sustainedDays: 0,
      detail: `${rhythmEvents.length} irregular-rhythm notification(s) fired.`,
      detailZh: `觸發了 ${rhythmEvents.length} 次不規則心律通知。`,
    });
  }

  // --- Steps (W8 yellow): ↓>40% vs 14-day mean, sustained ≥5d -------------
  const steps = series("steps");
  const stepsBase = baseOf(steps, 14);
  const stepsNow = recentOf(steps);
  const stepsPct = ((stepsNow - stepsBase) / stepsBase) * 100;
  const stepsSm = smooth(steps);
  const stepsDn = trailing(stepsSm, (v) => v <= stepsBase * 0.6);
  if (stepsPct < -40 && stepsDn >= 5) {
    fired.push({
      id: "W8",
      label: "Activity dropped",
      severity: "yellow",
      baseline: r0(stepsBase),
      current: r0(stepsNow),
      pctChange: r1(stepsPct),
      sustainedDays: stepsDn,
      detail: `Daily step count dropped ${Math.abs(r1(stepsPct))}% (${r0(stepsBase)} to ${r0(stepsNow)} steps/day).`,
      detailZh: `每日步數下跌了 ${Math.abs(r1(stepsPct))}%（由 ${r0(stepsBase)} 降至 ${r0(stepsNow)} 步／日）。`,
    });
  } else {
    ok.push({
      label: "Steps",
      labelZh: "步數",
      note: `${r0(stepsNow)}/day average (${r1(stepsPct)}% vs prior)`,
      noteZh: `平均每日 ${r0(stepsNow)} 步（較之前 ${r1(stepsPct)}%）`,
    });
  }

  // --- Walking HR average (W9 yellow): ↑>15% vs 30-day mean ---------------
  const walk = series("walkingHR");
  const walkBase = baseOf(walk);
  const walkNow = recentOf(walk);
  const walkPct = ((walkNow - walkBase) / walkBase) * 100;
  if (walkPct > 15) {
    fired.push({
      id: "W9",
      label: "Walking heart rate up",
      severity: "yellow",
      baseline: r0(walkBase),
      current: r0(walkNow),
      pctChange: r1(walkPct),
      sustainedDays: 0,
      detail: `Walking heart rate rose ${r1(walkPct)}% (${r0(walkBase)} to ${r0(walkNow)} bpm) at the same activity level.`,
      detailZh: `步行心率在相同活動量下上升了 ${r1(walkPct)}%（由 ${r0(walkBase)} 升至 ${r0(walkNow)} bpm）。`,
    });
  }

  // --- Combined alert logic ----------------------------------------------
  const reds = fired.filter((f) => f.severity === "red").length;
  const yellows = fired.filter((f) => f.severity === "yellow").length;
  let status: "green" | "yellow" | "red";
  if (reds >= 2) status = "red";
  else if (reds === 1 || yellows >= 2) status = "yellow";
  else status = "green"; // 0 rules, or a single lone yellow → note only

  // --- Caretaker alert (bilingual, templated) ----------------------------
  const detail = fired.map((f) => f.detail).join(" ");
  const caretaker =
    status === "green"
      ? {
          en: `${name}'s health data looks normal.`,
          zh: `${name}的健康數據正常。`,
        }
      : status === "yellow"
        ? {
            en: `Changes detected in ${name}'s health data. Consider scheduling a check-up. ${detail}`,
            zh: `${name}的健康數據有變化，建議預約覆診。`,
          }
        : {
            en: `Significant changes in ${name}'s health data. Please contact the doctor today. ${detail}`,
            zh: `${name}的健康數據出現明顯變化，請今日聯絡醫生。`,
          };

  return {
    fired,
    ok,
    status,
    rhr: { baseline: r0(rhrBase), current: r0(rhrNow), pct: r1(rhrPct) },
    hrv: { baseline: r0(hrvBase), current: r0(hrvNow), pct: r1(hrvPct) },
    steps: { baseline: r0(stepsBase), current: r0(stepsNow), pct: r1(stepsPct) },
    caretaker,
  };
}
