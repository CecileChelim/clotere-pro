-- Moneago — migration 0005 : tarif par service (affiché sur la fiche
-- publique). Par défaut "Sur demande", modifiable librement par le CGP dans
-- son espace (aucune contrainte de format : certains cabinets facturent au
-- forfait, d'autres au pourcentage, d'autres ne communiquent aucun chiffre).

alter table services
  add column if not exists prix text default 'Sur demande';
