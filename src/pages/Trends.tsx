import { useState } from "react";
import { TrendChart } from "../components/charts";
import { SignalNote } from "../components/ui";
import { baseline, drift, round } from "../lib/analysis";
import { useStore } from "../lib/store";
import type { DayMetric } from "../lib/types";

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
    key: "steps",
    label: "Daily steps",
    unit: "",
    plain: "How much you moved each day.",
    upIsConcern: false,
  },
];

function reading(def: TrendDef, dir: string) {
  if (dir === "flat") return { text: "Steady — sitting in your normal range.", tone: "text-sage" };
  const concerning =
    (dir === "up" && def.upIsConcern) || (dir === "down" && !def.upIsConcern);
  return concerning
    ? { text: `Drifting ${dir} — worth keeping an eye on the trend.`, tone: "text-[#8a6f2e]" }
    : { text: `Moving ${dir}, in a good direction.`, tone: "text-sage" };
}

export function Trends() {
  const { metrics } = useStore();
  const [active, setActive] = useState<keyof DayMetric>("restingHR");
  const def = TRENDS.find((t) => t.key === active)!;
  const d = drift(metrics, active);
  const r = reading(def, d.dir);
  const series = metrics.map((m) => ({
    date: m.date,
    value: Number(m[active]),
  }));

  return (
    <div>
      <h1 className="text-3xl md:text-4xl">Your trends over time</h1>
      <p className="mt-2 max-w-readable text-muted">
        The single best thing to watch is the <em>direction of travel</em> over
        weeks and months — not the noisy daily numbers. Your personal “normal”
        is shown as a soft band so a one-off spike never looks frightening.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {TRENDS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
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
          <TrendChart data={series} baseline={d.base} unit={def.unit.trim()} />
        </div>
      </div>

      <SignalNote className="mt-8" />
    </div>
  );
}
