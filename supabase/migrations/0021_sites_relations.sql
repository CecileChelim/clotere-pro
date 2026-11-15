-- clotere-pro — migration 0021 : corrige l'ambiguïté de relations introduite par la 0019.
-- sites (cabinet_id + professional_id) et site_messages (site_id + cabinet_id) étaient vues par Supabase (PostgREST)
-- comme des tables de liaison : professionals ↔ cabinets et sites ↔ cabinets avaient alors deux chemins possibles,
-- et toutes les requêtes « professionnel + cabinet » (dashboard, page de rdv /rdv/…) échouaient.
-- On retire les deux clés étrangères inutiles ; les colonnes restent, la suppression en cascade passe par le cabinet.
alter table sites drop constraint if exists sites_professional_id_fkey;
alter table site_messages drop constraint if exists site_messages_cabinet_id_fkey;
notify pgrst, 'reload schema';
