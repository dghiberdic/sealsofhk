import { TierBadge } from "../components/ui";
import type { Tier } from "../lib/types";

const canaries: { signal: string; plain: string }[] = [
  {
    signal: "Resting heart rate ↑",
    plain: "Infection, fever, overtraining, dehydration, stress, alcohol; a sustained rise can point toward cardiovascular risk.",
  },
  {
    signal: "HRV ↓",
    plain: "Stress, poor recovery, an infection starting, overtraining, or alcohol.",
  },
  {
    signal: "Respiratory rate ↑",
    plain: "A respiratory infection, fever, or alcohol.",
  },
  {
    signal: "Wrist temperature ↑",
    plain: "Infection or fever, menstrual-cycle phase, alcohol, or just a hot room.",
  },
  {
    signal: "Blood oxygen ↓",
    plain: "Altitude, a respiratory infection, sleep apnea, or lung issues.",
  },
  {
    signal: "Irregular pulse / ECG",
    plain: "Atrial fibrillation or another rhythm issue — the stroke-risk pathway.",
  },
  {
    signal: "VO₂ max ↓ (trend)",
    plain: "Deconditioning; rising cardiovascular and mortality risk over time.",
  },
  {
    signal: "Two+ Vitals outliers in one night",
    plain: "The general “something is off” signal — most often illness, overtraining, travel or alcohol.",
  },
];

const cantDo = [
  "No blood chemistry. The watch can't measure glucose, cholesterol or hormones — that's why HeartSum lets you add your blood work.",
  "No blood-pressure number. The hypertension notification flags a pattern; you still need a cuff for an actual reading.",
  "It reads patterns, not single events. Most flags need days-to-weeks of data — one odd night means little.",
  "False alarms happen. A loose fit, tattoos, cold skin or motion can all cause errors, and it can miss real things too.",
  "Signals overlap. Illness, stress, overtraining and a hangover look nearly identical — context is yours to add.",
  "It's not a diagnostic device for most of this. Cleared features are screening prompts; the rest is wellness insight.",
];

function TierRow({ tier, text }: { tier: Tier; text: string }) {
  return (
    <div className="flex flex-col gap-2 border-t border-hair py-4 first:border-t-0 sm:flex-row sm:items-center">
      <div className="sm:w-56 sm:shrink-0">
        <TierBadge tier={tier} title={false} />
      </div>
      <p className="text-muted">{text}</p>
    </div>
  );
}

export function Learn() {
  return (
    <div className="max-w-readable">
      <h1 className="text-3xl md:text-4xl">Why this matters</h1>
      <p className="mt-2 text-muted">
        A calm place to understand what HeartSum is doing — and, just as
        important, what it can't do. This is where we earn your trust.
      </p>

      <section className="card mt-8 p-6">
        <h2 className="text-2xl">How sure are we? The three tiers</h2>
        <p className="mt-1 text-muted">
          Every insight wears one of these, so you always know how seriously to
          take it.
        </p>
        <div className="mt-4">
          <TierRow
            tier={1}
            text="The watch is regulator-cleared to flag this and will actively notify you — the closest it comes to “something may be off.”"
          />
          <TierRow
            tier={2}
            text="Not a built-in alert, but well-documented in peer-reviewed studies and readable from your data."
          />
          <TierRow
            tier={3}
            text="Plausible and researched, but noisy and not validated for individuals. We show these gently, as hints only."
          />
        </div>
      </section>

      <section className="card mt-5 p-6">
        <h2 className="text-2xl">The HeartSum philosophy</h2>
        <ul className="mt-3 space-y-3 text-muted">
          <li>
            <strong className="text-ink">Learn your normal.</strong> Everything
            is judged against your own baseline, not a universal ideal.
          </li>
          <li>
            <strong className="text-ink">Watch for trends, not blips.</strong>{" "}
            Sustained drifts over weeks matter; a single odd night doesn't.
          </li>
          <li>
            <strong className="text-ink">Clusters matter most.</strong> One
            signal drifting is usually harmless. Two or more moving together is
            a far stronger signal.
          </li>
          <li>
            <strong className="text-ink">Calm by default.</strong> Most days the
            honest answer is “you look steady,” and we say so.
          </li>
        </ul>
      </section>

      <section className="card mt-5 p-6">
        <h2 className="text-2xl">The “canary” signals</h2>
        <p className="mt-1 text-muted">
          A handful of signals do most of the early-warning work. When one
          drifts from your baseline, here's what it might point at.
        </p>
        <div className="mt-4 divide-y divide-hair">
          {canaries.map((c) => (
            <div key={c.signal} className="py-3">
              <div className="font-medium text-ink">{c.signal}</div>
              <div className="text-sm text-muted">{c.plain}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="card mt-5 p-6">
        <h2 className="text-2xl">What this can't do</h2>
        <p className="mt-1 text-muted">
          So you never over-read it. Honesty is part of the point.
        </p>
        <ul className="mt-4 space-y-3">
          {cantDo.map((c, i) => (
            <li key={i} className="flex gap-3 text-muted">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-8 rounded-2xl bg-sage-tint/60 p-5 leading-relaxed text-ink">
        The healthy way to use HeartSum: learn your normal, watch for sustained
        drifts, and treat clusters of signals as a nudge to rest or get checked.
        Used this way it's a useful early-warning layer — not a source of health
        anxiety, and never a replacement for medical care.
      </p>
    </div>
  );
}
