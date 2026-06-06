import { useState } from "react";
import { Sparkline } from "../components/charts";
import { Brandmark } from "../components/ui";
import {
  Check,
  Download,
  FileCheck2,
  Icon,
  Info,
  LinkIcon,
} from "../components/icons";
import { recent, round } from "../lib/analysis";
import { downloadFhir } from "../lib/fhir";
import { useStore } from "../lib/store";
import { dualUnit } from "../lib/units";
import type { Biomarker, DayMetric } from "../lib/types";

function dateRange(metrics: DayMetric[]) {
  const fmt = (s: string) =>
    new Date(s).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  return `${fmt(metrics[0].date)} – ${fmt(metrics[metrics.length - 1].date)}`;
}

// Green / yellow / red presentation (shared by Framingham category + watch status).
const rag = {
  green: {
    label: "GREEN",
    cls: "bg-sage-tint text-sage-deep border border-sage-border",
    dot: "bg-sage",
  },
  yellow: {
    label: "YELLOW",
    cls: "bg-gold-tint text-gold-deep border border-gold-border",
    dot: "bg-gold",
  },
  red: {
    label: "RED",
    cls: "bg-brick-tint text-brick-deep border border-brick-border",
    dot: "bg-brick",
  },
} as const;

function biomarkerState(b: Biomarker): "high" | "low" | "ok" {
  if (b.value == null) return "ok";
  if (b.highIsConcern && b.refHigh != null && b.value > b.refHigh) return "high";
  if (!b.highIsConcern && b.refLow != null && b.value < b.refLow) return "low";
  return "ok";
}

