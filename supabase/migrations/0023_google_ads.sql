-- clotere-pro — migration 0023 : service Google Ads (géré par Clotere, 10 % du budget dépensé).
-- Activé à la main par Clotere une fois le contrat signé ; la demande de rappel est horodatée.
alter table cabinets
  add column if not exists offre_ads boolean not null default false,
  add column if not exists ads_demande_at timestamptz;
notify pgrst, 'reload schema';
