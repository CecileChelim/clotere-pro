-- Moneago — schéma Supabase de départ
-- À exécuter dans l'éditeur SQL Supabase ou via `supabase db push`.

create table professionals (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) not null,
  nom text not null,
  prenom text not null,
  email text not null,
  telephone text,
  numero_agrement text not null, -- ORIAS
  specialites text[],
  bio text,
  photo_url text,
  slug text unique not null,
  ville text,
  cabinet text,
  actif_depuis date,
  plan_status text default 'essai', -- essai | actif | résilié
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now()
);

create table motifs (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid references professionals(id) not null,
  libelle text not null,
  ordre int default 0
);

create table availability (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid references professionals(id) not null,
  jour_semaine int, -- 0-6, ou date pour une exception ponctuelle
  date date,
  heure_debut time not null,
  heure_fin time not null
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid references professionals(id) not null,
  motif_id uuid references motifs(id),
  type_rdv text not null, -- 'tel' | 'visio'
  client_nom text not null,
  client_email text not null,
  client_tel text,
  message text,
  creneau_debut timestamptz not null,
  creneau_fin timestamptz not null,
  statut text default 'demandé', -- demandé | confirmé | annulé
  created_at timestamptz default now()
);

-- Row Level Security : chaque professionnel ne voit/modifie que ses propres données
alter table professionals enable row level security;
alter table motifs enable row level security;
alter table availability enable row level security;
alter table bookings enable row level security;

create policy "own profile" on professionals for all using (auth.uid() = auth_user_id);
create policy "own motifs" on motifs for all using (
  professional_id in (select id from professionals where auth_user_id = auth.uid())
);
create policy "own availability" on availability for all using (
  professional_id in (select id from professionals where auth_user_id = auth.uid())
);
create policy "own bookings" on bookings for all using (
  professional_id in (select id from professionals where auth_user_id = auth.uid())
);

-- Les fiches publiques et les motifs/disponibilités doivent rester lisibles
-- sans authentification pour le SSR de la fiche publique et le formulaire de RDV :
create policy "public read professionals" on professionals for select using (true);
create policy "public read motifs" on motifs for select using (true);
create policy "public read availability" on availability for select using (true);
-- (l'insertion d'un booking par un visiteur anonyme se fait via une Edge Function
-- ou une policy insert dédiée limitée aux colonnes nécessaires, pas en accès direct)
