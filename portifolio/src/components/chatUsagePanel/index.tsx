"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { siteDayRange } from "@/lib/siteTime";
import { ActionButton } from "../adminPage/styles";
import { DailyBarChart, dayDate, fmtDate, fmtNumber, fmtTime } from "../dailyBarChart";
import { Panel, Toolbar, Tiles, Tile, Card, Hint, Table, Pager } from "../visitsPanel/styles";

type DailyUsage = { day: string; replies: number; total_tokens: number };
type UsageRow = {
  id: number;
  used_at: string;
  status: "ok" | "error" | "aborted";
  input_tokens: number | null;
  output_tokens: number | null;
  reasoning_tokens: number | null;
  total_tokens: number | null;
  duration_ms: number | null;
};

const DAYS = 30;
const PAGE_SIZE = 25;
const STATUS_LABEL = { ok: "✓ Respondido", error: "✕ Erro", aborted: "■ Interrompido" } as const;
const STATUS_COLOR = { ok: "#ddd", error: "#f87171", aborted: "#aaa" } as const;

const tokens = (n: number) => (n === 1 ? "1 token" : `${fmtNumber.format(n)} tokens`);
const replies = (n: number) => (n === 1 ? "1 resposta" : `${fmtNumber.format(n)} respostas`);
const cell = (n: number | null) => (n === null ? "–" : fmtNumber.format(n));
// A saída do Gemini inclui o raciocínio; a coluna "Resposta" mostra só o texto
const textTokens = (row: UsageRow) =>
  row.output_tokens === null ? null : Math.max(0, row.output_tokens - (row.reasoning_tokens ?? 0));

export function ChatUsagePanel({ onError }: { onError: (message: string) => void }) {
  const [daily, setDaily] = useState<DailyUsage[]>([]);
  const [totals, setTotals] = useState<{ replies: number; tokens: number } | null>(null);
  const [rows, setRows] = useState<UsageRow[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [page, setPage] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadSummary = useCallback(async () => {
    const [dailyResult, totalsResult] = await Promise.all([
      supabase.rpc("chat_usage_daily", { p_days: DAYS }),
      supabase.rpc("chat_usage_totals"),
    ]);
    const error = dailyResult.error ?? totalsResult.error;
    if (error) return onError(`Erro ao carregar o uso do chat: ${error.message}`);
    setDaily((dailyResult.data as DailyUsage[]).map((d) => ({
      day: d.day, replies: Number(d.replies), total_tokens: Number(d.total_tokens),
    })));
    const [all] = (totalsResult.data ?? []) as { replies: number; total_tokens: number }[];
    setTotals({ replies: Number(all?.replies ?? 0), tokens: Number(all?.total_tokens ?? 0) });
  }, [onError]);

  const loadLog = useCallback(async (pageIndex: number, day: string | null) => {
    setLoading(true);
    let query = supabase
      .from("chat_usage")
      .select("id, used_at, status, input_tokens, output_tokens, reasoning_tokens, total_tokens, duration_ms", { count: "exact" })
      .order("used_at", { ascending: false })
      .range(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE - 1);
    if (day) {
      const { start, end } = siteDayRange(day);
      query = query.gte("used_at", start).lt("used_at", end);
    }
    const { data, error, count } = await query;
    setLoading(false);
    if (error) return onError(`Erro ao carregar o log do chat: ${error.message}`);
    setRows((data ?? []) as UsageRow[]);
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

  const today = daily.at(-1);
  const tokens30 = daily.reduce((sum, d) => sum + d.total_tokens, 0);
  const pages = Math.max(1, Math.ceil(rowCount / PAGE_SIZE));

  return (
    <Panel>
      <Toolbar>
        <div>
          <h2>Uso do chat (Gemini)</h2>
          <p>Uma linha por resposta da IA. O texto das conversas não é salvo. Horários no fuso de Palmas (UTC-3).</p>
        </div>
        <ActionButton onClick={refresh}>🔄 Atualizar</ActionButton>
      </Toolbar>

      <Tiles>
        <Tile><span>Respostas hoje</span><strong>{today ? fmtNumber.format(today.replies) : "–"}</strong></Tile>
        <Tile><span>Tokens hoje</span><strong>{today ? fmtNumber.format(today.total_tokens) : "–"}</strong></Tile>
        <Tile><span>Tokens em 30 dias</span><strong>{daily.length ? fmtNumber.format(tokens30) : "–"}</strong></Tile>
        <Tile>
          <span>Total desde o início</span>
          <strong>{totals ? fmtNumber.format(totals.tokens) : "–"}</strong>
          {totals && <span style={{ marginTop: 4 }}>{replies(totals.replies)}</span>}
        </Tile>
      </Tiles>

      <Card>
        <h3>Tokens por dia</h3>
        <Hint>Últimos {DAYS} dias (entrada + saída). Clique em uma barra para ver as respostas daquele dia no log.</Hint>
        <DailyBarChart
          data={daily.map((d) => ({ day: d.day, value: d.total_tokens, detail: replies(d.replies) }))}
          valueLabel={tokens}
          ariaLabel={`Tokens do chat por dia nos últimos ${daily.length} dias: ${fmtNumber.format(tokens30)} no total`}
          selectedDay={selectedDay}
          onSelect={selectDay}
        />
      </Card>

      <Card>
        <Toolbar>
          <div>
            <h3>Log do chat</h3>
            <Hint style={{ margin: 0 }}>
              {selectedDay ? `Respostas em ${fmtDate.format(dayDate(selectedDay))}` : "Todas as respostas, da mais recente"}
              {` · ${rowCount} ${rowCount === 1 ? "registro" : "registros"}`}
            </Hint>
          </div>
          {selectedDay && (
            <ActionButton onClick={() => { setPage(0); setSelectedDay(null); }}>Limpar filtro</ActionButton>
          )}
        </Toolbar>

        <div style={{ overflowX: "auto", marginTop: 12 }}>
          <Table>
            <thead>
              <tr>
                <th>Data</th><th>Horário</th><th>Entrada</th><th>Resposta</th>
                <th>Raciocínio</th><th>Total</th><th>Duração</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const date = new Date(row.used_at);
                return (
                  <tr key={row.id}>
                    <td>{fmtDate.format(date)}</td>
                    <td>{fmtTime.format(date)}</td>
                    <td>{cell(row.input_tokens)}</td>
                    <td>{cell(textTokens(row))}</td>
                    <td>{cell(row.reasoning_tokens)}</td>
                    <td><strong>{cell(row.total_tokens)}</strong></td>
                    <td>{row.duration_ms === null ? "–" : `${(row.duration_ms / 1000).toFixed(1).replace(".", ",")} s`}</td>
                    <td style={{ color: STATUS_COLOR[row.status] }}>{STATUS_LABEL[row.status]}</td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr><td colSpan={8} style={{ color: "#888" }}>{loading ? "Carregando..." : "Nenhum uso registrado."}</td></tr>
              )}
            </tbody>
          </Table>
        </div>

        <Pager>
          <ActionButton disabled={page === 0 || loading} onClick={() => setPage((p) => p - 1)}>← Mais recentes</ActionButton>
          <span>Página {page + 1} de {pages}</span>
          <ActionButton disabled={page + 1 >= pages || loading} onClick={() => setPage((p) => p + 1)}>Mais antigas →</ActionButton>
        </Pager>
      </Card>
    </Panel>
  );
}
