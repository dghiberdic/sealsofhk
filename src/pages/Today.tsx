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
import { useT, type StrKey } from "../lib/i18n";
import type { DayMetric, Lang } from "../lib/types";

function greeting(lang: Lang) {
  const h = new Date().getHours();
  if (lang === "zh") return h < 12 ? "早晨" : h < 18 ? "午安" : "晚安";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const dateLabel = (lang: Lang) => {
  const d = new Date();
  const locale = lang === "zh" ? "zh-HK" : "en-GB";
  const weekday = d.toLocaleDateString(locale, { weekday: "long" });
  const day = d.toLocaleDateString(locale, { day: "numeric" });
  const month = d.toLocaleDateString(locale, { month: "long" });
  return lang === "zh" ? `${month}${day}日 · ${weekday}` : `${weekday} · ${day} ${month}`;
};

// The reassuring overall status, expressed with a calm icon chip.
const overallChip = {
  steady: { icon: Check, cls: "bg-sage-tint text-sage" },
  watch: { icon: TrendingUp, cls: "bg-gold-tint text-gold" },
  look: { icon: Heart, cls: "bg-brick-tint text-brick" },
} as const;

interface Reading {
  key: keyof DayMetric;
  labelKey: StrKey;
  plainKey: StrKey;
  icon: ComponentType<LucideProps>;
  unit: string;
  higherIsBetter: boolean;
  fmt?: (v: number) => string;
}

const readings: Reading[] = [
  { key: "sleepScore", labelKey: "r.sleep", plainKey: "r.sleep.plain", icon: Moon, unit: " / 100", higherIsBetter: true },
  { key: "restingHR", labelKey: "r.rhr", plainKey: "r.rhr.plain", icon: Heart, unit: " bpm", higherIsBetter: false },
  { key: "hrv", labelKey: "r.hrv", plainKey: "r.hrv.plain", icon: Activity, unit: " ms", higherIsBetter: true },
  { key: "respiratoryRate", labelKey: "r.rr", plainKey: "r.rr.plain", icon: Wind, unit: " /min", higherIsBetter: false },
  { key: "spo2", labelKey: "r.spo2", plainKey: "r.spo2.plain", icon: Droplet, unit: "%", higherIsBetter: true },
  { key: "steps", labelKey: "r.steps", plainKey: "r.steps.plain", icon: Footprints, unit: "", higherIsBetter: true, fmt: (v) => v.toLocaleString("en-GB") },
];

// A gentle, words-only sense of how today sits against your own usual.
function vsUsual(
  now: number,
  base: number,
  higherIsBetter: boolean,
): { key: StrKey; tone: string } {
  const pct = base === 0 ? 0 : (now - base) / base;
  if (Math.abs(pct) <= 0.06)
    return { key: "today.aroundUsual", tone: "text-sage-deep" };
  const higher = pct > 0;
  const good = higher === higherIsBetter;
  if (good)
    return {
      key: higher ? "today.higherGood" : "today.lowerGood",
      tone: "text-sage-deep",
    };
  return {
    key: higher ? "today.higherWatch" : "today.lowerWatch",
    tone: "text-gold-deep",
  };
}

const ragMeta = {
  green: { cls: "border-sage-border bg-sage-tint", dot: "bg-sage", word: "All clear", wordZh: "一切正常" },
  yellow: { cls: "border-gold-border bg-gold-tint", dot: "bg-gold", word: "Worth a check-up", wordZh: "建議覆診" },
  red: { cls: "border-brick-border bg-brick-tint", dot: "bg-brick", word: "Please call the doctor", wordZh: "請致電醫生" },
} as const;

export function Today() {
  const { profile, metrics, overall, watch, carerName } = useStore();
  const { t, lang } = useT();
  const td = today(metrics);

  const headline = t(
    overall.level === "steady"
      ? "today.steady"
      : overall.level === "watch"
        ? "today.watch"
        : "today.look",
  );
  const sub = t(overall.level === "steady" ? "today.subSteady" : "today.subFlag");
  const chip = overallChip[overall.level];

  return (
    <div>
      <Eyebrow>{dateLabel(lang)}</Eyebrow>
      <h1 className="mt-2 text-3xl md:text-4xl">
        {greeting(lang)}
        {lang === "zh" ? "，" : ", "}
        {profile.name}
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
          {t("today.seePatterns")} <Icon icon={ChevronRight} size={15} />
        </Link>
      )}

      {/* Caretaker alert — the simple green/yellow/red a family member sees */}
      {profile.setUpByCarer && (
        <div className={`mt-6 rounded-card border p-5 ${ragMeta[watch.status].cls}`}>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${ragMeta[watch.status].dot}`} />
            <span className="eyebrow">
              {lang === "zh"
                ? `給${carerName ?? "你的家人"} · ${ragMeta[watch.status].wordZh}`
                : `For ${carerName ?? "your family"} · ${ragMeta[watch.status].word}`}
            </span>
          </div>
          <p className="mt-2 leading-relaxed text-ink">{watch.caretaker.zh}</p>
          <p className="mt-1 leading-relaxed text-muted">{watch.caretaker.en}</p>
        </div>
      )}

      {/* Today's readings — only what's true today, in plain language */}
      <div className="mt-10">
        <Eyebrow>{t("today.glance")}</Eyebrow>
        <p className="mt-2 max-w-readable leading-relaxed text-muted">
          {t("today.glanceIntro")}
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {readings.map((r) => {
          const raw = Number(td[r.key]);
          const u = vsUsual(raw, baseline(metrics, r.key), r.higherIsBetter);
          const shown = r.fmt ? r.fmt(round(raw)) : round(raw);
          return (
            <div key={r.key} className="card p-5">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ocean-tint text-ocean-deep">
                  <Icon icon={r.icon} size={17} />
                </span>
                <div className="text-sm font-medium text-ink">{t(r.labelKey)}</div>
              </div>
              <div className="mt-3 font-serif text-3xl text-ink">
                {shown}
                <span className="ml-0.5 text-base text-faint">{r.unit}</span>
              </div>
              <p className={`mt-1 text-xs font-medium ${u.tone}`}>{t(u.key)}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {t(r.plainKey)}
              </p>
            </div>
          );
        })}
      </div>

      <SignalNote className="mt-10" />
    </div>
  );
}
