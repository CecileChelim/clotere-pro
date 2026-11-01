-- clotere-pro — migration 0009 : circuit complet des rendez-vous (gestion sans connexion, suivi client, emails).

alter table bookings
  add column if not exists token_pro uuid not null default gen_random_uuid(),      -- lien « Gérer la demande » (avocat)
  add column if not exists token_client uuid not null default gen_random_uuid(),   -- lien « Suivre mon rendez-vous » (client)
  add column if not exists message_pro text,                                        -- message joint par l'avocat
  add column if not exists creneaux_proposes jsonb,                                 -- [{debut, fin}] proposés par l'avocat
  add column if not exists source text,                                             -- site | google | linkedin | mail | direct
  add column if not exists relance_envoyee_at timestamptz,
  add column if not exists rappel_envoye_at timestamptz,
  add column if not exists annule_par text,                                         -- client | pro | auto
  add column if not exists traite_at timestamptz,
  add column if not exists updated_at timestamptz default now();

create unique index if not exists bookings_token_pro_idx on bookings (token_pro);
create unique index if not exists bookings_token_client_idx on bookings (token_client);

-- Statuts : demandé | confirmé | refusé | proposé | annulé
update bookings set statut = 'refusé' where statut = 'annulé' and annule_par is null;

-- Les demandes passent désormais par l'API (/api/rdv) : plus d'écriture anonyme directe.
drop policy if exists "public insert booking" on bookings;

-- Journal des emails (envoyés via Brevo, ou seulement enregistrés tant qu'aucune clé n'est configurée).
create table if not exists emails (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  professional_id uuid references professionals(id) on delete cascade,
  destinataire text not null,
  type text not null,              -- demande_client | demande_pro | confirme_client | refuse_client | ...
  sujet text not null,
  html text not null,
  envoye boolean not null default false,
  erreur text,
  created_at timestamptz default now()
);
create index if not exists emails_pro_idx on emails (professional_id, created_at desc);
alter table emails enable row level security;
drop policy if exists "own emails" on emails;
create policy "own emails" on emails for select
  using (professional_id in (select id from professionals where auth_user_id = auth.uid()));

notify pgrst, 'reload schema';
