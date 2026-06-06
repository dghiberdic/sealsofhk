import { useState } from "react";
import { TrendChart } from "../components/charts";
import { TierBadge } from "../components/ui";
import { baseline, recent, round } from "../lib/analysis";
import { useStore } from "../lib/store";
import type { DayMetric, Insight } from "../lib/types";

const STATUS_RANK = { look: 0, watch: 1, steady: 2 };

function dateRange(metrics: DayMetric[]) {
  const fmt = (s: string) =>
    new Date(s).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  return `${fmt(metrics[0].date)} – ${fmt(metrics[metrics.length - 1].date)}`;
}

export function Report({ shared = false }: { shared?: boolean }) {
  const {
    profile,
    metrics,
    insights,
    biomarkers,
    questions,
    checkedQ,
    vo2,
  } = useStore();
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const flagged = [...insights]
    .filter((i) => i.status !== "steady")
    .sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status]);

  const chosenQ = questions.filter(
    (q) => checkedQ.includes(q.id) || checkedQ.length === 0,
  );

  const heartTrend = metrics.map((m) => ({
    date: m.date,
    value: m.restingHR,
  }));

  const oneLine =
    flagged.length === 0
      ? "Wellness data is sitting comfortably within the patient's own baseline."
      : `${flagged.length} item${flagged.length > 1 ? "s" : ""} the patient would like reviewed; most signals are otherwise within their personal baseline.`;

  const flaggedBiomarkers = biomarkers.filter((b) => {
    if (b.value == null) return false;
    if (b.highIsConcern && b.refHigh != null) return b.value > b.refHigh;
    if (!b.highIsConcern && b.refLow != null) return b.value < b.refLow;
    return false;
  });

  const makeLink = () => {
    const token = Math.random().toString(36).slice(2, 10);
    const url = `${window.location.origin}/r/${token}`;
    setLink(url);
    navigator.clipboard?.writeText(url).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      },
      () => {},
    );
  };

  return (
    <div className={shared ? "min-h-screen bg-cream py-8" : ""}>
      <div className={shared ? "mx-auto max-w-3xl px-4" : ""}>
        {/* Controls (hidden on print + on shared view) */}
        {!shared && (
          <div className="no-print mb-6">
            <h1 className="text-3xl md:text-4xl">Your doctor report</h1>
            <p className="mt-2 max-w-readable text-muted">
              One clean page that makes your visit faster — what changed, what
              you'd like reviewed, and the questions you want to ask. Written so
              a busy clinician can scan it in a minute.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button className="btn-primary" onClick={() => window.print()}>
                Download / print as PDF
              </button>
              <button className="btn-ghost" onClick={makeLink}>
                Create a shareable link
              </button>
            </div>
            {link && (
              <div className="mt-3 rounded-xl bg-sage-tint/70 p-4 text-sm">
                <p className="text-ink">
                  {copied ? "✓ Link copied — " : ""}A secure, read-only link is
                  ready:
                </p>
                <code className="mt-1 block break-all text-clay-deep">
                  {link}
                </code>
                <p className="mt-1 text-faint">
                  Only people you send it to can open it. You can revoke it any
                  time in Settings.
                </p>
              </div>
            )}
          </div>
        )}

        {shared && (
          <p className="no-print mb-4 rounded-xl bg-paper p-3 text-center text-sm text-muted">
            Read-only summary shared from HeartSum.
          </p>
        )}

        {/* The report sheet */}
        <article className="print-page card mx-auto max-w-3xl bg-paper p-8 md:p-10">
          {/* Header */}
          <header className="border-b border-hair pb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-clay text-paper">
                  ♡
                </span>
                <span className="font-serif text-xl">HeartSum</span>
              </div>
              <span className="text-sm text-faint">Health summary</span>
            </div>
            <h2 className="mt-4 text-2xl">{profile.name}</h2>
            <p className="text-muted">
              {profile.age} years · {profile.sex} · {profile.heightCm} cm,{" "}
              {profile.weightKg} kg
            </p>
            <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <div className="flex gap-2">
                <dt className="text-faint">Period:</dt>
                <dd className="text-ink">{dateRange(metrics)}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-faint">Conditions:</dt>
                <dd className="text-ink">
                  {profile.conditions.join(", ") || "none reported"}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-faint">Medications:</dt>
                <dd className="text-ink">
                  {profile.medications.join(", ") || "none reported"}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-faint">Family history:</dt>
                <dd className="text-ink">
                  {profile.familyHistory.join(", ") || "none reported"}
                </dd>
              </div>
            </dl>
            <p className="mt-4 rounded-lg bg-cream p-3 text-[15px] text-ink">
              <strong>Summary.</strong> {oneLine}
            </p>
          </header>

          {/* Flagged items */}
          <section className="border-b border-hair py-5">
            <h3 className="text-lg">Items the patient would like reviewed</h3>
            <p className="mt-1 text-sm text-faint">
              Patient-reported wellness data and self-entered lab results, for
              your review — not diagnoses. Ordered by the patient's level of
              attention.
            </p>
            <ol className="mt-4 space-y-4">
              {flagged.map((i: Insight, idx) => (
                <li key={i.id} className="flex gap-3">
                  <span className="font-serif text-lg text-faint">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-ink">{i.title}</span>
                      <TierBadge tier={i.tier} title={false} />
                    </div>
                    <p className="mt-0.5 text-[15px] text-muted">{i.oneLine}</p>
                  </div>
                </li>
              ))}
              {flagged.length === 0 && (
                <li className="text-muted">
                  No items flagged — all signals within personal baseline.
                </li>
              )}
            </ol>
          </section>

          {/* Key trend */}
          <section className="border-b border-hair py-5">
            <h3 className="text-lg">Key trend — resting heart rate (90 days)</h3>
            <div className="mt-2">
              <TrendChart
                data={heartTrend}
                baseline={baseline(metrics, "restingHR")}
                unit=" bpm"
                color="#b04a32"
                height={180}
              />
            </div>
            <p className="mt-1 text-sm text-faint">
              Resting heart rate now ≈ {round(recent(metrics, "restingHR"))} bpm
              vs personal baseline ≈ {round(baseline(metrics, "restingHR"))} bpm.
              Cardio fitness (VO₂ max) ≈ {vo2[vo2.length - 1].value} mL/kg·min.
            </p>
          </section>

          {/* Self-entered labs */}
          <section className="border-b border-hair py-5">
            <h3 className="text-lg">Self-entered lab results of note</h3>
            <table className="mt-3 w-full text-[15px]">
              <thead>
                <tr className="text-left text-sm text-faint">
                  <th className="pb-2 font-medium">Test</th>
                  <th className="pb-2 font-medium">Value</th>
                  <th className="pb-2 font-medium">General guidance</th>
                </tr>
              </thead>
              <tbody>
                {flaggedBiomarkers.map((b) => (
                  <tr key={b.key} className="border-t border-hair">
                    <td className="py-1.5 pr-2 text-ink">{b.name}</td>
                    <td className="py-1.5 pr-2 font-medium text-ink">
                      {b.value} {b.unit}
                    </td>
                    <td className="py-1.5 text-faint">
                      {b.highIsConcern
                        ? `above ~${b.refHigh}`
                        : `below ~${b.refLow}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-sm text-faint">
              Patient-entered values. “General guidance” is a conservative
              population reference, not a personalised target.
            </p>
          </section>

          {/* Patient's questions */}
          <section className="border-b border-hair py-5">
            <h3 className="text-lg">The patient's questions for this visit</h3>
            <ul className="mt-3 space-y-2">
              {chosenQ.map((q) => (
                <li key={q.id} className="flex gap-2 text-ink">
                  <span className="text-clay">•</span>
                  {q.text}
                </li>
              ))}
              {chosenQ.length === 0 && (
                <li className="text-muted">No specific questions noted.</li>
              )}
            </ul>
          </section>

          {/* Disclaimer */}
          <footer className="pt-5">
            <p className="rounded-lg bg-brick-tint/50 p-3 text-sm leading-relaxed text-ink">
              <strong>Please note.</strong> This is consumer wellness data from a
              smartwatch plus self-entered lab results, provided to{" "}
              <strong>support — not replace</strong> — your clinical judgement.
              These are signals, not diagnoses. HeartSum does not recommend
              starting, stopping or changing any treatment. Wearable metrics are
              estimates and vary with fit, motion, skin and region.
            </p>
          </footer>
        </article>
      </div>
    </div>
  );
}
