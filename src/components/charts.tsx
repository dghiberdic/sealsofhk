import { useEffect, useMemo, useRef, useState } from "react";

interface Pt {
  date: string;
  value: number;
}

// A small, quiet sparkline for cards.
export function Sparkline({
  data,
  color = "#c2603d",
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
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

const fmtLong = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

// A full, calm trend chart that emphasises the personal baseline band
// and the direction of travel. Interactive: hover for the value at any date,
// and drag across the chart to zoom into a date range.
export function TrendChart({
  data,
  baseline,
  unit = "",
  color = "#c2603d",
  height = 220,
  interactive = true,
}: {
  data: Pt[];
  baseline?: number;
  unit?: string;
  color?: string;
  height?: number;
  interactive?: boolean;
}) {
  const width = 720;
  const padL = 44;
  const padR = 16;
  const padT = 16;
  const padB = 40;
  const plotL = padL;
  const plotR = width - padR;
  const plotW = plotR - plotL;
  const plotTop = padT;
  const plotBottom = height - padB;
  const plotH = plotBottom - plotTop;

  const svgRef = useRef<SVGSVGElement>(null);

  // Zoom is a [start, end] window of absolute indices into `data`.
  const [domain, setDomain] = useState<[number, number]>([0, data.length - 1]);
  const [hover, setHover] = useState<number | null>(null); // index within visible
  const [drag, setDrag] = useState<{ a: number; b: number } | null>(null);

  // Reset the window if the underlying series changes length.
  useEffect(() => {
    setDomain([0, data.length - 1]);
    setHover(null);
    setDrag(null);
  }, [data.length]);

  const start = Math.max(0, Math.min(domain[0], data.length - 1));
  const end = Math.max(start, Math.min(domain[1], data.length - 1));
  const visible = data.slice(start, end + 1);
  const zoomed = start > 0 || end < data.length - 1;

  const values = visible.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const lo = min - (max - min) * 0.15 - 0.5;
  const hi = max + (max - min) * 0.15 + 0.5;
  const span = hi - lo || 1;

  const x = (i: number) =>
    plotL + (visible.length === 1 ? 0 : (i / (visible.length - 1)) * plotW);
  const y = (v: number) => plotTop + (1 - (v - lo) / span) * plotH;

  const linePath = visible
    .map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`)
    .join(" ");
  const areaPath =
    linePath +
    ` L${x(visible.length - 1).toFixed(1)},${plotBottom.toFixed(1)}` +
    ` L${x(0).toFixed(1)},${plotBottom.toFixed(1)} Z`;

  const band = baseline
    ? { top: y(baseline * 1.06), bottom: y(baseline * 0.94), mid: y(baseline) }
    : null;

  const yTicks = [lo + span * 0.15, lo + span * 0.5, hi - span * 0.15];

  const tickCount = Math.min(5, visible.length);
  const xTicks = Array.from({ length: tickCount }, (_, k) => {
    const i =
      tickCount === 1 ? 0 : Math.round((k / (tickCount - 1)) * (visible.length - 1));
    return {
      i,
      label: fmtDate(visible[i].date),
      anchor: (k === 0
        ? "start"
        : k === tickCount - 1
          ? "end"
          : "middle") as "start" | "end" | "middle",
    };
  });

  // Map a pointer's clientX to the nearest visible data index.
  const toIndex = (clientX: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    const vbX = ((clientX - rect.left) / rect.width) * width;
    const frac = (vbX - plotL) / plotW;
    const idx = Math.round(frac * (visible.length - 1));
    return Math.max(0, Math.min(visible.length - 1, idx));
  };

  const onDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    const i = toIndex(e.clientX);
    setDrag({ a: i, b: i });
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!interactive) return;
    const i = toIndex(e.clientX);
    setHover(i);
    if (drag) setDrag({ ...drag, b: i });
  };
  const onUp = () => {
    if (!interactive) return;
    if (drag) {
      const a = Math.min(drag.a, drag.b);
      const b = Math.max(drag.a, drag.b);
      if (b - a >= 2) setDomain([start + a, start + b]);
      setDrag(null);
    }
  };
  const onLeave = () => {
    setHover(null);
    setDrag(null);
  };

  // Tooltip geometry
  const showTip = interactive && hover != null && !drag;
  const hv = showTip ? visible[hover] : null;
  const hx = showTip ? x(hover) : 0;
  const hy = hv ? y(hv.value) : 0;
  const tipW = 104;
  const tipH = 40;
  const tipX = Math.max(plotL, Math.min(plotR - tipW, hx - tipW / 2));
  const tipAbove = hy > plotTop + tipH + 8;
  const tipY = tipAbove ? hy - tipH - 10 : hy + 10;

  // Live selection band while dragging
  const sel =
    drag && Math.abs(drag.a - drag.b) >= 1
      ? { x1: x(Math.min(drag.a, drag.b)), x2: x(Math.max(drag.a, drag.b)) }
      : null;

  return (
    <div className="relative">
      {interactive && zoomed && (
        <button
          className="no-print absolute right-1 top-1 z-10 rounded-full border border-hair bg-paper/90 px-3 py-1 text-xs text-muted shadow-soft hover:text-ink"
          onClick={() => {
            setDomain([0, data.length - 1]);
            setHover(null);
          }}
        >
          Reset zoom
        </button>
      )}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full select-none"
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
        {yTicks.map((t, i) => (
          <g key={`y-${i}`}>
            <line
              x1={plotL}
              x2={plotR}
              y1={y(t)}
              y2={y(t)}
              stroke="#ece8dd"
              strokeWidth={1}
            />
            <text x={8} y={y(t) + 4} fontSize={11} fill="#908b7e">
              {Math.round(t)}
            </text>
          </g>
        ))}

        {/* x-axis timeline */}
        <line
          x1={plotL}
          x2={plotR}
          y1={plotBottom}
          y2={plotBottom}
          stroke="#ece8dd"
          strokeWidth={1}
        />
        {xTicks.map((t, i) => (
          <g key={`x-${i}`}>
            <line
              x1={x(t.i)}
              x2={x(t.i)}
              y1={plotBottom}
              y2={plotBottom + 4}
              stroke="#bbb4a4"
              strokeWidth={1}
            />
            <text
              x={x(t.i)}
              y={plotBottom + 18}
              fontSize={11}
              fill="#908b7e"
              textAnchor={t.anchor}
            >
              {t.label}
            </text>
          </g>
        ))}

        {/* your normal band */}
        {band && (
          <>
            <rect
              x={plotL}
              y={band.top}
              width={plotW}
              height={Math.max(0, band.bottom - band.top)}
              fill="#bbb4a4"
              opacity={0.18}
            />
            <line
              x1={plotL}
              x2={plotR}
              y1={band.mid}
              y2={band.mid}
              stroke="#bbb4a4"
              strokeDasharray="4 5"
              strokeWidth={1}
              opacity={0.7}
            />
            <text
              x={plotR}
              y={band.top - 4}
              fontSize={11}
              fill="#908b7e"
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

        {/* drag-to-zoom selection */}
        {sel && (
          <rect
            x={sel.x1}
            y={plotTop}
            width={Math.max(0, sel.x2 - sel.x1)}
            height={plotH}
            fill={color}
            opacity={0.12}
          />
        )}

        {/* last point (hidden while hovering to avoid double dots) */}
        {!showTip && (
          <>
            <circle
              cx={x(visible.length - 1)}
              cy={y(values[values.length - 1])}
              r={4}
              fill={color}
            />
            <text
              x={x(visible.length - 1)}
              y={y(values[values.length - 1]) - 10}
              fontSize={12}
              fill="#23211d"
              textAnchor="end"
              fontWeight={600}
            >
              {values[values.length - 1]}
              {unit}
            </text>
          </>
        )}

        {/* hover crosshair + tooltip */}
        {showTip && hv && (
          <g>
            <line
              x1={hx}
              x2={hx}
              y1={plotTop}
              y2={plotBottom}
              stroke="#bbb4a4"
              strokeWidth={1}
            />
            <circle cx={hx} cy={hy} r={4.5} fill={color} stroke="#ffffff" strokeWidth={1.5} />
            <g>
              <rect
                x={tipX}
                y={tipY}
                width={tipW}
                height={tipH}
                rx={8}
                fill="#23211d"
                opacity={0.92}
              />
              <text x={tipX + 10} y={tipY + 16} fontSize={11} fill="#bbb4a4">
                {fmtLong(hv.date)}
              </text>
              <text
                x={tipX + 10}
                y={tipY + 32}
                fontSize={14}
                fontWeight={600}
                fill="#ffffff"
              >
                {hv.value}
                {unit}
              </text>
            </g>
          </g>
        )}

        {/* transparent capture layer for hover + drag-zoom */}
        {interactive && (
          <rect
            x={plotL}
            y={plotTop}
            width={plotW}
            height={plotH}
            fill="transparent"
            style={{ cursor: drag ? "col-resize" : "crosshair", touchAction: "none" }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerLeave={onLeave}
          />
        )}
      </svg>
    </div>
  );
}
