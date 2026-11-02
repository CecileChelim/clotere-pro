-- clotere-pro — migration 0017 : fiche Google résolue depuis le lien du pro + suppression des rendez-vous.

-- Lien de fiche Google à partir duquel google_place_id a été trouvé (pour savoir quand le recalculer).
alter table cabinets add column if not exists google_place_url text;

-- Rendez-vous supprimés par le pro : gardés en base (statut « supprimé ») pour les statistiques.
alter table bookings
  add column if not exists supprime_le timestamptz,
  add column if not exists suppression_raison text,   -- termine | absent | sans_suite | hors_champ | doublon | autre
  add column if not exists suppression_detail text,
  add column if not exists statut_avant_suppression text,
  add column if not exists avis_demande_le timestamptz;
create index if not exists bookings_suppression_idx on bookings (professional_id, suppression_raison) where statut = 'supprimé';

notify pgrst, 'reload schema';
