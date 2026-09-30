"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SITE_TIME_ZONE, SITE_UTC_OFFSET, siteDayRange } from "@/lib/siteTime";
import { ActionButton } from "../adminPage/styles";
import { Panel, Toolbar, Tiles, Tile, Card, Hint, ChartArea, Tooltip, Table, Pager } from "./styles";

type DailyVisits = { day: string; visits: number };
type VisitRow = { id: number; visited_at: string };

const DAYS = 30;
const PAGE_SIZE = 25;
const CHART_HEIGHT = 240;
const MARGIN = { top: 16, right: 8, bottom: 28, left: 36 };
const BAR_COLOR = "#5A8CFF";

const dayDate = (day: string) => new Date(`${day}T12:00:00${SITE_UTC_OFFSET}`);
const fmtShort = new Intl.DateTimeFormat("pt-BR", { timeZone: SITE_TIME_ZONE, day: "2-digit", month: "2-digit" });
const fmtWeekday = new Intl.DateTimeFormat("pt-BR", { timeZone: SITE_TIME_ZONE, weekday: "short" });
const fmtDate = new Intl.DateTimeFormat("pt-BR", { timeZone: SITE_TIME_ZONE, dateStyle: "short" });
const fmtTime = new Intl.DateTimeFormat("pt-BR", { timeZone: SITE_TIME_ZONE, timeStyle: "medium" });
const plural = (n: number) => (n === 1 ? "1 visitante" : `${n} visitantes`);

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

