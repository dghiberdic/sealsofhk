import { Link } from "react-router-dom";
import type { DayMetric, Insight } from "../lib/types";
import { Sparkline } from "./charts";
import { StatusDot, TierBadge } from "./ui";

const sparkColor: Record<string, string> = {
  steady: "#6f8f6a",
  watch: "#bd9a4e",
  look: "#b04a32",
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
      className="card block p-5 transition hover:shadow-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <StatusDot status={insight.status} />
          <h3 className="text-lg leading-tight">{insight.title}</h3>
        </div>
        {series && (
          <Sparkline data={series} color={sparkColor[insight.status]} />
        )}
      </div>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        {insight.oneLine}
      </p>
      <div className="mt-3">
        <TierBadge tier={insight.tier} />
      </div>
    </Link>
  );
}
