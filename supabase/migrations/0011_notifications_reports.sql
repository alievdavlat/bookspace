-- Phase 5: notifications + reports (moderation).
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade, -- recipient
  actor_id uuid references public.profiles(id) on delete cascade,
  type text not null,            -- follow | comment | reply | review
  target_type text,
  target_id uuid,
  href text,
  body text,
  read boolean not null default false,
  created_at timestamptz default now()
);
alter table public.notifications enable row level security;
drop policy if exists notifications_own_read on public.notifications;
create policy notifications_own_read on public.notifications for select using (auth.uid() = user_id);
drop policy if exists notifications_own_upd on public.notifications;
create policy notifications_own_upd on public.notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists notifications_insert on public.notifications;
create policy notifications_insert on public.notifications for insert with check (auth.uid() = actor_id);
create index if not exists notifications_user_read_idx on public.notifications(user_id, read);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  reason text,
  status text not null default 'open' check (status in ('open','resolved','dismissed')),
  created_at timestamptz default now()
);
alter table public.reports enable row level security;
drop policy if exists reports_insert on public.reports;
create policy reports_insert on public.reports for insert with check (auth.uid() = reporter_id);
drop policy if exists reports_admin_read on public.reports;
create policy reports_admin_read on public.reports for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
drop policy if exists reports_admin_upd on public.reports;
create policy reports_admin_upd on public.reports for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')) with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
