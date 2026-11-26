-- clotere-pro — migration 0027 : nom de domaine personnalisé pour le site du cabinet (option site).
-- Le site reste servi sur <métier>.clotere.fr/<slug> ; s'il a un domaine connecté, www.<domaine> l'affiche aussi (proxy.ts).

alter table sites
  add column if not exists domaine text,                      -- "cabinet-tellier.fr" (sans www, en minuscules)
  add column if not exists domaine_statut text,               -- attente | connecte
  add column if not exists domaine_verifie_at timestamptz,    -- dernière vérification DNS
  add column if not exists domaine_connecte_at timestamptz;   -- première vérification réussie

create unique index if not exists sites_domaine_idx on sites (domaine) where domaine is not null;
