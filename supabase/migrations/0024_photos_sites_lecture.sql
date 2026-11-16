-- clotere-pro — migration 0024 : envoi des photos du site (bucket « sites »).
-- L'envoi échouait avec « new row violates row-level security policy » : Supabase Storage exige aussi
-- un droit de lecture (select) sur ses propres fichiers. On le donne au propriétaire du dossier <auth_user_id>/.
drop policy if exists "photos de site : lecture par le propriétaire" on storage.objects;
create policy "photos de site : lecture par le propriétaire" on storage.objects for select to authenticated
  using (bucket_id = 'sites' and (storage.foldername(name))[1] = auth.uid()::text);

-- Rattrapage si la partie stockage de la 0019 n'a pas été jouée.
insert into storage.buckets (id, name, public) values ('sites', 'sites', true) on conflict (id) do nothing;
drop policy if exists "photos de site : envoi par le propriétaire" on storage.objects;
create policy "photos de site : envoi par le propriétaire" on storage.objects for insert to authenticated
  with check (bucket_id = 'sites' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "photos de site : remplacement par le propriétaire" on storage.objects;
create policy "photos de site : remplacement par le propriétaire" on storage.objects for update to authenticated
  using (bucket_id = 'sites' and (storage.foldername(name))[1] = auth.uid()::text);
