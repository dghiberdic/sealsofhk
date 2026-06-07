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
import { useT, BIOMARKER_ZH } from "../lib/i18n";
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

const rag = {
  green: { label: "GREEN", zh: "綠", cls: "bg-sage-tint text-sage-deep border border-sage-border", dot: "bg-sage" },
  yellow: { label: "YELLOW", zh: "黃", cls: "bg-gold-tint text-gold-deep border border-gold-border", dot: "bg-gold" },
  red: { label: "RED", zh: "紅", cls: "bg-brick-tint text-brick-deep border border-brick-border", dot: "bg-brick" },
} as const;

const catZh: Record<string, string> = { low: "低", moderate: "中等", high: "高" };

function biomarkerState(b: Biomarker): "high" | "low" | "ok" {
  if (b.value == null) return "ok";
  if (b.highIsConcern && b.refHigh != null && b.value > b.refHigh) return "high";
  if (!b.highIsConcern && b.refLow != null && b.value < b.refLow) return "low";
  return "ok";
}

// Bilingual section heading — Chinese first, English below.
function H({ zh, en }: { zh: string; en: string }) {
  return (
    <h3 className="text-lg leading-tight">
      {zh}
      <span className="ml-2 align-middle text-sm font-normal text-faint">{en}</span>
    </h3>
  );
}

