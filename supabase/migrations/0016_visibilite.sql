-- clotere-pro — migration 0016 : offre Visibilité (articles SEO, statistiques Search Console, rapports trimestriels).

-- 1. Offres activées sur le cabinet (activées par Clotere uniquement).
alter table cabinets
  add column if not exists offre_visibilite boolean not null default false,
  add column if not exists offre_visibilite_depuis date,
  add column if not exists offre_site boolean not null default false,
  add column if not exists visibilite_demande_at timestamptz,
  add column if not exists gsc_propriete text,          -- ex. sc-domain:cabinet-martin.fr
  add column if not exists publication_cible text;      -- 'site_client' | 'template_clotere'

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
    new.visibilite_demande_at := old.visibilite_demande_at;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- 2. Articles poussés chaque mois.
--    statut : a_relire → (modifs_demandees →) valide → publie
create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  cabinet_id uuid not null references cabinets(id) on delete cascade,
  mois date not null,                         -- 1er jour du mois concerné
  titre text not null,
  mot_cle text,                               -- requête Google visée
  contenu text not null default '',           -- markdown simple : ## titres, - listes, **gras**
  statut text not null default 'a_relire' check (statut in ('a_relire', 'modifs_demandees', 'valide', 'publie')),
  commentaire_client text,
  modifie_par_client boolean not null default false,
  valide_auto boolean not null default false,
  url_publication text,
  clics int,                                  -- Search Console, cumul depuis la publication
  impressions int,
  pousse_le timestamptz not null default now(),
  notifie_le timestamptz,
  valide_le timestamptz,
  publie_le timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists articles_cabinet_idx on articles (cabinet_id, mois desc);
alter table articles enable row level security;
drop policy if exists "articles lus par le cabinet" on articles;
create policy "articles lus par le cabinet" on articles for select using (cabinet_id in (select my_cabinet_ids()));
-- (les modifications du client passent par l'API serveur, qui contrôle les changements de statut)

-- 3. Statistiques mensuelles Search Console.
create table if not exists visibilite_stats (
  cabinet_id uuid not null references cabinets(id) on delete cascade,
  mois date not null,
  clics int not null default 0,
  impressions int not null default 0,
  position numeric(5,1),
  primary key (cabinet_id, mois)
);
alter table visibilite_stats enable row level security;
drop policy if exists "stats lues par le cabinet" on visibilite_stats;
create policy "stats lues par le cabinet" on visibilite_stats for select using (cabinet_id in (select my_cabinet_ids()));

-- 4. Rapports trimestriels (PDF dans le bucket privé « rapports », chemin <cabinet_id>/<fichier>.pdf).
create table if not exists rapports (
  id uuid primary key default gen_random_uuid(),
  cabinet_id uuid not null references cabinets(id) on delete cascade,
  titre text not null,                        -- ex. « Rapport T3 2026 »
  periode text,                               -- ex. 2026-T3
  fichier text not null,                      -- chemin dans le bucket
  created_at timestamptz not null default now()
);
create index if not exists rapports_cabinet_idx on rapports (cabinet_id, created_at desc);
alter table rapports enable row level security;
drop policy if exists "rapports lus par le cabinet" on rapports;
create policy "rapports lus par le cabinet" on rapports for select using (cabinet_id in (select my_cabinet_ids()));

insert into storage.buckets (id, name, public) values ('rapports', 'rapports', false) on conflict (id) do nothing;

notify pgrst, 'reload schema';
