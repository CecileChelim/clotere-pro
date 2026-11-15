-- clotere-pro — migration 0019 : offre « Site internet » (créateur de site en libre-service).
-- Formules : site + formulaire de contact (69 € HT/mois) ou site + prise de rendez-vous + actualités (99 € HT/mois).
-- À exécuter dans l'éditeur SQL Supabase APRÈS la 0018.

-- 1. Modules du cabinet ------------------------------------------------------
--    offre_rdv  : prise de rendez-vous en ligne (true pour tous les cabinets existants = widget).
--    offre_site : site internet Clotere (colonne créée en 0016, jusqu'ici inutilisée).
--    Site + formulaire de contact = offre_site true, offre_rdv false.
alter table cabinets
  add column if not exists offre_rdv boolean not null default true,
  add column if not exists offre_site_depuis date,
  add column if not exists abonnement_periode text not null default 'mois' check (abonnement_periode in ('mois', 'an'));

-- Les modules restent modifiables uniquement côté serveur (paiement / API).
create or replace function protect_cabinet_billing_fields()
returns trigger as $$
begin
  if auth.role() <> 'service_role' then
    new.trial_ends_at := old.trial_ends_at;
    new.subscription_status := old.subscription_status;
    new.stripe_customer_id := old.stripe_customer_id;
    new.stripe_subscription_id := old.stripe_subscription_id;
    new.owner_auth_user_id := old.owner_auth_user_id;
    new.offre_visibilite := old.offre_visibilite;
    new.offre_visibilite_depuis := old.offre_visibilite_depuis;
    new.offre_site := old.offre_site;
    new.offre_site_depuis := old.offre_site_depuis;
    new.offre_rdv := old.offre_rdv;
    new.offre_avis := old.offre_avis;
    new.offre_avis_depuis := old.offre_avis_depuis;
    new.stripe_sub_visibilite := old.stripe_sub_visibilite;
    new.stripe_sub_avis := old.stripe_sub_avis;
    new.abonnement_periode := old.abonnement_periode;
    new.visibilite_demande_at := old.visibilite_demande_at;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- 2. Sites ------------------------------------------------------------------
--    Un site par cabinet, servi sur avocat.clotere.fr/<slug> ou comptable.clotere.fr/<slug>.
create table if not exists sites (
  id uuid primary key default gen_random_uuid(),
  cabinet_id uuid not null unique references cabinets(id) on delete cascade,
  professional_id uuid,                                                   -- auteur / titulaire mis en avant (sans clé étrangère : voir 0021)
  profession text not null check (profession in ('avocat', 'comptable')),
  slug text not null unique,                                              -- ex. cecile-chelim-paris-7e
  template text not null default 'light' check (template in ('light', 'moderne', 'performance')),
  palette text not null default 'sauge',
  sections text[] not null default '{apropos,domaines,approche,methode,avis,faq,contact}',
  contenu jsonb not null default '{}'::jsonb,                             -- textes modifiables (voir lib/site/types.ts)
  taille text check (taille in ('seul', 'petit', 'cabinet')),
  complement_adresse text,
  photo_couverture text,
  photo_portrait text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists sites_profession_idx on sites (profession);

alter table sites enable row level security;
drop policy if exists "sites publics" on sites;
create policy "sites publics" on sites for select using (true);         -- le site est une page publique
drop policy if exists "site modifié par le cabinet" on sites;
create policy "site modifié par le cabinet" on sites for update
  using (cabinet_id in (select my_cabinet_ids()))
  with check (cabinet_id in (select my_cabinet_ids()));
-- (création et changement de slug : côté serveur uniquement)

create or replace function protect_site_fields()
returns trigger as $$
begin
  if auth.role() <> 'service_role' then
    new.slug := old.slug;
    new.cabinet_id := old.cabinet_id;
    new.profession := old.profession;
  end if;
  new.updated_at := now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists protect_site_fields on sites;
create trigger protect_site_fields before update on sites
  for each row execute function protect_site_fields();

-- 3. Messages reçus par le formulaire de contact du site ----------------------
create table if not exists site_messages (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  cabinet_id uuid not null,                                -- sans clé étrangère (voir 0021) ; supprimé avec le site
  prenom text,
  nom text not null,
  email text not null,
  telephone text,
  objet text,
  message text not null,
  lu boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists site_messages_cabinet_idx on site_messages (cabinet_id, created_at desc);
alter table site_messages enable row level security;
drop policy if exists "messages lus par le cabinet" on site_messages;
create policy "messages lus par le cabinet" on site_messages for select using (cabinet_id in (select my_cabinet_ids()));
drop policy if exists "messages marqués lus par le cabinet" on site_messages;
create policy "messages marqués lus par le cabinet" on site_messages for update
  using (cabinet_id in (select my_cabinet_ids()));
-- (insertion par le formulaire public : via /api/site/contact, côté serveur)

-- 4. Photos du site : bucket public « sites » (<auth_user_id>/<fichier>).
insert into storage.buckets (id, name, public) values ('sites', 'sites', true) on conflict (id) do nothing;
drop policy if exists "photos de site : envoi par le propriétaire" on storage.objects;
create policy "photos de site : envoi par le propriétaire" on storage.objects for insert to authenticated
  with check (bucket_id = 'sites' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "photos de site : remplacement par le propriétaire" on storage.objects;
create policy "photos de site : remplacement par le propriétaire" on storage.objects for update to authenticated
  using (bucket_id = 'sites' and (storage.foldername(name))[1] = auth.uid()::text);

notify pgrst, 'reload schema';