export function Report({ shared = false }: { shared?: boolean }) {
  const { profile, metrics, biomarkers, questions, checkedQ, vo2, framingham, watch } =
    useStore();
  const { t } = useT();
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const chosenQ = questions.filter(
    (q) => checkedQ.includes(q.id) || checkedQ.length === 0,
  );
  const outOfRange = biomarkers.filter((b) => biomarkerState(b) !== "ok");

  // --- Templated, deterministic summary (no LLM), bilingual ----------------
  const summary: { zh: string; en: string }[] = [];
  if (framingham.available && framingham.riskPct != null) {
    summary.push({
      zh: `Framingham 十年心血管疾病風險為 ${framingham.riskPct}%（${catZh[framingham.category!]}）。`,
      en: `Framingham 10-year CVD risk is ${framingham.riskPct}% (${framingham.category}).`,
    });
  }
  for (const r of watch.fired)
    summary.push({ zh: r.detailZh ?? r.detail, en: r.detail });
  if (watch.fired.some((r) => r.sustainedDays >= 7)) {
    summary.push({ zh: "這些趨勢持續 7 天或以上。", en: "These trends are sustained for 7+ days." });
  }
  if (watch.ok.length) {
    summary.push({
      zh: `${watch.ok.map((o) => o.labelZh ?? o.label).join("、")}維持正常。`,
      en: `${watch.ok.map((o) => o.label).join(", ")} remain within normal limits.`,
    });
  }
  const highs = outOfRange.filter((b) => biomarkerState(b) === "high");
  if (highs.length) {
    summary.push({
      zh: `${highs.map((b) => BIOMARKER_ZH[b.key] ?? b.name).join("、")}高於參考範圍。`,
      en: `${highs.map((b) => b.name).join(", ")} are above reference range.`,
    });
  }
  summary.push({
    zh: "本報告由所列數據來源以固定方式生成，並非臨床診斷。",
    en: "This report is generated deterministically from the data sources listed. It is not a clinical diagnosis.",
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

  const status = rag[watch.status];
  const framColor = framingham.color ? rag[framingham.color] : rag.green;
  const rhrSeries = metrics.slice(-30).map((m) => m.restingHR);
  const hrvSeries = metrics.slice(-30).map((m) => m.hrv);
  const none = "沒有記錄 / none reported";

  return (
    <div className={shared ? "min-h-screen bg-cream py-8" : ""}>
      <div className={shared ? "mx-auto max-w-3xl px-4" : ""}>
        {/* Controls (hidden on print + on shared view) */}
        {!shared && (
          <div className="no-print mb-6">
            <h1 className="text-3xl md:text-4xl">{t("report.h1")}</h1>
            <p className="mt-2 max-w-readable text-muted">{t("report.intro")}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button className="btn-primary" onClick={() => window.print()}>
                <Icon icon={Download} size={18} />
                {t("report.print")}
              </button>
              <button className="btn-ghost" onClick={makeLink}>
                <Icon icon={LinkIcon} size={18} />
                {t("report.link")}
              </button>
              <button
                className="btn-ghost"
                onClick={() => downloadFhir(profile, biomarkers, framingham)}
              >
                <Icon icon={FileCheck2} size={18} />
                {t("report.exportFhir")}
              </button>
            </div>
            {link && (
              <div className="mt-3 rounded-input bg-sage-tint/70 p-4 text-sm">
                <p className="flex items-center gap-1.5 text-ink">
                  {copied && <Icon icon={Check} size={16} className="text-sage" />}
                  {copied ? "已複製 / Link copied — " : ""}可分享的唯讀連結 / read-only link:
                </p>
                <code className="mt-1 block break-all text-clay-deep">{link}</code>
              </div>
            )}
          </div>
        )}

        {shared && (
          <p className="no-print mb-4 rounded-xl bg-paper p-3 text-center text-sm text-muted">
            HeartSum 分享的唯讀摘要 · Read-only summary shared from HeartSum.
          </p>
        )}

        {/* The report sheet — always bilingual (中文 then English) */}
        <article className="print-page card mx-auto max-w-3xl bg-paper p-8 md:p-10">
          {/* Header / patient summary */}
          <header className="border-b-2 border-ink pb-5">
            <div className="flex items-center justify-between">
              <Brandmark size={28} />
              <span className="eyebrow">心血管監測報告 · Cardiovascular monitoring report</span>
            </div>
            <h2 className="mt-4 text-2xl">{profile.name}</h2>
            <p className="text-muted">
              {profile.age} 歲 / years ·{" "}
              {profile.sex === "male" ? "男 / Male" : profile.sex === "female" ? "女 / Female" : "其他 / Other"} ·{" "}
              {profile.heightCm} cm, {profile.weightKg} kg
            </p>
            <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <div className="flex gap-2">
                <dt className="text-faint">期間 / Period:</dt>
                <dd className="text-ink">{dateRange(metrics)}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-faint">病歷 / Conditions:</dt>
                <dd className="text-ink">{profile.conditions.join("、") || none}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-faint">藥物 / Medications:</dt>
                <dd className="text-ink">{profile.medications.join("、") || none}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-faint">過敏 / Allergies:</dt>
                <dd className="text-ink">{profile.allergies.join("、") || none}</dd>
              </div>
            </dl>
          </header>

          {/* Framingham 10-year CVD risk */}
          <section className="border-b border-hair py-5">
            <H zh="Framingham 十年心血管風險" en="Framingham 10-year CVD risk" />
            {framingham.available && framingham.inputs ? (
              <>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="font-serif text-4xl text-ink">{framingham.riskPct}%</span>
                  <span className={`pill ${framColor.cls}`}>
                    <span className={`h-2 w-2 rounded-full ${framColor.dot}`} />
                    {catZh[framingham.category!]} / {framingham.category}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted">
                  輸入 / Inputs — {framingham.inputs.age} 歲 ·{" "}
                  {framingham.inputs.sex === "male" ? "男" : "女"} · TC{" "}
                  {framingham.inputs.totalCholMgdl} mg/dL · HDL {framingham.inputs.hdlMgdl} mg/dL ·
                  SBP {framingham.inputs.sbp} mmHg (
                  {framingham.inputs.treated ? "服藥 treated" : "未服藥 untreated"}) ·{" "}
                  吸煙 {framingham.inputs.smoker ? "是 yes" : "否 no"} · 糖尿{" "}
                  {framingham.inputs.diabetes ? "是 yes" : "否 no"}
                </p>
                {framingham.notes.map((n, i) => (
                  <p key={i} className="mt-1 text-xs text-faint">註 Note: {n}</p>
                ))}
                <p className="mt-1 text-xs text-faint">
                  方法 Method: Framingham General CVD Risk (D'Agostino et al., 2008).
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted">
                {framingham.reason ?? "資料不足，無法計算。Not enough data to compute."}
              </p>
            )}
          </section>

          {/* Blood biomarkers */}
          <section className="border-b border-hair py-5">
            <H zh="驗血指標（最新）" en="Blood biomarkers (latest)" />
            <table className="mt-3 w-full text-[15px]">
              <thead>
                <tr className="text-left text-sm text-faint">
                  <th className="pb-2 font-medium">項目 / Test</th>
                  <th className="pb-2 font-medium">數值 / Value</th>
                  <th className="pb-2 font-medium">參考 / Reference</th>
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
                        <td className="py-1.5 pr-2 text-ink">
                          {BIOMARKER_ZH[b.key] ?? ""}
                          <span className="block text-xs text-faint">{b.name}</span>
                        </td>
                        <td className="py-1.5 pr-2 font-medium text-ink">
                          {dualUnit(b.key, b.value as number, b.unit)}
                        </td>
                        <td className="py-1.5 pr-2 text-faint">
                          {b.highIsConcern ? `<${b.refHigh} ${b.unit}` : `>${b.refLow} ${b.unit}`}
                        </td>
                        <td className="py-1.5">
                          {st === "ok" ? (
                            <span className="text-sage-deep">正常 OK</span>
                          ) : (
                            <span className="font-semibold text-brick-deep">
                              {st === "high" ? "↑ 偏高 high" : "↓ 偏低 low"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-faint">
              來源：化驗報告（拍攝擷取／自行輸入）。參考範圍為保守的人口指引，並非個人化目標。
              <br />
              Source: lab report (photo-extracted / self-entered). Reference bands are
              conservative population guidance, not personalised targets.
            </p>
          </section>

          {/* Apple Watch trends */}
          <section className="border-b border-hair py-5">
            <H zh="Apple Watch 趨勢（過去 30 天）" en="Apple Watch trends (past 30 days)" />
            <div className="mt-3 space-y-3">
              <WatchRow
                labelZh="靜止心率"
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
                labelZh="心率變異 (SDNN)"
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
                  <span className="text-sage-deep">✓ {o.labelZh ?? o.label} / {o.label}:</span>{" "}
                  {o.noteZh ?? o.note}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className={`pill ${status.cls}`}>
                <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                綜合狀態 Combined status: {status.zh} / {status.label}
              </span>
              {watch.fired.length > 0 && (
                <span className="text-sm text-muted">
                  生效警示 Active alerts: {watch.fired.map((f) => f.id).join(", ")}
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-faint">
              來源：Apple HealthKit 匯出。
              {vo2.length > 0 ? ` VO₂ max ≈ ${vo2[vo2.length - 1].value} mL/kg·min。` : ""}{" "}
              規則以近期時段與病人自身 30 天基線比較。 · Source: Apple HealthKit export;
              rules compare a recent window against the patient's own 30-day baseline.
            </p>
          </section>

          {/* Templated summary */}
          <section className="border-b border-hair py-5">
            <H zh="摘要" en="Summary" />
            <div className="mt-2 space-y-3 text-[15px] leading-relaxed text-ink">
              {summary.map((s, i) => (
                <p key={i}>
                  {s.zh}
                  <span className="mt-0.5 block text-sm text-muted">{s.en}</span>
                </p>
              ))}
            </div>
          </section>

          {/* Patient's questions */}
          <section className="border-b border-hair py-5">
            <H zh="病人今次求診想問的問題" en="The patient's questions for this visit" />
            <ul className="mt-3 space-y-2">
              {chosenQ.map((q) => (
                <li key={q.id} className="flex gap-2 text-ink">
                  <span className="text-clay">•</span>
                  <span>
                    {q.textZh ?? q.text}
                    {q.textZh && (
                      <span className="block text-sm text-muted">{q.text}</span>
                    )}
                  </span>
                </li>
              ))}
              {chosenQ.length === 0 && (
                <li className="text-muted">沒有特定問題。No specific questions noted.</li>
              )}
            </ul>
          </section>

          {/* Disclaimer + sources */}
          <footer className="pt-5">
            <div className="flex gap-3 rounded-input border border-clay-border bg-clay-tint p-4">
              <Icon icon={Info} size={20} className="mt-0.5 shrink-0 text-clay" />
              <p className="text-sm leading-relaxed text-ink">
                <strong>請注意。</strong>這是來自智能手錶的健康數據，加上自行輸入的化驗結果及（模擬的）醫健通記錄，旨在
                <strong>協助而非取代</strong>你的臨床判斷。這些是訊號，並非診斷。HeartSum 不建議開始、停止或更改任何治療。
                <span className="mt-2 block text-muted">
                  <strong>Please note.</strong> This is consumer wellness data plus self-entered
                  lab results and a mocked eHealth record, to <strong>support — not replace</strong>{" "}
                  your clinical judgement. These are signals, not diagnoses. HeartSum does not
                  recommend starting, stopping or changing any treatment.
                </span>
              </p>
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}

function WatchRow({
  labelZh,
  label,
  from,
  to,
  pct,
  unit,
  series,
  fired,
  color,
}: {
  labelZh: string;
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
        <div className="text-sm font-medium text-ink">
          {labelZh} <span className="text-faint">{label}</span>
        </div>
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
          ⚠ 規則 Rule {fired.id}
        </span>
      ) : (
        <span className="text-sm text-sage-deep">✓ 正常 OK</span>
      )}
    </div>
  );
}
