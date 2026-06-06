import { Link, useNavigate, useParams } from "react-router-dom";
import { TrendChart } from "../components/charts";
import { SignalNote, StatusPill, TierBadge } from "../components/ui";
import { TIER_BLURB } from "../lib/types";
import { baseline } from "../lib/analysis";
import { useStore } from "../lib/store";
import type { DayMetric } from "../lib/types";

const statusColor: Record<string, string> = {
  steady: "#6f8f6a",
  watch: "#bd9a4e",
  look: "#b04a32",
};

function QABlock({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-hair py-5 first:border-t-0 first:pt-0">
      <h3 className="text-lg">{q}</h3>
      <p className="mt-1.5 leading-relaxed text-muted">{children}</p>
    </div>
  );
}

export function InsightDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { insights, metrics, questions } = useStore();
  const insight = insights.find((i) => i.id === id);

  if (!insight) {
    return (
      <div>
        <p className="text-muted">We couldn't find that insight.</p>
        <Link to="/health" className="link">
          Back to your health
        </Link>
      </div>
    );
  }

  const series =
    insight.metric != null
      ? metrics.map((m) => ({
          date: m.date,
          value: Number(m[insight.metric as keyof DayMetric]),
        }))
      : null;
  const base = insight.metric ? baseline(metrics, insight.metric) : undefined;

  const linkedQuestion = questions.find((q) => q.insightId === insight.id);

  return (
    <div className="max-w-readable">
      <button onClick={() => nav(-1)} className="btn-quiet -ml-2 mb-4 text-sm">
        ← Back
      </button>

      <div className="flex flex-wrap items-center gap-2">
        <StatusPill status={insight.status} />
        <TierBadge tier={insight.tier} />
        <span className="pill bg-sand text-muted">
          {insight.source === "blood"
            ? "From your blood work"
            : insight.source === "combined"
              ? "Watch + blood"
              : "From your watch"}
        </span>
      </div>

      <h1 className="mt-4 text-3xl">{insight.title}</h1>
      <p className="mt-2 text-lg leading-relaxed text-muted">
        {insight.oneLine}
      </p>

      {series && (
        <div className="card mt-6 p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-base text-muted">
              Your trend{insight.metricUnit ? ` (${insight.metricUnit})` : ""}
            </h3>
            <span className="text-xs text-faint">last 90 days</span>
          </div>
          <TrendChart
            data={series}
            baseline={base}
            unit={insight.metricUnit ?? ""}
            color={statusColor[insight.status]}
          />
          <p className="mt-2 text-sm text-faint">
            The green band is <em>your</em> normal. What matters is the direction
            of travel over weeks — not any single day. Hover for any day's value,
            or drag across the chart to zoom in.
          </p>
        </div>
      )}

      <div className="card mt-6 p-6">
        <QABlock q="What is this?">{insight.what}</QABlock>
        <QABlock q="What might it mean?">{insight.meaning}</QABlock>
        <QABlock q="How sure are we?">
          {insight.sure}{" "}
          <span className="text-faint">— {TIER_BLURB[insight.tier]}</span>
        </QABlock>
        <QABlock q="What should I do?">{insight.doThis}</QABlock>
      </div>

      {linkedQuestion && (
        <div className="mt-6 rounded-2xl bg-clay-tint/60 p-5">
          <h3 className="text-lg">A good thing to raise with your doctor</h3>
          <p className="mt-1 text-muted">“{linkedQuestion.text}”</p>
          <Link to="/ask" className="btn-ghost mt-3">
            See all your questions →
          </Link>
        </div>
      )}

      <SignalNote className="mt-8" />
    </div>
  );
}
