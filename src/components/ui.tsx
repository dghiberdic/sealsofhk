import type { ReactNode } from "react";
import { TIER_BLURB, TIER_LABEL, type Status, type Tier } from "../lib/types";

// --- Tier badge -------------------------------------------------------------
const tierStyle: Record<Tier, string> = {
  1: "bg-clay-tint text-clay-deep",
  2: "bg-sage-tint text-sage",
  3: "bg-sand text-muted",
};

export function TierBadge({ tier, title }: { tier: Tier; title?: boolean }) {
  return (
    <span
      className={`pill ${tierStyle[tier]}`}
      title={title === false ? undefined : TIER_BLURB[tier]}
    >
      <span className="font-semibold">Tier {tier}</span>
      <span className="opacity-80">· {TIER_LABEL[tier]}</span>
    </span>
  );
}

// --- Status dot/pill --------------------------------------------------------
export const statusMeta: Record<
  Status,
  { label: string; dot: string; text: string; bg: string }
> = {
  steady: {
    label: "Steady",
    dot: "bg-sage",
    text: "text-sage",
    bg: "bg-sage-tint",
  },
  watch: {
    label: "Keep an eye on it",
    dot: "bg-gold",
    text: "text-[#8a6f2e]",
    bg: "bg-[#f3ecd9]",
  },
  look: {
    label: "Worth a look",
    dot: "bg-brick",
    text: "text-brick",
    bg: "bg-brick-tint",
  },
};

export function StatusPill({ status }: { status: Status }) {
  const m = statusMeta[status];
  return (
    <span className={`pill ${m.bg} ${m.text}`}>
      <span className={`h-2 w-2 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

export function StatusDot({ status }: { status: Status }) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${statusMeta[status].dot}`}
    />
  );
}

// --- Section heading --------------------------------------------------------
export function SectionTitle({
  children,
  sub,
}: {
  children: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-2xl">{children}</h2>
      {sub && <p className="mt-1 text-muted">{sub}</p>}
    </div>
  );
}

// --- The "signals, not diagnoses" reminder, used throughout -----------------
export function SignalNote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-sm text-faint ${className}`}>
      These are wellness signals, not a diagnosis. HeartSum never tells you to
      start, stop, or change any medication or treatment.
    </p>
  );
}
