import { Link } from "react-router-dom";
import { DishCard } from "../components/DishCard";
import { SignalNote, statusMeta } from "../components/ui";
import { baseline, recent, round, today } from "../lib/analysis";
import { useStore } from "../lib/store";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function Today() {
  const { profile, metrics, insights, overall, vo2 } = useStore();
  const t = today(metrics);

  const flagged = insights.filter((i) => i.status !== "steady");
  const steadyCount = insights.length - flagged.length;

  const headline =
    overall.level === "steady"
      ? "Everything looks steady today."
      : overall.level === "watch"
        ? "Mostly steady — a couple of small things to keep an eye on."
        : "Mostly steady — one thing is worth a closer look.";

  const sub =
    overall.level === "steady"
      ? "Your heart, sleep and activity are all sitting comfortably in your normal range. Nothing to do — enjoy your morning tea. ☕"
      : "Most of your signals are calm. Below are the few small plates worth a glance — none of them is an emergency.";

  const keySignals = [
    {
      label: "Resting heart rate",
      value: t.restingHR,
      unit: "bpm",
      base: round(baseline(metrics, "restingHR")),
    },
    {
      label: "HRV",
      value: t.hrv,
      unit: "ms",
      base: round(baseline(metrics, "hrv")),
    },
    {
      label: "Sleep Score",
      value: round(recent(metrics, "sleepScore")),
      unit: "/100",
      base: null,
    },
    {
      label: "Cardio fitness",
      value: vo2[vo2.length - 1].value,
      unit: "",
      base: null,
    },
  ];

  return (
    <div>
      <p className="text-muted">{greeting()},</p>
      <h1 className="text-3xl md:text-4xl">{profile.name}</h1>

      {/* The reassuring status — the cart arrives */}
      <div
        className="card mt-6 overflow-hidden p-0"
        style={{ borderColor: "transparent" }}
      >
        <div
          className="p-6 md:p-8"
          style={{
            background:
              overall.level === "steady"
                ? "linear-gradient(135deg,#eef2ea,#f7f3ec)"
                : "linear-gradient(135deg,#f5ece0,#f7f3ec)",
          }}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <span
              className={`h-2.5 w-2.5 rounded-full ${statusMeta[overall.level].dot}`}
            />
            <span className={statusMeta[overall.level].text}>
              {statusMeta[overall.level].label}
            </span>
          </div>
          <h2 className="mt-3 text-2xl leading-snug md:text-3xl">{headline}</h2>
          <p className="mt-3 max-w-readable leading-relaxed text-muted">{sub}</p>
        </div>
      </div>

      {/* Key signals at a glance */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {keySignals.map((s) => (
          <div key={s.label} className="card p-4">
            <div className="text-sm text-muted">{s.label}</div>
            <div className="mt-1 font-serif text-3xl">
              {s.value}
              <span className="ml-1 text-base text-faint">{s.unit}</span>
            </div>
            {s.base != null && (
              <div className="mt-1 text-xs text-faint">
                your normal ≈ {s.base}
                {s.unit}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* The day's dishes worth noticing */}
      <div className="mt-10 flex items-end justify-between">
        <h2 className="text-2xl">
          {flagged.length ? "Worth a glance today" : "Today's plates"}
        </h2>
        <Link to="/health" className="link text-sm">
          See everything →
        </Link>
      </div>
      <p className="mt-1 text-muted">
        {flagged.length
          ? "A few small dishes to notice. Tap any one to understand it fully."
          : "All calm. Here's your steady picture."}
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {(flagged.length ? flagged : insights.slice(0, 4)).map((i) => (
          <DishCard key={i.id} insight={i} metrics={metrics} />
        ))}
      </div>

      {flagged.length > 0 && (
        <p className="mt-4 text-sm text-muted">
          The other {steadyCount} areas we watch are sitting comfortably in your
          normal range.
        </p>
      )}

      <div className="mt-10 flex flex-col gap-3 rounded-2xl bg-clay-tint/60 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg text-ink">Seeing your doctor soon?</h3>
          <p className="text-sm text-muted">
            Turn these signals into clear questions and a one-page report.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/ask" className="btn-ghost">
            Questions to ask
          </Link>
          <Link to="/report" className="btn-primary">
            Make a report
          </Link>
        </div>
      </div>

      <SignalNote className="mt-8" />
    </div>
  );
}
