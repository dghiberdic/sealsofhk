import { Link } from "react-router-dom";
import type { DayMetric, Insight, Status } from "../lib/types";
import { Sparkline } from "./charts";
import { StatusPill, TierPips } from "./ui";
import { Activity, Flame, Heart, Icon } from "./icons";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

const focusIcon: Record<Insight["focus"], ComponentType<LucideProps>> = {
  heart: Heart,
  metabolic: Flame,
  secondary: Activity,
};

// Feature icons sit in a soft round chip, tinted to the signal's status.
const iconChip: Record<Status, string> = {
  steady: "bg-sage-tint text-sage-deep",
  watch: "bg-gold-tint text-gold-deep",
  look: "bg-brick-tint text-brick-deep",
};

const sparkColor: Record<Status, string> = {
  steady: "#5b7553",
  watch: "#b0822f",
  look: "#b5503f",
};

// An insight shown as a small, digestible "dish".
export function DishCard({
  insight,
  metrics,
}: {
  insight: Insight;
  metrics: DayMetric[];
}) {
  const series =
    insight.metric != null
      ? metrics.slice(-30).map((m) => Number(m[insight.metric as keyof DayMetric]))
      : null;

  return (
    <Link
      to={`/insight/${insight.id}`}
      className="card block p-5 transition hover:shadow-lift"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${iconChip[insight.status]}`}
          >
            <Icon icon={focusIcon[insight.focus]} size={20} />
          </span>
          <h3 className="font-serif text-xl leading-tight">{insight.title}</h3>
        </div>
        <StatusPill status={insight.status} />
      </div>
      <p className="mt-3 leading-relaxed text-muted">{insight.oneLine}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <TierPips tier={insight.tier} />
        {series && (
          <Sparkline data={series} color={sparkColor[insight.status]} />
        )}
      </div>
    </Link>
  );
}
