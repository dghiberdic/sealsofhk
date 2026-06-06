import { Link, useNavigate, useParams } from "react-router-dom";
import type { ReactNode } from "react";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { TrendChart } from "../components/charts";
import { SignalNote, StatusPill, TierBadge } from "../components/ui";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  HelpCircle,
  Icon,
  Lightbulb,
} from "../components/icons";
import { TIER_BLURB } from "../lib/types";
import { baseline } from "../lib/analysis";
import { useStore } from "../lib/store";
import type { DayMetric } from "../lib/types";

const statusColor: Record<string, string> = {
  steady: "#5b7553",
  watch: "#b0822f",
  look: "#b5503f",
};

function QABlock({
  q,
  icon,
  children,
}: {
  q: string;
  icon: ComponentType<LucideProps>;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-xl">
        <Icon icon={icon} size={18} className="text-clay-soft" />
        {q}
      </h3>
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
        <Link to="/signals" className="link">
          Back to your signals
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
      <button
        onClick={() => nav(-1)}
        className="-ml-2 mb-4 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-medium text-muted transition hover:text-ink"
      >
        <Icon icon={ArrowLeft} size={16} />
        Back
      </button>

      <div className="flex flex-wrap items-center gap-2">
        <StatusPill status={insight.status} />
        <TierBadge tier={insight.tier} />
        <span className="pill bg-ocean-tint text-ocean-deep">
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
        <div className="card mt-6 p-5 md:p-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="eyebrow">
              {insight.title}
              {insight.metricUnit ? ` · ${insight.metricUnit}` : ""}
            </span>
            <span className="text-xs text-faint">last 90 days</span>
          </div>
          <TrendChart
            data={series}
            baseline={base}
            unit={insight.metricUnit ?? ""}
            color={statusColor[insight.status]}
          />
          <p className="mt-3 text-sm text-faint">
            The shaded band is <em>your</em> normal. What matters is the
            direction of travel over weeks — not any single day. Hover for any
            day's value, or drag across the chart to zoom in.
          </p>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-6">
        <QABlock q="What is this?" icon={HelpCircle}>
          {insight.what}
        </QABlock>
        <QABlock q="What might it mean?" icon={Lightbulb}>
          {insight.meaning}
        </QABlock>
        <QABlock q="How sure are we?" icon={BarChart3}>
          {insight.sure}{" "}
          <span className="text-faint">— {TIER_BLURB[insight.tier]}</span>
        </QABlock>

        {/* What to do — calm, reassuring sage panel. */}
        <div className="rounded-card border border-sage-border bg-sage-tint p-5 md:p-6">
          <h3 className="flex items-center gap-2 text-xl text-sage-deep">
            <Icon icon={CheckCircle2} size={18} />
            What should I do?
          </h3>
          <p className="mt-1.5 leading-relaxed text-sage-deep">
            {insight.doThis}
          </p>
        </div>
      </div>

      {linkedQuestion && (
        <div className="mt-6 rounded-card bg-clay-tint/60 p-5">
          <h3 className="text-xl">A good thing to raise with your doctor</h3>
          <p className="mt-1 text-muted">“{linkedQuestion.text}”</p>
          <Link to="/ask" className="btn-ghost btn-sm mt-3">
            See all your questions
          </Link>
        </div>
      )}

      <SignalNote className="mt-8" />
    </div>
  );
}
