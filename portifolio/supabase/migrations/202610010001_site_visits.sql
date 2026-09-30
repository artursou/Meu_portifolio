begin;

-- One row per visitor per day. Only the timestamp is stored, kept indefinitely.
create table if not exists public.site_visits (
  id bigint generated always as identity primary key,
  visited_at timestamptz not null default now()
);
create index if not exists site_visits_visited_at_idx on public.site_visits (visited_at desc);

-- Only the administrator reads; nobody writes through the public API.
alter table public.site_visits enable row level security;
revoke all on public.site_visits from public, anon, authenticated;
grant select on public.site_visits to authenticated;
drop policy if exists site_visits_admin_read on public.site_visits;
create policy site_visits_admin_read on public.site_visits
  for select to authenticated using ((select public.is_portfolio_admin()));

-- The server (service_role) records visits through this function only.
grant insert on public.site_visits to service_role;
create or replace function public.record_site_visit()
returns void
language sql security invoker
set search_path = ''
as $$
  insert into public.site_visits default values;
$$;
revoke all on function public.record_site_visit() from public, anon, authenticated;
grant execute on function public.record_site_visit() to service_role;

-- Visits per day in the site's time zone (Palmas, UTC-3), days without visits as 0.
-- SECURITY INVOKER: RLS still applies, so non-administrators only see zeros.
create or replace function public.site_visits_daily(p_days integer default 30)
returns table (day date, visits bigint)
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
  select d.day, count(v.id) as visits
  from days d
  left join public.site_visits v
    on v.visited_at >= (d.day::timestamp at time zone 'America/Araguaina')
   and v.visited_at < ((d.day + 1)::timestamp at time zone 'America/Araguaina')
  group by d.day
  order by d.day;
$$;
revoke all on function public.site_visits_daily(integer) from public, anon;
grant execute on function public.site_visits_daily(integer) to authenticated;

commit;
