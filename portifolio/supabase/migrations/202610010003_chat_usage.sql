begin;

-- One row per chat reply: when, how many Gemini tokens, how long and the outcome.
-- Message text is never stored.
create table if not exists public.chat_usage (
  id bigint generated always as identity primary key,
  used_at timestamptz not null default now(),
  status text not null check (status in ('ok', 'error', 'aborted')),
  finish_reason text check (char_length(finish_reason) <= 32),
  input_tokens integer check (input_tokens >= 0),
  output_tokens integer check (output_tokens >= 0),
  reasoning_tokens integer check (reasoning_tokens >= 0),
  total_tokens integer check (total_tokens >= 0),
  duration_ms integer check (duration_ms >= 0),
  message_count smallint check (message_count >= 0)
);
create index if not exists chat_usage_used_at_idx on public.chat_usage (used_at desc);

-- Only the administrator reads; nobody writes through the public API.
alter table public.chat_usage enable row level security;
revoke all on public.chat_usage from public, anon, authenticated;
grant select on public.chat_usage to authenticated;
drop policy if exists chat_usage_admin_read on public.chat_usage;
create policy chat_usage_admin_read on public.chat_usage
  for select to authenticated using ((select public.is_portfolio_admin()));

-- The server (service_role) records usage through this function only.
grant insert on public.chat_usage to service_role;
create or replace function public.record_chat_usage(
  p_status text,
  p_finish_reason text default null,
  p_input_tokens integer default null,
  p_output_tokens integer default null,
  p_reasoning_tokens integer default null,
  p_total_tokens integer default null,
  p_duration_ms integer default null,
  p_message_count integer default null
)
returns void
language sql security invoker
set search_path = ''
as $$
  insert into public.chat_usage (status, finish_reason, input_tokens, output_tokens,
    reasoning_tokens, total_tokens, duration_ms, message_count)
  values (p_status, p_finish_reason, p_input_tokens, p_output_tokens,
    p_reasoning_tokens, p_total_tokens, p_duration_ms, p_message_count::smallint);
$$;
revoke all on function public.record_chat_usage(text, text, integer, integer, integer, integer, integer, integer)
  from public, anon, authenticated;
grant execute on function public.record_chat_usage(text, text, integer, integer, integer, integer, integer, integer)
  to service_role;

-- Replies and tokens per day in the site's time zone (Palmas, UTC-3), empty days as 0.
-- SECURITY INVOKER: RLS still applies, so non-administrators only see zeros.
create or replace function public.chat_usage_daily(p_days integer default 30)
returns table (day date, replies bigint, total_tokens bigint)
language sql stable security invoker
set search_path = ''
as $$
  with bounds as (
    select (now() at time zone 'America/Araguaina')::date as today,
           least(greatest(coalesce(p_days, 30), 1), 366) as n
  ), days as (
    select (b.today - g)::date as day
    from bounds b, generate_series(0, b.n - 1) g
  )
  select d.day, count(u.id) as replies, coalesce(sum(u.total_tokens), 0)::bigint as total_tokens
  from days d
  left join public.chat_usage u
    on u.used_at >= (d.day::timestamp at time zone 'America/Araguaina')
   and u.used_at < ((d.day + 1)::timestamp at time zone 'America/Araguaina')
  group by d.day
  order by d.day;
$$;
revoke all on function public.chat_usage_daily(integer) from public, anon;
grant execute on function public.chat_usage_daily(integer) to authenticated;

-- All-time totals (records are kept indefinitely). Also subject to RLS.
create or replace function public.chat_usage_totals()
returns table (replies bigint, total_tokens bigint)
language sql stable security invoker
set search_path = ''
as $$
  select count(*), coalesce(sum(total_tokens), 0)::bigint from public.chat_usage;
$$;
revoke all on function public.chat_usage_totals() from public, anon;
grant execute on function public.chat_usage_totals() to authenticated;

commit;
