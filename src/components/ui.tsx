import type { ReactNode } from "react";
import { TIER_BLURB, TIER_LABEL, type Status, type Tier } from "../lib/types";
import { HeartPulse, Icon, ShieldCheck } from "./icons";

// --- Brandmark --------------------------------------------------------------
// A heart-pulse glyph in a clay rounded-square, with the Lora wordmark.
export function Brandmark({
  size = 34,
  tagline = false,
}: {
  size?: number;
  tagline?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="grid shrink-0 place-items-center rounded-[10px] bg-clay text-paper"
        style={{ width: size, height: size }}
        aria-hidden
      >
        <Icon icon={HeartPulse} size={Math.round(size * 0.58)} />
      </span>
      <div className="leading-tight">
        <div className="font-serif text-xl font-semibold text-ink">HeartSum</div>
        {tagline && (
          <div className="text-xs text-faint">Served in small plates</div>
        )}
      </div>
    </div>
  );
}

// --- Evidence-tier badge ----------------------------------------------------
// Tier 1 (cleared) is the most trusted — three filled strength pips; Tier 3 one.
// We lead with a SUBTLE read everywhere (the quiet pips below) and reserve the
// full "Tier 1 · Cleared by regulators" wording for the detailed view, where
// it's explained once — so the tier never shouts on every card.
const tierMeta: Record<Tier, { cls: string; filled: number }> = {
  1: { cls: "bg-tier1-tint text-tier1", filled: 3 },
  2: { cls: "bg-tier2-tint text-tier2", filled: 2 },
  3: { cls: "bg-tier3-tint text-tier3", filled: 1 },
};

// The subtle, on-card read: three quiet strength pips, no "Tier N" label.
// The plain meaning is available on hover / to screen readers, not shouted.
export function TierPips({
  tier,
  className = "",
}: {
  tier: Tier;
  className?: string;
}) {
  const filled = tierMeta[tier].filled;
  return (
    <span
      role="img"
      className={`inline-flex items-center gap-[3px] text-faint ${className}`}
      title={`How sure are we — ${TIER_LABEL[tier].toLowerCase()}`}
      aria-label={`Evidence strength: ${TIER_LABEL[tier]}`}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-current"
          style={{ opacity: i < filled ? 0.8 : 0.22 }}
        />
      ))}
    </span>
  );
}

export function TierBadge({
  tier,
  title,
  compact = false,
}: {
  tier: Tier;
  title?: boolean;
  compact?: boolean;
}) {
  const m = tierMeta[tier];
  return (
    <span
      className={`pill px-2.5 py-1 text-xs ${m.cls}`}
      title={title === false ? undefined : TIER_BLURB[tier]}
    >
      <span className="flex gap-[3px]" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-current"
            style={{ opacity: i < m.filled ? 1 : 0.3 }}
          />
        ))}
      </span>
      <span>Tier {tier}</span>
      {!compact && <span className="font-medium opacity-80">· {TIER_LABEL[tier]}</span>}
    </span>
  );
}

// --- Status dot / pill ------------------------------------------------------
export const statusMeta: Record<
  Status,
  { label: string; dot: string; text: string; bg: string; border: string }
> = {
  steady: {
    label: "Steady",
    dot: "bg-sage",
    text: "text-sage-deep",
    bg: "bg-sage-tint",
    border: "border-sage-border",
  },
  watch: {
    label: "Worth watching",
    dot: "bg-gold",
    text: "text-gold-deep",
    bg: "bg-gold-tint",
    border: "border-gold-border",
  },
  look: {
    label: "Please review",
    dot: "bg-brick",
    text: "text-brick-deep",
    bg: "bg-brick-tint",
    border: "border-brick-border",
  },
};

export function StatusPill({ status }: { status: Status }) {
  const m = statusMeta[status];
  return (
    <span className={`pill ${m.bg} ${m.text} ${m.border}`}>
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

// --- Eyebrow label ----------------------------------------------------------
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
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

// --- The short "signals, not diagnoses" reassurance capsule -----------------
export function Reassure({ className = "" }: { className?: string }) {
  return (
    <span className={`reassure ${className}`}>
      <Icon icon={ShieldCheck} size={18} className="shrink-0 text-clay-soft" />
      Signals, not diagnoses
    </span>
  );
}

// --- The fuller reassurance note, used at the foot of screens ----------------
export function SignalNote({ className = "" }: { className?: string }) {
  return (
    <p
      className={`flex items-start gap-2.5 text-sm leading-relaxed text-muted ${className}`}
    >
      <Icon
        icon={ShieldCheck}
        size={18}
        className="mt-0.5 shrink-0 text-clay-soft"
      />
      <span>
        These are wellness signals, not a diagnosis. HeartSum never tells you to
        start, stop, or change any medication or treatment.
      </span>
    </p>
  );
}
