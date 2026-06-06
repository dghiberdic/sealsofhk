import { useState } from "react";
import { TrendChart } from "../components/charts";
import { Eyebrow, SignalNote, TierBadge } from "../components/ui";
import { baseline, drift, round } from "../lib/analysis";
import { useStore } from "../lib/store";
import type { DayMetric, Tier } from "../lib/types";

// --- Detailed per-segment trends -------------------------------------------
interface TrendDef {
  key: keyof DayMetric;
  label: string;
  unit: string;
  plain: string;
  // for this metric, is "up" the concerning direction?
  upIsConcern: boolean;
}

const TRENDS: TrendDef[] = [
  {
    key: "restingHR",
    label: "Resting heart rate",
    unit: " bpm",
    plain: "Your heart at complete rest.",
    upIsConcern: true,
  },
  {
    key: "hrv",
    label: "Heart-rate variability (HRV)",
    unit: " ms",
    plain: "Beat-to-beat variation — higher usually means better recovered.",
    upIsConcern: false,
  },
  {
    key: "sleepScore",
    label: "Sleep Score",
    unit: "",
    plain: "Nightly sleep quality out of 100.",
    upIsConcern: false,
  },
  {
    key: "respiratoryRate",
    label: "Respiratory rate",
    unit: " /min",
    plain: "Breaths per minute, mostly measured while you sleep.",
    upIsConcern: true,
  },
  {
    key: "spo2",
    label: "Blood oxygen",
    unit: "%",
    plain: "Overnight oxygen saturation — anywhere in the high 90s is comfortable.",
    upIsConcern: false,
  },
  {
    key: "steps",
    label: "Daily steps",
    unit: "",
    plain: "How much you moved each day.",
    upIsConcern: false,
  },
];

function reading(def: TrendDef, dir: string) {
  if (dir === "flat")
    return {
      text: "Steady — sitting in your normal range.",
      tone: "text-sage-deep",
    };
  const concerning =
    (dir === "up" && def.upIsConcern) || (dir === "down" && !def.upIsConcern);
  return concerning
    ? {
        text: `Drifting ${dir} — worth keeping an eye on the trend.`,
        tone: "text-gold-deep",
      }
    : { text: `Moving ${dir}, in a good direction.`, tone: "text-sage-deep" };
}

// --- Folded-in reference (the "why this matters" explainers) ----------------
const canaries: { signal: string; plain: string }[] = [
  {
    signal: "Resting heart rate ↑",
    plain: "Infection, fever, overtraining, dehydration, stress, alcohol; a sustained rise can point toward cardiovascular risk.",
  },
  {
    signal: "HRV ↓",
    plain: "Stress, poor recovery, an infection starting, overtraining, or alcohol.",
  },
  {
    signal: "Respiratory rate ↑",
    plain: "A respiratory infection, fever, or alcohol.",
  },
  {
    signal: "Wrist temperature ↑",
    plain: "Infection or fever, menstrual-cycle phase, alcohol, or just a hot room.",
  },
  {
    signal: "Blood oxygen ↓",
    plain: "Altitude, a respiratory infection, sleep apnea, or lung issues.",
  },
  {
    signal: "Two+ Vitals outliers in one night",
    plain: "The general “something is off” signal — most often illness, overtraining, travel or alcohol.",
  },
];

const cantDo = [
  "No blood chemistry. The watch can't measure glucose, cholesterol or hormones — that's why HeartSum lets you add your blood work.",
  "No blood-pressure number. The hypertension notification flags a pattern; you still need a cuff for an actual reading.",
  "It reads patterns, not single events. Most flags need days-to-weeks of data — one odd night means little.",
  "False alarms happen. A loose fit, tattoos, cold skin or motion can all cause errors, and it can miss real things too.",
  "Signals overlap. Illness, stress, overtraining and a hangover look nearly identical — context is yours to add.",
];

