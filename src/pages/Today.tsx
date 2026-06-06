import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { Link } from "react-router-dom";
import { Eyebrow, SignalNote, StatusPill } from "../components/ui";
import {
  Activity,
  ChevronRight,
  Check,
  Droplet,
  Footprints,
  Heart,
  Icon,
  Moon,
  TrendingUp,
  Wind,
} from "../components/icons";
import { baseline, round, today } from "../lib/analysis";
import { useStore } from "../lib/store";
import type { DayMetric } from "../lib/types";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const dateLabel = () => {
  const d = new Date();
  const weekday = d.toLocaleDateString("en-GB", { weekday: "long" });
  const day = d.toLocaleDateString("en-GB", { day: "numeric" });
  const month = d.toLocaleDateString("en-GB", { month: "long" });
  return `${weekday} · ${day} ${month}`;
};

// The reassuring overall status, expressed with a calm icon chip.
const overallChip = {
  steady: { icon: Check, cls: "bg-sage-tint text-sage" },
  watch: { icon: TrendingUp, cls: "bg-gold-tint text-gold" },
  look: { icon: Heart, cls: "bg-brick-tint text-brick" },
} as const;

// Today's readings — only what's true *today* (last night + so far this morning),
// each with a plain-language line on what it actually means. No long-term trends
// or baselines here; those live under Signals and More info.
interface Reading {
  key: keyof DayMetric;
  label: string;
  icon: ComponentType<LucideProps>;
  unit: string;
  plain: string;
  higherIsBetter: boolean;
  fmt?: (v: number) => string;
}

const readings: Reading[] = [
  {
    key: "sleepScore",
    label: "Last night's sleep",
    icon: Moon,
    unit: " / 100",
    plain: "A blend of how long, how soundly and how steadily you slept.",
    higherIsBetter: true,
  },
  {
    key: "restingHR",
    label: "Resting heart rate",
    icon: Heart,
    unit: " bpm",
    plain: "Your heart's pace while you're completely at rest — a calm heart sits low here.",
    higherIsBetter: false,
  },
  {
    key: "hrv",
    label: "Heart-rate variability",
    icon: Activity,
    unit: " ms",
    plain: "The tiny timing gaps between beats. More variation usually means you're well rested.",
    higherIsBetter: true,
  },
  {
    key: "respiratoryRate",
    label: "Breathing rate",
    icon: Wind,
    unit: " /min",
    plain: "Your breaths per minute while you slept — reassuringly steady night to night.",
    higherIsBetter: false,
  },
  {
    key: "spo2",
    label: "Blood oxygen",
    icon: Droplet,
    unit: "%",
    plain: "How well your blood carried oxygen overnight. Anywhere in the high 90s is comfortable.",
    higherIsBetter: true,
  },
  {
    key: "steps",
    label: "Movement today",
    icon: Footprints,
    unit: "",
    plain: "How much you've been on your feet so far today.",
    higherIsBetter: true,
    fmt: (v) => v.toLocaleString("en-GB"),
  },
];

// A gentle, words-only sense of how today sits against your own usual — never a
// scary number, never a trend. Reassurance first.
function vsUsual(now: number, base: number, higherIsBetter: boolean) {
  const pct = base === 0 ? 0 : (now - base) / base;
  if (Math.abs(pct) <= 0.06)
    return { text: "Right around your usual", tone: "text-sage-deep" };
  const higher = pct > 0;
  const good = higher === higherIsBetter;
  const dir = higher ? "higher" : "lower";
  return good
    ? { text: `A little ${dir} than usual — nicely so`, tone: "text-sage-deep" }
    : { text: `A touch ${dir} than usual`, tone: "text-gold-deep" };
}

// Caretaker alert colours — the green / yellow / red the family member sees.
const ragMeta = {
  green: { cls: "border-sage-border bg-sage-tint", dot: "bg-sage", word: "All clear" },
  yellow: { cls: "border-gold-border bg-gold-tint", dot: "bg-gold", word: "Worth a check-up" },
  red: { cls: "border-brick-border bg-brick-tint", dot: "bg-brick", word: "Please call the doctor" },
} as const;

