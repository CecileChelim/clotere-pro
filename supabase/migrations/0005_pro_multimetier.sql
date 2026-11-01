-- clotere-pro — migration 0005 : multi-métier (avocat / comptable), cabinets,
-- comptes par professionnel rattachés à un cabinet, invitations, motifs enrichis.
-- À exécuter dans l'éditeur SQL Supabase APRÈS les migrations 0002 à 0004.

-- 1. Cabinets --------------------------------------------------------------
create table if not exists cabinets (
  id uuid primary key default gen_random_uuid(),
  profession text not null check (profession in ('avocat', 'comptable')),
  siret text,
  nom text not null,
  adresse text,
  code_postal text,
  ville text,
  barreau text,                       -- avocats uniquement
  google_place_id text,               -- fiche Google Business (plus tard)
  owner_auth_user_id uuid references auth.users(id) not null,
  trial_ends_at timestamptz not null default (now() + interval '7 days'),
  subscription_status text not null default 'essai', -- essai | actif | impayé | résilié
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now()
);
create index if not exists cabinets_profession_idx on cabinets (profession);

-- 2. Professionnels : un compte par avocat / comptable ---------------------
alter table professionals
  alter column numero_agrement drop not null,
  add column if not exists profession text not null default 'avocat'
    check (profession in ('avocat', 'comptable', 'cgp')),
  add column if not exists cabinet_id uuid references cabinets(id),
  add column if not exists role text not null default 'titulaire'
    check (role in ('titulaire', 'membre')),
  add column if not exists domaines text[],
  add column if not exists onboarding_step text default 'cabinet'; -- cabinet | motifs | horaires | agenda | widget | termine
create index if not exists professionals_cabinet_idx on professionals (cabinet_id);

-- 3. Motifs enrichis ---------------------------------------------------------
alter table motifs
  add column if not exists description text,
  add column if not exists duree_min int not null default 30,
  add column if not exists modes text[] not null default '{cabinet,visio}', -- cabinet | visio | telephone
  add column if not exists prix_type text not null default 'non_affiche'
    check (prix_type in ('gratuit', 'payant', 'non_affiche')),
  add column if not exists prix_euros numeric(8,2),
  add column if not exists actif boolean not null default true;

-- 4. Invitations de confrères ----------------------------------------------
create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  cabinet_id uuid references cabinets(id) on delete cascade not null,
  email text not null,
  token uuid not null default gen_random_uuid() unique,
  invited_by uuid references auth.users(id) not null,
  accepted_at timestamptz,
  created_at timestamptz default now()
);

-- 5. RLS -------------------------------------------------------------------
-- Fonction utilitaire (security definer) pour éviter la récursion des policies.
create or replace function my_cabinet_ids() returns setof uuid
language sql security definer stable as $$
  select cabinet_id from professionals where auth_user_id = auth.uid() and cabinet_id is not null
  union
  select id from cabinets where owner_auth_user_id = auth.uid()
$$;

create or replace function is_cabinet_titulaire(cid uuid) returns boolean
language sql security definer stable as $$
  select exists (select 1 from cabinets where id = cid and owner_auth_user_id = auth.uid())
     or exists (select 1 from professionals where cabinet_id = cid and auth_user_id = auth.uid() and role = 'titulaire')
$$;

alter table cabinets enable row level security;
alter table invitations enable row level security;

drop policy if exists "cabinet insert by owner" on cabinets;
create policy "cabinet insert by owner" on cabinets for insert
  with check (owner_auth_user_id = auth.uid());
drop policy if exists "cabinet read by members" on cabinets;
create policy "cabinet read by members" on cabinets for select
  using (id in (select my_cabinet_ids()));
drop policy if exists "cabinet update by titulaire" on cabinets;
create policy "cabinet update by titulaire" on cabinets for update
  using (is_cabinet_titulaire(id));
drop policy if exists "public read cabinets" on cabinets;
create policy "public read cabinets" on cabinets for select using (true); -- nom/adresse affichés sur la page de rdv

drop policy if exists "invitations by titulaire" on invitations;
create policy "invitations by titulaire" on invitations for all
  using (is_cabinet_titulaire(cabinet_id))
  with check (is_cabinet_titulaire(cabinet_id) and invited_by = auth.uid());

-- Un membre du cabinet peut voir les fiches de ses confrères.
drop policy if exists "read cabinet colleagues" on professionals;
create policy "read cabinet colleagues" on professionals for select
  using (cabinet_id in (select my_cabinet_ids()));

-- 6. Verrou sur les champs d'abonnement (modifiables seulement côté serveur) -
create or replace function protect_cabinet_billing_fields()
returns trigger as $$
begin
  if auth.role() <> 'service_role' then
    new.trial_ends_at := old.trial_ends_at;
    new.subscription_status := old.subscription_status;
    new.stripe_customer_id := old.stripe_customer_id;
    new.stripe_subscription_id := old.stripe_subscription_id;
    new.owner_auth_user_id := old.owner_auth_user_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists protect_cabinet_billing_fields on cabinets;
create trigger protect_cabinet_billing_fields
  before update on cabinets
  for each row execute function protect_cabinet_billing_fields();

-- Empêche un pro de changer seul son cabinet ou de se promouvoir titulaire.
create or replace function protect_professional_cabinet_fields()
returns trigger as $$
begin
  if auth.role() <> 'service_role' and old.cabinet_id is not null then
    new.cabinet_id := old.cabinet_id;
    new.role := old.role;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists protect_professional_cabinet_fields on professionals;
create trigger protect_professional_cabinet_fields
  before update on professionals
  for each row execute function protect_professional_cabinet_fields();