// --- The watch alert rules (W1–W9) -----------------------------------------
// These mirror the exact deterministic thresholds in src/lib/rules.ts — the
// same rule IDs that appear on the doctor report. Each compares a recent window
// against the person's own rolling baseline; nothing here is a diagnosis.
type Sev = "yellow" | "red";
const watchRules: { id: string; metric: string; trigger: string; sev: Sev }[] = [
  { id: "W1", metric: "Resting heart rate", trigger: "More than 10% above your 30-day normal, holding for 5+ days", sev: "yellow" },
  { id: "W2", metric: "Resting heart rate", trigger: "More than 20% above your 30-day normal, holding for 3+ days", sev: "red" },
  { id: "W3", metric: "Heart-rate variability (HRV)", trigger: "More than 20% below your 30-day normal, for 5+ days", sev: "yellow" },
  { id: "W4", metric: "Heart-rate variability (HRV)", trigger: "More than 35% below your 30-day normal, for 3+ days", sev: "red" },
  { id: "W5", metric: "Blood oxygen (SpO₂)", trigger: "Below 93% on two or more readings", sev: "red" },
  { id: "W6", metric: "ECG", trigger: "Any reading classified as atrial fibrillation", sev: "red" },
  { id: "W7", metric: "Heart rhythm", trigger: "Any irregular-rhythm notification fired", sev: "yellow" },
  { id: "W8", metric: "Daily steps", trigger: "More than 40% below your 14-day average, for 5+ days", sev: "yellow" },
  { id: "W9", metric: "Walking heart rate", trigger: "More than 15% above your 30-day average", sev: "yellow" },
];
const sevStyle: Record<Sev, { cls: string; word: string }> = {
  yellow: { cls: "bg-gold-tint text-gold-deep", word: "Yellow" },
  red: { cls: "bg-brick-tint text-brick", word: "Red" },
};

function TierRow({ tier, text }: { tier: Tier; text: string }) {
  return (
    <div className="flex flex-col gap-2 border-t border-hair py-4 first:border-t-0 sm:flex-row sm:items-center">
      <div className="sm:w-56 sm:shrink-0">
        <TierBadge tier={tier} title={false} />
      </div>
      <p className="text-muted">{text}</p>
    </div>
  );
}

