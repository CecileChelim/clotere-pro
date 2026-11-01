-- clotere-pro — migration 0007 : infos publiques du cabinet + (rappel) colonnes bookings.
-- Idempotent : peut être lancé même si 0006 l'a déjà été.

alter table cabinets
  add column if not exists site_web text,
  add column if not exists telephone text,
  add column if not exists google_rating numeric(2,1),        -- ex. 4.8
  add column if not exists google_reviews_count int,          -- ex. 37
  add column if not exists google_reviews_url text;           -- lien vers les avis Google

alter table bookings
  add column if not exists client_prenom text,
  add column if not exists suivi_existant boolean not null default false,
  add column if not exists deja_avocat text,
  add column if not exists mode text;

drop policy if exists "public insert booking" on bookings;
create policy "public insert booking" on bookings for insert to anon, authenticated
  with check (statut = 'demandé');

-- Force l'API Supabase à relire le schéma (corrige l'erreur PGRST204).
notify pgrst, 'reload schema';
