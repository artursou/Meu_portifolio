begin;

-- Only trusted database operators manage this allowlist.
create schema if not exists portfolio_private;
revoke all on schema portfolio_private from public, anon, authenticated;
create table if not exists portfolio_private.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table portfolio_private.admins enable row level security;
revoke all on portfolio_private.admins from public, anon, authenticated;

create or replace function public.is_portfolio_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from portfolio_private.admins where user_id = (select auth.uid())
  );
$$;
revoke all on function public.is_portfolio_admin() from public, anon;
grant execute on function public.is_portfolio_admin() to authenticated;

-- Restrictive policies also constrain existing permissive policies.
-- No existing policy or portfolio data is removed.
do $$
declare target text;
begin
  foreach target in array array['projects', 'technologies', 'project_technologies'] loop
    execute format('alter table public.%I enable row level security', target);
    execute format('revoke insert, update, delete, truncate, references, trigger on public.%I from public, anon', target);
    execute format('revoke truncate, references, trigger on public.%I from authenticated', target);
    execute format('grant select on public.%I to anon, authenticated', target);
    execute format('grant insert, update, delete on public.%I to authenticated', target);
    execute format('create policy portfolio_public_read on public.%I for select to anon, authenticated using (true)', target);
    execute format('create policy portfolio_admin_allow on public.%I for all to authenticated using ((select public.is_portfolio_admin())) with check ((select public.is_portfolio_admin()))', target);
    execute format('create policy portfolio_admin_insert on public.%I as restrictive for insert to authenticated with check ((select public.is_portfolio_admin()))', target);
    execute format('create policy portfolio_admin_update on public.%I as restrictive for update to authenticated using ((select public.is_portfolio_admin())) with check ((select public.is_portfolio_admin()))', target);
    execute format('create policy portfolio_admin_delete on public.%I as restrictive for delete to authenticated using ((select public.is_portfolio_admin()))', target);
  end loop;
end $$;
commit;
