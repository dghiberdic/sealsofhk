import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { Link } from "react-router-dom";
import { DishCard } from "../components/DishCard";
import { Eyebrow, SignalNote } from "../components/ui";
import { Activity, Check, Flame, Heart, Icon } from "../components/icons";
import { useStore } from "../lib/store";
import type { FocusArea, Insight, Status } from "../lib/types";

const statusRank: Record<Status, number> = { look: 0, watch: 1, steady: 2 };

const focusMeta: {
  key: FocusArea;
  label: string;
  icon: ComponentType<LucideProps>;
}[] = [
  { key: "heart", label: "Heart & circulation", icon: Heart },
  { key: "metabolic", label: "Metabolic health & longevity", icon: Flame },
  { key: "secondary", label: "Also keeping an eye on", icon: Activity },
];

export function Signals() {
  const { insights, metrics } = useStore();

  const flagged = [...insights]
    .filter((i) => i.status !== "steady")
    .sort((a, b) => statusRank[a.status] - statusRank[b.status]);
  const steady = insights.filter((i) => i.status === "steady");

  const lookCount = flagged.filter((i) => i.status === "look").length;
  const watchCount = flagged.filter((i) => i.status === "watch").length;

  const summary = !flagged.length
    ? "Nothing is asking for your attention right now — every pattern we watch is sitting in your normal range."
    : [
        lookCount &&
          `${lookCount} ${lookCount === 1 ? "thing is" : "things are"} worth a closer look`,
        watchCount &&
          `${watchCount} ${watchCount === 1 ? "is" : "are"} worth keeping an eye on`,
      ]
        .filter(Boolean)
        .join(", ") + ". None of it is an emergency.";

  const byFocus = (f: FocusArea) => steady.filter((i) => i.focus === f);

  return (
    <div>
      <h1 className="text-3xl md:text-4xl">Signals</h1>
      <p className="mt-2 max-w-readable leading-relaxed text-muted">
        These are the patterns we've drawn from weeks of your data — what's
        steady, and what (if anything) is worth a closer look. Every signal is
        judged against <em>your</em> own normal and its direction over time,
        never a single odd day. They're signals to consider, not diagnoses.
      </p>

      {/* What, if anything, to be concerned about */}
      <p className="mt-4 max-w-readable text-lg leading-relaxed text-ink">
        {summary}
      </p>

      {/* Worth your attention — flagged signals, most pressing first */}
      {flagged.length > 0 ? (
        <section className="mt-8">
          <Eyebrow>Worth your attention</Eyebrow>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {flagged.map((i) => (
              <DishCard key={i.id} insight={i} metrics={metrics} />
            ))}
          </div>
          <p className="mt-4 max-w-readable text-sm leading-relaxed text-muted">
            None of these needs anything dramatic from you. Open any one to see
            what it means and a calm next step — usually just a question to raise
            at your next visit.
          </p>
        </section>
      ) : (
        <section className="card mt-8 flex items-center gap-4 p-6">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sage-tint text-sage">
            <Icon icon={Check} size={22} />
          </span>
          <p className="leading-relaxed text-muted">
            Nothing flagged today. The areas below are all sitting comfortably in
            your normal range.
          </p>
        </section>
      )}

      {/* Sitting steady — grouped by area, kept quiet */}
      {steady.length > 0 && (
        <section className="mt-12">
          <Eyebrow>Sitting steady</Eyebrow>
          <div className="mt-4 space-y-8">
            {focusMeta.map((f) => {
              const list = byFocus(f.key);
              if (!list.length) return null;
              return <FocusGroup key={f.key} meta={f} insights={list} metrics={metrics} />;
            })}
          </div>
        </section>
      )}

      <SignalNote className="mt-10" />
    </div>
  );
}

function FocusGroup({
  meta,
  insights,
  metrics,
}: {
  meta: { label: string; icon: ComponentType<LucideProps> };
  insights: Insight[];
  metrics: ReturnType<typeof useStore>["metrics"];
}) {
  return (
    <div>
      <h2 className="flex items-center gap-2.5 text-xl">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sand text-muted">
          <Icon icon={meta.icon} size={17} />
        </span>
        {meta.label}
      </h2>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        {insights.map((i) => (
          <DishCard key={i.id} insight={i} metrics={metrics} />
        ))}
      </div>
    </div>
  );
}
