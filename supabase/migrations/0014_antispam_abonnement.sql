-- clotere-pro — migration 0014 : anti-spam des demandes de rdv + abonnement Stripe.

-- Tentatives de demande de rdv (IP hachée, jamais l'IP en clair).
create table if not exists rdv_tentatives (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);
create index if not exists rdv_tentatives_ip_idx on rdv_tentatives (ip_hash, created_at desc);
alter table rdv_tentatives enable row level security; -- accès serveur uniquement

-- Abonnement : nombre d'avocats facturés et fin de période.
alter table cabinets
  add column if not exists abonnement_quantite int,
  add column if not exists abonnement_fin_periode timestamptz;

notify pgrst, 'reload schema';
