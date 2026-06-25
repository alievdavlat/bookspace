-- Phase 3: admins can read all reading progress (for dashboard analytics).
drop policy if exists progress_admin_read on public.reading_progress;
create policy progress_admin_read on public.reading_progress for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