export function Report({ shared = false }: { shared?: boolean }) {
  const {
    profile,
    metrics,
    biomarkers,
    questions,
    checkedQ,
    vo2,
    framingham,
    watch,
  } = useStore();
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const chosenQ = questions.filter(
    (q) => checkedQ.includes(q.id) || checkedQ.length === 0,
  );

  const outOfRange = biomarkers.filter((b) => biomarkerState(b) !== "ok");

  // --- Templated, deterministic summary (no LLM) --------------------------
  const summary: string[] = [];
  if (framingham.available && framingham.riskPct != null) {
    summary.push(
      `Framingham 10-year CVD risk is ${framingham.riskPct}% (${framingham.category}).`,
    );
  }
  for (const r of watch.fired) summary.push(r.detail);
  if (watch.fired.some((r) => r.sustainedDays >= 7)) {
    summary.push("These trends are sustained for 7+ days.");
  }
  if (watch.ok.length) {
    summary.push(
      `${watch.ok.map((o) => o.label).join(", ")} remain within normal limits.`,
    );
  }
  if (outOfRange.length) {
    const highs = outOfRange.filter((b) => biomarkerState(b) === "high");
    if (highs.length)
      summary.push(`${highs.map((b) => b.name).join(", ")} are above reference range.`);
  }
  summary.push(
    "This report is generated deterministically from the data sources listed. It is not a clinical diagnosis.",
  );

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

  const status = rag[watch.status];
  const framColor = framingham.color ? rag[framingham.color] : rag.green;

  // RHR / HRV sparkline series (last 30 days)
  const rhrSeries = metrics.slice(-30).map((m) => m.restingHR);
  const hrvSeries = metrics.slice(-30).map((m) => m.hrv);

  return (
    <div className={shared ? "min-h-screen bg-cream py-8" : ""}>
      <div className={shared ? "mx-auto max-w-3xl px-4" : ""}>
        {/* Controls (hidden on print + on shared view) */}
        {!shared && (
          <div className="no-print mb-6">
            <h1 className="text-3xl md:text-4xl">Your doctor report</h1>
            <p className="mt-2 max-w-readable text-muted">
              One clean page that makes your visit faster — your heart-risk
              estimate, what your watch has noticed, your latest labs and the
              questions you want to ask. Written so a busy clinician can scan it
              in a minute.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button className="btn-primary" onClick={() => window.print()}>
                <Icon icon={Download} size={18} />
                Download / print as PDF
              </button>
              <button className="btn-ghost" onClick={makeLink}>
                <Icon icon={LinkIcon} size={18} />
                Create a shareable link
              </button>
              <button
                className="btn-ghost"
                onClick={() => downloadFhir(profile, biomarkers, framingham)}
              >
                <Icon icon={FileCheck2} size={18} />
                Export FHIR bundle
              </button>
            </div>
            {link && (
              <div className="mt-3 rounded-input bg-sage-tint/70 p-4 text-sm">
                <p className="flex items-center gap-1.5 text-ink">
                  {copied && <Icon icon={Check} size={16} className="text-sage" />}
                  {copied ? "Link copied — " : ""}A secure, read-only link is
                  ready:
                </p>
                <code className="mt-1 block break-all text-clay-deep">{link}</code>
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
          {/* Header / patient summary */}
          <header className="border-b-2 border-ink pb-5">
            <div className="flex items-center justify-between">
              <Brandmark size={28} />
              <span className="eyebrow">Cardiovascular monitoring report</span>
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
                <dt className="text-faint">Allergies:</dt>
                <dd className="text-ink">
                  {profile.allergies.join(", ") || "none reported"}
                </dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-faint">
              Source: eHealth record (mocked FHIR R4)
            </p>
          </header>

          {/* Framingham 10-year CVD risk */}
          <section className="border-b border-hair py-5">
            <h3 className="text-lg">Framingham 10-year CVD risk</h3>
            {framingham.available && framingham.inputs ? (
              <>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="font-serif text-4xl text-ink">
                    {framingham.riskPct}%
                  </span>
                  <span className={`pill ${framColor.cls} uppercase tracking-wide`}>
                    <span className={`h-2 w-2 rounded-full ${framColor.dot}`} />
                    {framingham.category}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted">
                  Inputs — Age {framingham.inputs.age} ·{" "}
                  {framingham.inputs.sex === "male" ? "Male" : "Female"} · TC{" "}
                  {framingham.inputs.totalCholMgdl} mg/dL · HDL{" "}
                  {framingham.inputs.hdlMgdl} mg/dL · SBP {framingham.inputs.sbp}{" "}
                  mmHg ({framingham.inputs.treated ? "treated" : "untreated"}) ·
                  Smoker {framingham.inputs.smoker ? "yes" : "no"} · Diabetic{" "}
                  {framingham.inputs.diabetes ? "yes" : "no"}
                </p>
                {framingham.notes.map((n, i) => (
                  <p key={i} className="mt-1 text-xs text-faint">
                    Note: {n}
                  </p>
                ))}
                <p className="mt-1 text-xs text-faint">
                  Method: Framingham General CVD Risk (D'Agostino et al., 2008).
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted">
                {framingham.reason ?? "Not enough data to compute."}
              </p>
            )}
          </section>

          {/* Blood biomarkers */}
          <section className="border-b border-hair py-5">
            <h3 className="text-lg">Blood biomarkers (latest)</h3>
            <table className="mt-3 w-full text-[15px]">
              <thead>
                <tr className="text-left text-sm text-faint">
                  <th className="pb-2 font-medium">Test</th>
                  <th className="pb-2 font-medium">Value</th>
                  <th className="pb-2 font-medium">Reference</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {biomarkers
                  .filter((b) => b.value != null)
                  .map((b) => {
                    const st = biomarkerState(b);
                    return (
                      <tr key={b.key} className="border-t border-hair">
                        <td className="py-1.5 pr-2 text-ink">{b.name}</td>
                        <td className="py-1.5 pr-2 font-medium text-ink">
                          {dualUnit(b.key, b.value as number, b.unit)}
                        </td>
                        <td className="py-1.5 pr-2 text-faint">
                          {b.highIsConcern
                            ? `<${b.refHigh} ${b.unit}`
                            : `>${b.refLow} ${b.unit}`}
                        </td>
                        <td className="py-1.5">
                          {st === "ok" ? (
                            <span className="text-sage-deep">OK</span>
                          ) : (
                            <span className="font-semibold text-brick-deep">
                              {st === "high" ? "↑ high" : "↓ low"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-faint">
              Source: lab report (photo-extracted / self-entered). Reference
              bands are conservative population guidance, not personalised
              targets.
            </p>
          </section>

          {/* Apple Watch trends */}
          <section className="border-b border-hair py-5">
            <h3 className="text-lg">Apple Watch trends (past 30 days)</h3>

            <div className="mt-3 space-y-3">
              <WatchRow
                label="Resting HR"
                from={watch.rhr.baseline}
                to={watch.rhr.current}
                pct={watch.rhr.pct}
                unit="bpm"
                series={rhrSeries}
                fired={watch.fired.find((f) => f.id === "W1" || f.id === "W2")}
                color="#c2603d"
              />
              <WatchRow
                label="HRV (SDNN)"
                from={watch.hrv.baseline}
                to={watch.hrv.current}
                pct={watch.hrv.pct}
                unit="ms"
                series={hrvSeries}
                fired={watch.fired.find((f) => f.id === "W3" || f.id === "W4")}
                color="#6e8a66"
              />
            </div>

            <ul className="mt-3 space-y-1 text-sm text-muted">
              {watch.ok.map((o) => (
                <li key={o.label}>
                  <span className="text-sage-deep">✓ {o.label}:</span> {o.note}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className={`pill ${status.cls}`}>
                <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                Combined status: {status.label}
              </span>
              {watch.fired.length > 0 && (
                <span className="text-sm text-muted">
                  Active alerts: {watch.fired.map((f) => f.id).join(", ")}
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-faint">
              Source: Apple HealthKit export. VO₂ max ≈{" "}
              {vo2[vo2.length - 1].value} mL/kg·min. Rules compare a recent
              window against the patient's own 30-day baseline.
            </p>
          </section>

          {/* Templated summary */}
          <section className="border-b border-hair py-5">
            <h3 className="text-lg">Summary</h3>
            <div className="mt-2 space-y-2 text-[15px] leading-relaxed text-ink">
              {summary.map((s, i) => (
                <p key={i}>{s}</p>
              ))}
            </div>
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

          {/* Disclaimer + sources */}
          <footer className="pt-5">
            <div className="flex gap-3 rounded-input border border-clay-border bg-clay-tint p-4">
              <Icon icon={Info} size={20} className="mt-0.5 shrink-0 text-clay" />
              <p className="text-sm leading-relaxed text-ink">
                <strong>Please note.</strong> This is consumer wellness data from
                a smartwatch plus self-entered lab results and a mocked eHealth
                record, provided to <strong>support — not replace</strong> — your
                clinical judgement. These are signals, not diagnoses. HeartSum
                does not recommend starting, stopping or changing any treatment.
              </p>
            </div>
            <p className="mt-3 text-xs text-faint">
              Data sources: Apple HealthKit export, photo-extracted / self-entered
              lab report, eHealth record (mocked FHIR R4). Report version 1.0.
            </p>
          </footer>
        </article>
      </div>
    </div>
  );
}

function WatchRow({
  label,
  from,
  to,
  pct,
  unit,
  series,
  fired,
  color,
}: {
  label: string;
  from: number;
  to: number;
  pct: number;
  unit: string;
  series: number[];
  fired?: { id: string };
  color: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-48 shrink-0">
        <div className="text-sm font-medium text-ink">{label}</div>
        <div className="text-sm text-muted">
          {from} → {to} {unit}{" "}
          <span className={pct >= 0 ? "text-brick-deep" : "text-sage-deep"}>
            ({pct >= 0 ? "+" : ""}
            {pct}%)
          </span>
        </div>
      </div>
      <Sparkline data={series} color={color} width={160} height={32} />
      {fired ? (
        <span className="pill border border-gold-border bg-gold-tint text-xs text-gold-deep">
          ⚠ Rule {fired.id}
        </span>
      ) : (
        <span className="text-sm text-sage-deep">✓ OK</span>
      )}
    </div>
  );
}
