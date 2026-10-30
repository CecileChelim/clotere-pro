-- Moneago — migration 0004 : bascule le badge "Vérifiée" en auto-déclaratif
-- pour la V1 (fourniture d'un numéro ORIAS à l'inscription), en l'absence
-- d'un outil de revue manuelle admin. Un futur back-office pourra repasser
-- un profil suspect à `false` (le trigger de la migration 0002 continue de
-- protéger ce champ contre toute modification par le CGP lui-même).

alter table professionals
  alter column verifiee set default true;

comment on column professionals.verifiee is
  'V1 : vrai par défaut (auto-déclaratif, numéro ORIAS fourni à l''inscription). '
  'Pas encore d''audit manuel — à faire passer à false pour un profil signalé, '
  'via la service_role key (le trigger protect_privileged_professional_fields '
  'bloque toute modification par le CGP authentifié).';

-- Optionnel : pour repasser un compte déjà créé (avant cette migration) en
-- "Vérifiée", exécuter par exemple :
--   update professionals set verifiee = true where slug = 'votre-slug';
