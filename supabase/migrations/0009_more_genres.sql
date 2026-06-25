-- Phase 4: expand the genre catalog to ~40.
insert into public.genres (name, slug) values
  ('Thriller','thriller'),('Crime','crime'),('Historical','historical'),
  ('Biography','biography'),('Memoir','memoir'),('Self-Help','self-help'),
  ('Business','business'),('Philosophy','philosophy'),('Psychology','psychology'),
  ('Science','science'),('Technology','technology'),('Health','health'),
  ('Travel','travel'),('Cooking','cooking'),('Art','art'),('Music','music'),
  ('Religion','religion'),('Spirituality','spirituality'),('Politics','politics'),
  ('Economics','economics'),('Education','education'),('Drama','drama'),
  ('Comedy','comedy'),('Short Stories','short-stories'),('Essays','essays'),
  ('Graphic Novel','graphic-novel'),('Young Adult','young-adult'),
  ('Dystopian','dystopian'),('Paranormal','paranormal'),('Contemporary','contemporary'),
  ('Literary Fiction','literary-fiction'),('Nonfiction','nonfiction'),('Western','western'),
  ('War','war'),('Sports','sports'),('Nature','nature'),('Parenting','parenting'),
  ('Humor','humor'),('True Crime','true-crime'),('Anthology','anthology')
on conflict (slug) do nothing;
