import { useMemo } from "react";

interface Pt {
  date: string;
  value: number;
}

// A small, quiet sparkline for cards.
export function Sparkline({
  data,
  color = "#c4633f",
  width = 120,
  height = 36,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  const path = useMemo(() => {
    if (data.length < 2) return "";
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    const stepX = width / (data.length - 1);
    return data
      .map((v, i) => {
        const x = i * stepX;
        const y = height - ((v - min) / span) * (height - 4) - 2;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [data, width, height]);

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// A full, calm trend chart that emphasises the personal baseline band
// and the direction of travel — not jagged daily noise.
export function TrendChart({
  data,
  baseline,
  unit = "",
  color = "#c4633f",
  height = 220,
}: {
  data: Pt[];
  baseline?: number;
  unit?: string;
  color?: string;
  height?: number;
}) {
  const width = 720;
  const padL = 44;
  const padR = 16;
  const padT = 16;
  const padB = 28;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const lo = min - (max - min) * 0.15 - 0.5;
  const hi = max + (max - min) * 0.15 + 0.5;
  const span = hi - lo || 1;

  const x = (i: number) =>
    padL + (i / (data.length - 1)) * (width - padL - padR);
  const y = (v: number) =>
    padT + (1 - (v - lo) / span) * (height - padT - padB);

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`)
    .join(" ");

  const areaPath =
    linePath +
    ` L${x(data.length - 1).toFixed(1)},${(height - padB).toFixed(1)}` +
    ` L${x(0).toFixed(1)},${(height - padB).toFixed(1)} Z`;

  // a soft "your normal" band ±6% around baseline
  const band = baseline
    ? { top: y(baseline * 1.06), bottom: y(baseline * 0.94), mid: y(baseline) }
    : null;

  const ticks = [lo + span * 0.15, lo + span * 0.5, hi - span * 0.15];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      role="img"
      aria-label="Trend over time"
    >
      <defs>
        <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.16" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* y gridlines */}
      {ticks.map((t, i) => (
        <g key={i}>
          <line
            x1={padL}
            x2={width - padR}
            y1={y(t)}
            y2={y(t)}
            stroke="#e7dfd2"
            strokeWidth={1}
          />
          <text x={8} y={y(t) + 4} fontSize={11} fill="#9a9082">
            {Math.round(t)}
          </text>
        </g>
      ))}

      {/* your normal band */}
      {band && (
        <>
          <rect
            x={padL}
            y={band.top}
            width={width - padL - padR}
            height={Math.max(0, band.bottom - band.top)}
            fill="#6f8f6a"
            opacity={0.1}
          />
          <line
            x1={padL}
            x2={width - padR}
            y1={band.mid}
            y2={band.mid}
            stroke="#6f8f6a"
            strokeDasharray="4 4"
            strokeWidth={1}
            opacity={0.5}
          />
          <text
            x={width - padR}
            y={band.top - 4}
            fontSize={11}
            fill="#6f8f6a"
            textAnchor="end"
          >
            your normal
          </text>
        </>
      )}

      <path d={areaPath} fill="url(#fill)" />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* last point */}
      <circle
        cx={x(data.length - 1)}
        cy={y(values[values.length - 1])}
        r={4}
        fill={color}
      />
      <text
        x={x(data.length - 1)}
        y={y(values[values.length - 1]) - 10}
        fontSize={12}
        fill="#2c2823"
        textAnchor="end"
        fontWeight={600}
      >
        {values[values.length - 1]}
        {unit}
      </text>
    </svg>
  );
}
