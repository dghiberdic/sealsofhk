import { DishCard } from "../components/DishCard";
import { SignalNote, statusMeta } from "../components/ui";
import { baseline, recent, round } from "../lib/analysis";
import { useStore } from "../lib/store";
import type { FocusArea, Insight, Status } from "../lib/types";

function worst(insights: Insight[]): Status {
  if (insights.some((i) => i.status === "look")) return "look";
  if (insights.some((i) => i.status === "watch")) return "watch";
  return "steady";
}

function FocusSection({
  title,
  blurb,
  insights,
  metrics,
}: {
  title: string;
  blurb: string;
  insights: Insight[];
  metrics: ReturnType<typeof useStore>["metrics"];
}) {
  if (!insights.length) return null;
  const status = worst(insights);
  const m = statusMeta[status];
  return (
    <section className="mb-10">
      <div className="card mb-4 p-6">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className={`h-2.5 w-2.5 rounded-full ${m.dot}`} />
          <span className={m.text}>{m.label}</span>
        </div>
        <h2 className="mt-2 text-2xl">{title}</h2>
        <p className="mt-1 max-w-readable leading-relaxed text-muted">{blurb}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {insights.map((i) => (
          <DishCard key={i.id} insight={i} metrics={metrics} />
        ))}
      </div>
    </section>
  );
}

export function Health() {
  const { insights, metrics, vo2 } = useStore();
  const byFocus = (f: FocusArea) => insights.filter((i) => i.focus === f);

  const rhrNow = round(recent(metrics, "restingHR"));
  const rhrBase = round(baseline(metrics, "restingHR"));

  return (
    <div>
      <h1 className="text-3xl md:text-4xl">Your health, area by area</h1>
      <p className="mt-2 max-w-readable text-muted">
        We lead with your heart and your long-term (metabolic) health, because
        that's where the evidence is strongest. Everything else we watch sits
        lower down. Each insight is judged against <em>your</em> normal and your
        trend over time — never a single odd day.
      </p>

      <div className="mt-8">
        <FocusSection
          title="❤ Heart & circulation"
          blurb={`The headline focus. We blend your watch's cleared flags, your week-by-week trends, and your blood work into one calm read. Right now your resting heart rate is averaging ${rhrNow} bpm against a personal normal of about ${rhrBase}, and your cardio fitness is ${vo2[vo2.length - 1].value} mL/kg·min.`}
          insights={byFocus("heart")}
          metrics={metrics}
        />

        <FocusSection
          title="◷ Metabolic health & longevity"
          blurb="The long game. This is about prevention and healthspan — fitness, sleep, activity and, crucially, your blood sugar and lipids. Your watch can only hint here; your blood work tells the real story."
          insights={byFocus("metabolic")}
          metrics={metrics}
        />

        <FocusSection
          title="Also keeping an eye on"
          blurb="Secondary areas — sleep, breathing, and whether your body might be fighting something. Each carries its own evidence tier so you know how seriously to take it."
          insights={byFocus("secondary")}
          metrics={metrics}
        />
      </div>

      <SignalNote className="mt-2" />
    </div>
  );
}