export function Today() {
  const { profile, metrics, overall, watch, carerName } = useStore();
  const t = today(metrics);

  const headline =
    overall.level === "steady"
      ? "Everything looks steady today."
      : overall.level === "watch"
        ? "Mostly steady — a couple of small things to keep an eye on."
        : "Mostly steady — one thing is worth a closer look.";

  const sub =
    overall.level === "steady"
      ? "I looked across your heart, sleep and activity this morning. Everything is sitting comfortably in your normal range — nothing to do today, enjoy your morning tea."
      : "Most of your signals are calm. A few longer-term patterns are worth a glance — none of them is an emergency, and there's no rush. You'll find them under Signals.";

  const chip = overallChip[overall.level];

  return (
    <div>
      <Eyebrow>{dateLabel()}</Eyebrow>
      <h1 className="mt-2 text-3xl md:text-4xl">
        {greeting()}, {profile.name}
      </h1>

      {/* The reassuring status — how today is looking, overall */}
      <div className="card mt-6 flex flex-wrap items-center gap-5 p-6 md:p-8">
        <span
          className={`grid h-16 w-16 shrink-0 place-items-center rounded-full ${chip.cls}`}
        >
          <Icon icon={chip.icon} size={30} />
        </span>
        <div className="min-w-[240px] flex-1">
          <h2 className="text-2xl leading-snug md:text-3xl">{headline}</h2>
          <p className="mt-2 max-w-readable leading-relaxed text-muted">{sub}</p>
        </div>
        <StatusPill status={overall.level} />
      </div>

      {overall.level !== "steady" && (
        <Link
          to="/signals"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-clay-deep hover:underline"
        >
          See the {overall.count === 1 ? "pattern" : "patterns"} worth a closer
          look <Icon icon={ChevronRight} size={15} />
        </Link>
      )}

      {/* Caretaker alert — the simple green/yellow/red a family member sees */}
      {profile.setUpByCarer && (
        <div className={`mt-6 rounded-card border p-5 ${ragMeta[watch.status].cls}`}>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${ragMeta[watch.status].dot}`} />
            <span className="eyebrow">
              For {carerName ?? "your family"} · {ragMeta[watch.status].word}
            </span>
          </div>
          <p className="mt-2 leading-relaxed text-ink">{watch.caretaker.zh}</p>
          <p className="mt-1 leading-relaxed text-muted">{watch.caretaker.en}</p>
        </div>
      )}

      {/* Today's readings — only what's true today, in plain language */}
      <div className="mt-10">
        <Eyebrow>Today at a glance</Eyebrow>
        <p className="mt-2 max-w-readable leading-relaxed text-muted">
          Here's what your watch noticed overnight and so far today, with a plain
          word on what each one means. These are just <em>today's</em> readings —
          the bigger patterns over weeks live under{" "}
          <Link to="/signals" className="link">
            Signals
          </Link>
          .
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {readings.map((r) => {
          const raw = Number(t[r.key]);
          const u = vsUsual(raw, baseline(metrics, r.key), r.higherIsBetter);
          const shown = r.fmt ? r.fmt(round(raw)) : round(raw);
          return (
            <div key={r.key} className="card p-5">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ocean-tint text-ocean-deep">
                  <Icon icon={r.icon} size={17} />
                </span>
                <div className="text-sm font-medium text-ink">{r.label}</div>
              </div>
              <div className="mt-3 font-serif text-3xl text-ink">
                {shown}
                <span className="ml-0.5 text-base text-faint">{r.unit}</span>
              </div>
              <p className={`mt-1 text-xs font-medium ${u.tone}`}>{u.text}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{r.plain}</p>
            </div>
          );
        })}
      </div>

      <SignalNote className="mt-10" />
    </div>
  );
}
