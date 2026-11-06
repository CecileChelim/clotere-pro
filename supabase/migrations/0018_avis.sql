-- clotere-pro — migration 0018 : option « Avis Google » (avis de la fiche, réponses suggérées, demandes d'avis et relances)
-- + options payantes souscrites via Stripe (Visibilité, Avis).

alter table cabinets
  add column if not exists offre_avis boolean not null default false,
  add column if not exists offre_avis_depuis date,
  add column if not exists stripe_sub_visibilite text,   -- abonnement Stripe de l'option Visibilité
  add column if not exists stripe_sub_avis text;         -- abonnement Stripe de l'option Avis

-- Avis de la fiche Google du cabinet (récupérés par Places API, complétés à chaque synchronisation).
create table if not exists avis_google (
  id uuid primary key default gen_random_uuid(),
  cabinet_id uuid not null references cabinets(id) on delete cascade,
  cle text not null,                       -- identifiant Google de l'avis (ou empreinte auteur + texte)
  auteur text,
  photo text,
  note smallint,
  texte text,
  publie_le timestamptz,
  quand text,                              -- « il y a 2 semaines » (libellé Google)
  reponse_google text,                     -- réponse déjà publiée par le cabinet sur Google, si connue
  reponse_google_le timestamptz,
  reponse_suggeree text,                   -- réponse proposée par Clotere
  reponse_suggeree_le timestamptz,
  statut text not null default 'a_repondre' check (statut in ('a_repondre', 'repondu', 'ignore')),
  created_at timestamptz not null default now(),
  unique (cabinet_id, cle)
);
create index if not exists avis_google_cabinet_idx on avis_google (cabinet_id, publie_le desc nulls last);
alter table avis_google enable row level security;
drop policy if exists "avis lus par le cabinet" on avis_google;
create policy "avis lus par le cabinet" on avis_google for select using (cabinet_id in (select my_cabinet_ids()));

-- Demandes d'avis envoyées aux clients, avec l'historique des envois et relances.
create table if not exists demandes_avis (
  id uuid primary key default gen_random_uuid(),
  cabinet_id uuid not null references cabinets(id) on delete cascade,
  booking_id uuid references bookings(id) on delete set null,
  client_nom text,
  client_email text not null,
  statut text not null default 'en_cours' check (statut in ('en_cours', 'avis_recu', 'terminee', 'arretee')),
  historique jsonb not null default '[]'::jsonb,   -- [{ "type": "demande" | "relance", "le": iso, "envoye": bool }]
  nb_relances smallint not null default 0,
  prochaine_relance_le timestamptz,
  avis_id uuid references avis_google(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists demandes_avis_cabinet_idx on demandes_avis (cabinet_id, created_at desc);
create index if not exists demandes_avis_relance_idx on demandes_avis (prochaine_relance_le) where statut = 'en_cours';
alter table demandes_avis enable row level security;
drop policy if exists "demandes d'avis lues par le cabinet" on demandes_avis;
create policy "demandes d'avis lues par le cabinet" on demandes_avis for select using (cabinet_id in (select my_cabinet_ids()));

notify pgrst, 'reload schema';
