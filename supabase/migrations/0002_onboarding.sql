-- Moneago — migration 0002 : champs nécessaires à l'onboarding et à la fiche
-- complète (calqués sur les informations présentes sur une fiche CGP type),
-- table `services`, et stockage des photos de profil.
--
-- À exécuter APRÈS supabase/schema.sql, dans l'éditeur SQL Supabase.

-- 1. Champs complémentaires sur professionals ----------------------------

alter table professionals
  add column if not exists zones_intervention text[],       -- ex. {Rennes,Nantes,Vannes}
  add column if not exists groupe text,                       -- groupe/franchise auquel le cabinet est rattaché
  add column if not exists statut_orias text,                 -- ex. "Mandataire d'Intermédiaire en Assurance"
  add column if not exists modalites text[],                  -- ex. {Cabinet,Domicile,Visioconférence,Téléphone,Email}
  add column if not exists temps_reponse text default 'Sous 24h',
  add column if not exists accepte_nouveaux_clients boolean default true,
  add column if not exists verifiee boolean default false;    -- badge "Vérifiée" — contrôlé par Moneago, pas par le CGP

comment on column professionals.verifiee is
  'Vrai uniquement après vérification manuelle par Moneago — ne pas exposer en édition libre côté CGP.';

-- 2. Table `services` (blocs "ce que je peux faire pour vous", distincts
--    des motifs de RDV qui pilotent le formulaire de réservation) --------

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid references professionals(id) not null,
  titre text not null,
  description text,
  ordre int default 0
);

alter table services enable row level security;

create policy "own services" on services for all using (
  professional_id in (select id from professionals where auth_user_id = auth.uid())
);
create policy "public read services" on services for select using (true);

-- 3. Verrou serveur sur les champs à contrôle admin -----------------------
-- La policy "own profile" (schema.sql) autorise le CGP à modifier N'IMPORTE
-- QUELLE colonne de sa propre ligne, y compris verifiee/plan_status/stripe_*.
-- Ce trigger fige ces colonnes à leur valeur précédente pour toute requête
-- qui ne passe pas par la clé service_role (donc pour le CGP lui-même,
-- authentifié depuis le front). Un outil admin utilisant la service_role key
-- reste libre de les modifier — auth.role() lit alors 'service_role'.

create or replace function protect_privileged_professional_fields()
returns trigger as $$
begin
  if auth.role() <> 'service_role' then
    new.verifiee := old.verifiee;
    new.plan_status := old.plan_status;
    new.stripe_customer_id := old.stripe_customer_id;
    new.stripe_subscription_id := old.stripe_subscription_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists protect_privileged_professional_fields on professionals;
create trigger protect_privileged_professional_fields
  before update on professionals
  for each row execute function protect_privileged_professional_fields();

-- 4. Stockage des photos de profil ----------------------------------------

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Chaque CGP dépose ses fichiers sous avatars/<auth_user_id>/... : le dossier
-- fait office de contrôle d'accès (voir storage.foldername).
create policy "public read avatars" on storage.objects for select
  using (bucket_id = 'avatars');

create policy "own avatar upload" on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "own avatar update" on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "own avatar delete" on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
