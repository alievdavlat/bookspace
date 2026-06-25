-- Phase 2: trending score view.
-- score = views + 3 * reads(last 30d) + 5 * total reviews, for public published books.
create or replace view public.book_trending as
select
  b.*,
  (
    coalesce(b.views, 0)
    + 3 * coalesce((select count(*) from public.reading_progress rp
                    where rp.book_id = b.id and rp.last_read_at > now() - interval '30 days'), 0)
    + 5 * coalesce((select count(*) from public.reviews r where r.book_id = b.id), 0)
  ) as trending_score
from public.books b
where b.status = 'published' and b.visibility = 'public';

grant select on public.book_trending to anon, authenticated;
