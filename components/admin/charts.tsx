'use client';

import { useEffect, useRef, useState } from 'react';

// Monochrome, single-series charts in plain SVG/HTML — no chart library.
// Ink: #000 marks, hairline #e5e5e5 grid, gray text. Every chart has a hover readout.

const GRID = '#e5e5e5';
const MUTED = '#9ca3af';

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

function niceMax(max: number) {
  if (max <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  const n = max / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

export interface Point { label: string; value: number }

function Tooltip({ x, y, width, title, value }: { x: number; y: number; width: number; title: string; value: string }) {
  const left = Math.min(Math.max(x, 60), width - 60);
  return (
    <div className="absolute pointer-events-none -translate-x-1/2 -translate-y-full bg-black text-white px-2.5 py-1.5 whitespace-nowrap" style={{ left, top: y - 10 }}>
      <p className="text-[9px] uppercase tracking-[0.15em] text-white/60">{title}</p>
      <p className="text-xs font-semibold">{value}</p>
    </div>
  );
}

const PAD = { top: 12, right: 8, bottom: 24, left: 44 };

function Axes({ width, height, max, format, labels }: { width: number; height: number; max: number; format: (n: number) => string; labels: { x: number; text: string }[] }) {
  const ticks = [0, 0.5, 1].map((t) => t * max);
  const plotH = height - PAD.top - PAD.bottom;
  return (
    <g>
      {ticks.map((t) => {
        const y = PAD.top + plotH - (t / max) * plotH;
        return (
          <g key={t}>
            <line x1={PAD.left} x2={width - PAD.right} y1={y} y2={y} stroke={GRID} strokeWidth={1} />
            <text x={PAD.left - 8} y={y + 3} textAnchor="end" fontSize={10} fill={MUTED} style={{ fontVariantNumeric: 'tabular-nums' }}>{format(t)}</text>
          </g>
        );
      })}
      {labels.map((l, i) => (
        // Edge labels anchor inward so they never clip at the chart sides
        <text key={l.text + l.x} x={l.x} y={height - 6} textAnchor={i === 0 ? 'start' : i === labels.length - 1 ? 'end' : 'middle'} fontSize={10} fill={MUTED}>{l.text}</text>
      ))}
    </g>
  );
}

function sparseLabels(points: Point[], xOf: (i: number) => number, count = 6) {
  if (!points.length) return [];
  const step = Math.max(1, Math.ceil(points.length / count));
  return points.map((p, i) => ({ i, p })).filter(({ i }) => i % step === 0 || i === points.length - 1)
    .filter(({ i }, idx, arr) => !(idx === arr.length - 2 && points.length - 1 - i < step / 2))
    .map(({ i, p }) => ({ x: xOf(i), text: p.label }));
}

export function TrendChart({ data, format, height = 220, ariaLabel }: { data: Point[]; format: (n: number) => string; height?: number; ariaLabel: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.value), 0));
  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = height - PAD.top - PAD.bottom;
  const xOf = (i: number) => PAD.left + (data.length > 1 ? (i / (data.length - 1)) * plotW : plotW / 2);
  const yOf = (v: number) => PAD.top + plotH - (v / max) * plotH;
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${xOf(i)},${yOf(d.value)}`).join(' ');
  const area = data.length ? `${line} L${xOf(data.length - 1)},${PAD.top + plotH} L${xOf(0)},${PAD.top + plotH} Z` : '';

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const x = e.clientX - e.currentTarget.getBoundingClientRect().left;
    const i = Math.round(((x - PAD.left) / plotW) * (data.length - 1));
    setHover(Math.min(Math.max(i, 0), data.length - 1));
  };

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={ariaLabel} onMouseMove={onMove} onMouseLeave={() => setHover(null)} className="block">
          <Axes width={width} height={height} max={max} format={format} labels={sparseLabels(data, xOf, Math.max(2, Math.floor(width / 110)))} />
          <path d={area} fill="#000" fillOpacity={0.06} />
          <path d={line} fill="none" stroke="#000" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {hover !== null && data[hover] && (
            <g>
              <line x1={xOf(hover)} x2={xOf(hover)} y1={PAD.top} y2={PAD.top + plotH} stroke="#000" strokeOpacity={0.25} strokeWidth={1} />
              <circle cx={xOf(hover)} cy={yOf(data[hover].value)} r={6} fill="#fff" />
              <circle cx={xOf(hover)} cy={yOf(data[hover].value)} r={4} fill="#000" />
            </g>
          )}
        </svg>
      )}
      {hover !== null && data[hover] && (
        <Tooltip x={xOf(hover)} y={yOf(data[hover].value)} width={width} title={data[hover].label} value={format(data[hover].value)} />
      )}
    </div>
  );
}

export function ColumnChart({ data, format, height = 200, ariaLabel }: { data: Point[]; format: (n: number) => string; height?: number; ariaLabel: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.value), 0));
  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = height - PAD.top - PAD.bottom;
  const band = data.length ? plotW / data.length : 0;
  const barW = Math.max(2, Math.min(24, band - 2));
  const xOf = (i: number) => PAD.left + i * band + band / 2;
  const yOf = (v: number) => PAD.top + plotH - (v / max) * plotH;

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={ariaLabel} onMouseLeave={() => setHover(null)} className="block">
          <Axes width={width} height={height} max={max} format={format} labels={sparseLabels(data, xOf, Math.max(2, Math.floor(width / 110)))} />
          {data.map((d, i) => (
            <g key={d.label + i} onMouseEnter={() => setHover(i)}>
              {/* Hit target spans the full band, taller than the mark */}
              <rect x={PAD.left + i * band} y={PAD.top} width={band} height={plotH} fill="transparent" />
              <rect
                x={xOf(i) - barW / 2}
                y={yOf(d.value)}
                width={barW}
                height={Math.max(0, PAD.top + plotH - yOf(d.value))}
                fill="#000"
                fillOpacity={hover === null || hover === i ? 1 : 0.35}
              />
            </g>
          ))}
        </svg>
      )}
      {hover !== null && data[hover] && (
        <Tooltip x={xOf(hover)} y={yOf(data[hover].value)} width={width} title={data[hover].label} value={format(data[hover].value)} />
      )}
    </div>
  );
}

// Ranked horizontal bars rendered in HTML so long labels wrap cleanly
export function RankBars({ items, format, empty = 'No data for this period' }: {
  items: { label: string; value: number; sub?: string; href?: string }[]; format: (n: number) => string; empty?: string;
}) {
  const max = Math.max(...items.map((i) => i.value), 0) || 1;
  if (!items.length || items.every((i) => i.value === 0)) return <p className="text-xs text-gray-400 py-6 text-center">{empty}</p>;
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label} className="group" title={`${item.label}: ${format(item.value)}`}>
          <div className="flex items-baseline justify-between gap-3 mb-1.5">
            <span className="text-[11px] font-medium truncate">{item.label}{item.sub && <span className="text-gray-400 font-normal ml-2">{item.sub}</span>}</span>
            <span className="text-[11px] font-semibold tabular-nums shrink-0">{format(item.value)}</span>
          </div>
          <div className="h-2 bg-gray-100">
            <div className="h-2 bg-black group-hover:bg-gray-700 transition-colors" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Funnel({ steps }: { steps: { label: string; value: number }[] }) {
  const top = steps[0]?.value || 1;
  return (
    <div className="space-y-4">
      {steps.map((step, i) => {
        const prev = i > 0 ? steps[i - 1].value : null;
        return (
          <div key={step.label} title={`${step.label}: ${step.value.toLocaleString('en-IN')}`}>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-[11px] font-medium">{step.label}</span>
              <span className="text-[11px] tabular-nums">
                <span className="font-semibold">{step.value.toLocaleString('en-IN')}</span>
                {prev !== null && <span className="text-gray-400 ml-2">{prev > 0 ? ((step.value / prev) * 100).toFixed(1) : '0.0'}% of previous</span>}
              </span>
            </div>
            <div className="h-6 bg-gray-100">
              <div className="h-6 bg-black transition-all" style={{ width: `${Math.max(1, (step.value / top) * 100)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
