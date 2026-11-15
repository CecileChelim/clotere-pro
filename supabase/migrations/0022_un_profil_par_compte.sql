-- clotere-pro — migration 0022 : un seul profil professionnel par compte.
-- Évite qu'une double création (double clic, effet rejoué) crée deux profils pour le même utilisateur,
-- ce qui cassait toutes les requêtes « mon profil » (renvoi vers /inscription).
-- À exécuter APRÈS avoir supprimé les doublons éventuels :
--   select auth_user_id, count(*) from professionals group by auth_user_id having count(*) > 1;
create unique index if not exists professionals_auth_user_unique on professionals (auth_user_id);
create unique index if not exists cabinets_owner_unique on cabinets (owner_auth_user_id);
