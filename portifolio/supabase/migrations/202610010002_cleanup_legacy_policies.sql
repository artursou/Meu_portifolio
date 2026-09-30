begin;

-- Legacy policies created before the admin allowlist. The first one allowed any
-- signed-in user to write; restrictive policies already neutralized it, and
-- the others duplicate portfolio_public_read. Access is unchanged after removal.
drop policy if exists "Policy with security definer functions" on public.projects;
drop policy if exists "Policy with security definer functions" on public.technologies;
drop policy if exists "Policy with security definer functions" on public.project_technologies;
drop policy if exists "search" on public.projects;
drop policy if exists "Search_tecs2" on public.technologies;
drop policy if exists "Search_tecs" on public.project_technologies;

-- Pin the trigger function's search_path (Supabase advisor: mutable search_path).
do $$
begin
  if to_regprocedure('public.update_updated_at_column()') is not null then
    alter function public.update_updated_at_column() set search_path = '';
  end if;
end $$;

commit;