export function MoreInfo() {
  const { metrics } = useStore();
  const [active, setActive] = useState<keyof DayMetric>("restingHR");
  const def = TRENDS.find((t) => t.key === active)!;
  const d = drift(metrics, active);
  const r = reading(def, d.dir);
  const series = metrics.map((m) => ({
    date: m.date,
    value: Number(m[active]),
  }));
  const showBand = active !== "steps"; // steps swing too much for a tidy band

  return (
    <div>
      <h1 className="text-3xl md:text-4xl">More info</h1>
      <p className="mt-2 max-w-readable leading-relaxed text-muted">
        The full detail, for when you want it — every metric over time, and a
        plain account of how sure we are and what your watch can and can't do.
        The single best thing to watch is the <em>direction of travel</em> over
        weeks and months, not the noisy daily numbers.
      </p>

      {/* Each segment, individually ------------------------------------- */}
      <section className="mt-8">
        <Eyebrow>Each metric over time</Eyebrow>
        <p className="mt-2 max-w-readable text-sm text-faint">
          Pick a metric to see its full history. Your personal “normal” is the
          soft band, so a one-off spike never looks frightening. Hover for any
          day's value, or drag across the chart to zoom in.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {TRENDS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              aria-pressed={active === t.key}
              className={`pill border ${
                active === t.key
                  ? "border-clay bg-clay-tint text-clay-deep"
                  : "border-hair bg-paper text-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="card mt-5 p-6">
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-xl">{def.label}</h2>
              <p className="text-sm text-muted">{def.plain}</p>
            </div>
            <div className="text-right">
              <div className="font-serif text-2xl">
                {round(d.now)}
                {def.unit}
              </div>
              <div className="text-xs text-faint">
                normal ≈ {round(d.base)}
                {def.unit}
              </div>
            </div>
          </div>

          <p className={`mt-3 text-[15px] font-medium ${r.tone}`}>{r.text}</p>

          <div className="mt-4">
            <TrendChart
              data={series}
              baseline={showBand ? d.base : undefined}
              unit={def.unit.trim()}
            />
          </div>
        </div>
      </section>

      {/* How sure are we — the explain-once tier reference -------------- */}
      <section className="card mt-10 p-6">
        <h2 className="text-2xl">How sure are we? The three tiers</h2>
        <p className="mt-1 text-muted">
          Every signal carries one of these quietly (the little dots on each
          card). Here's what they actually mean, so you know how seriously to
          take each one.
        </p>
        <div className="mt-4">
          <TierRow
            tier={1}
            text="The watch is regulator-cleared to flag this and will actively notify you — the closest it comes to “something may be off.”"
          />
          <TierRow
            tier={2}
            text="Not a built-in alert, but well-documented in peer-reviewed studies and readable from your data."
          />
          <TierRow
            tier={3}
            text="Plausible and researched, but noisy and not validated for individuals. We show these gently, as hints only."
          />
        </div>
      </section>

      {/* The canary signals -------------------------------------------- */}
      <section className="card mt-5 p-6">
        <h2 className="text-2xl">The “canary” signals</h2>
        <p className="mt-1 text-muted">
          A handful of signals do most of the early-warning work. When one drifts
          from your baseline, here's what it might point at.
        </p>
        <div className="mt-4 divide-y divide-hair">
          {canaries.map((c) => (
            <div key={c.signal} className="py-3">
              <div className="font-medium text-ink">{c.signal}</div>
              <div className="text-sm text-muted">{c.plain}</div>
            </div>
          ))}
        </div>
      </section>

      {/* The watch alert rules ----------------------------------------- */}
      <section className="card mt-5 p-6">
        <h2 className="text-2xl">The watch alert rules</h2>
        <p className="mt-1 max-w-readable text-muted">
          When your dashboard turns yellow or red — and on the codes (W1–W9) you
          see in the doctor report — it's one of these nine plain rules firing.
          Each one watches a single signal and compares the last week or two
          against <em>your own</em> 30-day normal, so a busy day never trips it.
          A red rule turns the whole status red; a yellow one turns it yellow;
          if none fire, you're green.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-faint">
                <th className="pb-2 pr-3 font-medium">Rule</th>
                <th className="pb-2 pr-3 font-medium">What it watches</th>
                <th className="pb-2 pr-3 font-medium">Fires when</th>
                <th className="pb-2 font-medium">Level</th>
              </tr>
            </thead>
            <tbody>
              {watchRules.map((rule) => (
                <tr key={rule.id} className="border-t border-hair align-top">
                  <td className="py-2 pr-3 font-mono font-medium text-ink">
                    {rule.id}
                  </td>
                  <td className="py-2 pr-3 text-ink">{rule.metric}</td>
                  <td className="py-2 pr-3 text-muted">{rule.trigger}</td>
                  <td className="py-2">
                    <span className={`pill ${sevStyle[rule.sev].cls}`}>
                      {sevStyle[rule.sev].word}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-faint">
          These are wellness trend rules, not diagnoses. They tell you when a
          number has drifted enough, for long enough, to be worth a doctor's
          eye — never what's causing it.
        </p>
      </section>

      {/* What this can't do -------------------------------------------- */}
      <section className="card mt-5 p-6">
        <h2 className="text-2xl">What this can't do</h2>
        <p className="mt-1 text-muted">
          So you never over-read it. Honesty is part of the point.
        </p>
        <ul className="mt-4 space-y-3">
          {cantDo.map((c, i) => (
            <li key={i} className="flex gap-3 text-muted">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-hair-strong" />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </section>

      <SignalNote className="mt-8" />
    </div>
  );
}
