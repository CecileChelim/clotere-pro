-- clotere-pro — migration 0012 : avis Google récupérés automatiquement (Places API).
alter table cabinets
  add column if not exists google_reviews jsonb,          -- jusqu'à 5 avis : [{auteur, photo, note, quand, texte}]
  add column if not exists google_synced_at timestamptz;
notify pgrst, 'reload schema';