function VisitsChart({ data, selectedDay, onSelect }: {
  data: DailyVisits[];
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
  const ticks = yTicks(Math.max(0, ...data.map((d) => d.visits)));
  const yMax = ticks[ticks.length - 1];
  const band = data.length ? plotW / data.length : 0;
  const barW = Math.max(2, band - 2); // 2px de espaço entre barras
  const labelEvery = Math.max(1, Math.ceil(data.length / Math.max(1, Math.floor(plotW / 48))));
  const y = (v: number) => MARGIN.top + plotH - (v / yMax) * plotH;
  const hovered = hover !== null ? data[hover] : null;
  const total = data.reduce((sum, d) => sum + d.visits, 0);

  return (
    <ChartArea ref={areaRef} onMouseLeave={() => setHover(null)}>
      {width > 0 && (
        <svg width={width} height={CHART_HEIGHT} role="img"
          aria-label={`Visitantes por dia nos últimos ${data.length} dias: ${total} no total`}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={MARGIN.left} x2={width - MARGIN.right} y1={y(t)} y2={y(t)}
                stroke={t === 0 ? "#555" : "#262626"} strokeWidth={1} />
              <text x={MARGIN.left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize={11} fill="#888">{t}</text>
            </g>
          ))}

          {data.map((d, i) => {
            const x = MARGIN.left + i * band;
            const h = y(0) - y(d.visits);
            const dimmed = selectedDay !== null && selectedDay !== d.day;
            const label = `${fmtWeekday.format(dayDate(d.day))}, ${fmtShort.format(dayDate(d.day))}: ${plural(d.visits)}`;
            return (
              <g key={d.day} className="bar-hit" tabIndex={0} role="button" aria-label={label}
                aria-pressed={selectedDay === d.day}
                onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}
                onClick={() => onSelect(d.day)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(d.day); } }}>
                {/* Área de clique maior que a barra: a coluna inteira */}
                <rect className="hit" x={x} y={MARGIN.top} width={band} height={plotH}
                  fill={hover === i ? "rgba(255,255,255,0.05)" : "transparent"} />
                {d.visits > 0 && (
                  <path d={barPath(x + (band - barW) / 2, y(d.visits), barW, h)} fill={BAR_COLOR}
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
        <Tooltip style={{ left: MARGIN.left + (hover + 0.5) * band, top: y(hovered.visits) }}>
          <strong>{plural(hovered.visits)}</strong>
          <small>{fmtWeekday.format(dayDate(hovered.day))}, {fmtDate.format(dayDate(hovered.day))}</small>
        </Tooltip>
      )}
    </ChartArea>
  );
}

export function VisitsPanel({ onError }: { onError: (message: string) => void }) {
  const [daily, setDaily] = useState<DailyVisits[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [rows, setRows] = useState<VisitRow[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [page, setPage] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadSummary = useCallback(async () => {
    const [dailyResult, totalResult] = await Promise.all([
      supabase.rpc("site_visits_daily", { p_days: DAYS }),
      supabase.from("site_visits").select("id", { count: "exact", head: true }),
    ]);
    if (dailyResult.error) return onError(`Erro ao carregar o gráfico de visitas: ${dailyResult.error.message}`);
    if (totalResult.error) return onError(`Erro ao carregar o total de visitas: ${totalResult.error.message}`);
    setDaily((dailyResult.data as DailyVisits[]).map((d) => ({ day: d.day, visits: Number(d.visits) })));
    setTotal(totalResult.count ?? 0);
  }, [onError]);

  const loadLog = useCallback(async (pageIndex: number, day: string | null) => {
    setLoading(true);
    let query = supabase
      .from("site_visits")
      .select("id, visited_at", { count: "exact" })
      .order("visited_at", { ascending: false })
      .range(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE - 1);
    if (day) {
      const { start, end } = siteDayRange(day);
      query = query.gte("visited_at", start).lt("visited_at", end);
    }
    const { data, error, count } = await query;
    setLoading(false);
    if (error) return onError(`Erro ao carregar o log de visitas: ${error.message}`);
    setRows(data ?? []);
    setRowCount(count ?? 0);
  }, [onError]);

  useEffect(() => {
    // Busca inicial do painel (o setState acontece depois da resposta do banco)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadLog(page, selectedDay);
  }, [loadLog, page, selectedDay]);

  const refresh = () => {
    void loadSummary();
    void loadLog(page, selectedDay);
  };

  const selectDay = (day: string) => {
    setPage(0);
    setSelectedDay((current) => (current === day ? null : day));
  };

  const sumLast = (n: number) => daily.slice(-n).reduce((sum, d) => sum + d.visits, 0);
  const pages = Math.max(1, Math.ceil(rowCount / PAGE_SIZE));

  return (
    <Panel>
      <Toolbar>
        <div>
          <h2>Visitas ao site</h2>
          <p>Cada visitante conta uma vez por dia. Horários no fuso de Palmas (UTC-3).</p>
        </div>
        <ActionButton onClick={refresh}>🔄 Atualizar</ActionButton>
      </Toolbar>

      <Tiles>
        <Tile><span>Hoje</span><strong>{daily.length ? sumLast(1) : "–"}</strong></Tile>
        <Tile><span>Últimos 7 dias</span><strong>{daily.length ? sumLast(7) : "–"}</strong></Tile>
        <Tile><span>Últimos 30 dias</span><strong>{daily.length ? sumLast(30) : "–"}</strong></Tile>
        <Tile><span>Total desde o início</span><strong>{total ?? "–"}</strong></Tile>
      </Tiles>

      <Card>
        <h3>Visitantes por dia</h3>
        <Hint>Últimos {DAYS} dias. Clique em uma barra para ver as visitas daquele dia no log.</Hint>
        <VisitsChart data={daily} selectedDay={selectedDay} onSelect={selectDay} />
      </Card>

      <Card>
        <Toolbar>
          <div>
            <h3>Log de visitas</h3>
            <Hint style={{ margin: 0 }}>
              {selectedDay ? `Visitas em ${fmtDate.format(dayDate(selectedDay))}` : "Todas as visitas, da mais recente"}
              {` · ${rowCount} ${rowCount === 1 ? "registro" : "registros"}`}
            </Hint>
          </div>
          {selectedDay && (
            <ActionButton onClick={() => { setPage(0); setSelectedDay(null); }}>Limpar filtro</ActionButton>
          )}
        </Toolbar>

        <Table style={{ marginTop: 12 }}>
          <thead>
            <tr><th>Data</th><th>Dia da semana</th><th>Horário</th></tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const date = new Date(row.visited_at);
              return (
                <tr key={row.id}>
                  <td>{fmtDate.format(date)}</td>
                  <td>{fmtWeekday.format(date)}</td>
                  <td>{fmtTime.format(date)}</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={3} style={{ color: "#888" }}>{loading ? "Carregando..." : "Nenhuma visita registrada."}</td></tr>
            )}
          </tbody>
        </Table>

        <Pager>
          <ActionButton disabled={page === 0 || loading} onClick={() => setPage((p) => p - 1)}>← Mais recentes</ActionButton>
          <span>Página {page + 1} de {pages}</span>
          <ActionButton disabled={page + 1 >= pages || loading} onClick={() => setPage((p) => p + 1)}>Mais antigas →</ActionButton>
        </Pager>
      </Card>
    </Panel>
  );
}
