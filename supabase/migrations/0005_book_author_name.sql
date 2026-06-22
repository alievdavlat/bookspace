-- Literary author of the work (distinct from the uploading user / author_id).
alter table public.books add column if not exists author_name text;
