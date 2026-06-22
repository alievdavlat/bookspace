-- Allow signed-in users to read (and generate signed URLs for) book files.
create policy "book_files_auth_read" on storage.objects for select to authenticated
  using (bucket_id = 'book-files');
