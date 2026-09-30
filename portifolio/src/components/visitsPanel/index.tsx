"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { siteDayRange } from "@/lib/siteTime";
import { ActionButton } from "../adminPage/styles";
import { DailyBarChart, dayDate, fmtDate, fmtTime, fmtWeekday } from "../dailyBarChart";
import { Panel, Toolbar, Tiles, Tile, Card, Hint, Table, Pager } from "./styles";

type DailyVisits = { day: string; visits: number };
type VisitRow = { id: number; visited_at: string };

const DAYS = 30;
const PAGE_SIZE = 25;

const plural = (n: number) => (n === 1 ? "1 visitante" : `${n} visitantes`);

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
        <DailyBarChart
          data={daily.map((d) => ({ day: d.day, value: d.visits }))}
          valueLabel={plural}
          ariaLabel={`Visitantes por dia nos últimos ${daily.length} dias: ${sumLast(DAYS)} no total`}
          selectedDay={selectedDay}
          onSelect={selectDay}
        />
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
