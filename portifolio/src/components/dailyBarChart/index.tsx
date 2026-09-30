"use client";

import { useEffect, useRef, useState } from "react";
import { SITE_TIME_ZONE, SITE_UTC_OFFSET } from "@/lib/siteTime";
import { ChartArea, Tooltip } from "./styles";

export type DailyPoint = { day: string; value: number; detail?: string };

const CHART_HEIGHT = 240;
const MARGIN = { top: 16, right: 8, bottom: 28, left: 44 };
const BAR_COLOR = "#5A8CFF";

// Formatadores no fuso do site, compartilhados pelos painéis do admin
export const dayDate = (day: string) => new Date(`${day}T12:00:00${SITE_UTC_OFFSET}`);
export const fmtShort = new Intl.DateTimeFormat("pt-BR", { timeZone: SITE_TIME_ZONE, day: "2-digit", month: "2-digit" });
export const fmtWeekday = new Intl.DateTimeFormat("pt-BR", { timeZone: SITE_TIME_ZONE, weekday: "short" });
export const fmtDate = new Intl.DateTimeFormat("pt-BR", { timeZone: SITE_TIME_ZONE, dateStyle: "short" });
export const fmtTime = new Intl.DateTimeFormat("pt-BR", { timeZone: SITE_TIME_ZONE, timeStyle: "medium" });
export const fmtNumber = new Intl.NumberFormat("pt-BR");
const fmtCompact = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 });

// Escala do eixo Y com passos inteiros "redondos" (1, 2, 5, 10, 20, 50...)
function yTicks(max: number): number[] {
  const rough = Math.max(1, max) / 4;
  const pow = 10 ** Math.floor(Math.log10(rough));
  const step = Math.max(1, [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= rough) ?? 10 * pow);
  const top = Math.max(step, Math.ceil(max / step) * step);
  const ticks: number[] = [];
  for (let v = 0; v <= top; v += step) ticks.push(v);
  return ticks;
}

// Barra com cantos arredondados só no topo, apoiada na linha de base
function barPath(x: number, y: number, w: number, h: number) {
  const r = Math.min(4, w / 2, h);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

export function DailyBarChart({ data, valueLabel, ariaLabel, selectedDay, onSelect }: {
  data: DailyPoint[];
  valueLabel: (value: number) => string;
  ariaLabel: string;
  selectedDay: string | null;
  onSelect: (day: string) => void;
}) {
  const areaRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const plotW = Math.max(0, width - MARGIN.left - MARGIN.right);
  const plotH = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;
  const ticks = yTicks(Math.max(0, ...data.map((d) => d.value)));
  const yMax = ticks[ticks.length - 1];
  const band = data.length ? plotW / data.length : 0;
  const barW = Math.max(2, band - 2); // 2px de espaço entre barras
  const labelEvery = Math.max(1, Math.ceil(data.length / Math.max(1, Math.floor(plotW / 48))));
  const y = (v: number) => MARGIN.top + plotH - (v / yMax) * plotH;
  const hovered = hover !== null ? data[hover] : null;

  return (
    <ChartArea ref={areaRef} onMouseLeave={() => setHover(null)}>
      {width > 0 && (
        <svg width={width} height={CHART_HEIGHT} role="img" aria-label={ariaLabel}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={MARGIN.left} x2={width - MARGIN.right} y1={y(t)} y2={y(t)}
                stroke={t === 0 ? "#555" : "#262626"} strokeWidth={1} />
              <text x={MARGIN.left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize={11} fill="#888">
                {fmtCompact.format(t)}
              </text>
            </g>
          ))}

          {data.map((d, i) => {
            const x = MARGIN.left + i * band;
            const h = y(0) - y(d.value);
            const dimmed = selectedDay !== null && selectedDay !== d.day;
            const label = `${fmtWeekday.format(dayDate(d.day))}, ${fmtShort.format(dayDate(d.day))}: ${valueLabel(d.value)}`;
            return (
              <g key={d.day} className="bar-hit" tabIndex={0} role="button" aria-label={label}
                aria-pressed={selectedDay === d.day}
                onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}
                onClick={() => onSelect(d.day)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(d.day); } }}>
                {/* Área de clique maior que a barra: a coluna inteira */}
                <rect className="hit" x={x} y={MARGIN.top} width={band} height={plotH}
                  fill={hover === i ? "rgba(255,255,255,0.05)" : "transparent"} />
                {d.value > 0 && (
                  <path d={barPath(x + (band - barW) / 2, y(d.value), barW, h)} fill={BAR_COLOR}
                    opacity={dimmed ? 0.35 : 1} />
                )}
                {/* O último dia sempre tem rótulo; os vizinhos colados a ele são omitidos */}
                {(i === data.length - 1 || (i % labelEvery === 0 && (data.length - 1 - i) * band >= 40)) && (
                  <text x={x + band / 2} y={CHART_HEIGHT - 8} textAnchor="middle" fontSize={11} fill="#888">
                    {fmtShort.format(dayDate(d.day))}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}

      {hovered && hover !== null && (
        <Tooltip style={{ left: MARGIN.left + (hover + 0.5) * band, top: y(hovered.value) }}>
          <strong>{valueLabel(hovered.value)}</strong>
          {hovered.detail && <small>{hovered.detail}</small>}
          <small>{fmtWeekday.format(dayDate(hovered.day))}, {fmtDate.format(dayDate(hovered.day))}</small>
        </Tooltip>
      )}
    </ChartArea>
  );
}
