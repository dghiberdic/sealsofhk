import type { DayMetric } from "./types";

export function mean(xs: number[]): number {
  if (!xs.length) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function round(n: number, dp = 0): number {
  const f = Math.pow(10, dp);
  return Math.round(n * f) / f;
}

// A person's "normal" = the early part of the window (their established baseline),
// deliberately NOT the recent days, so we can compare now-vs-baseline.
export function baseline(metrics: DayMetric[], key: keyof DayMetric): number {
  const early = metrics.slice(0, 35).map((m) => Number(m[key]));
  return mean(early);
}

export function recent(
  metrics: DayMetric[],
  key: keyof DayMetric,
  days = 14,
): number {
  const tail = metrics.slice(-days).map((m) => Number(m[key]));
  return mean(tail);
}

export type Direction = "up" | "down" | "flat";

// Direction of travel of the recent window vs the personal baseline.
export function drift(
  metrics: DayMetric[],
  key: keyof DayMetric,
  threshold = 0.04,
): { dir: Direction; base: number; now: number; pct: number } {
  const base = baseline(metrics, key);
  const now = recent(metrics, key);
  const pct = base === 0 ? 0 : (now - base) / base;
  let dir: Direction = "flat";
  if (pct > threshold) dir = "up";
  else if (pct < -threshold) dir = "down";
  return { dir, base, now, pct };
}

export const today = (metrics: DayMetric[]) => metrics[metrics.length - 1];
