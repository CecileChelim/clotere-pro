-- clotere-pro — migration 0026 : questions posées au client selon le domaine du motif.
-- Les questions sont dans le code (lib/rdv/questionnaires.ts) ; le pro choisit le domaine du motif
-- et peut couper le questionnaire. Les réponses sont copiées sur le rendez-vous.

alter table motifs add column if not exists questionnaire_actif boolean not null default true;
alter table bookings add column if not exists reponses jsonb;   -- [{question, reponse}] figées à la demande

-- Rattrapage : l'enregistrement des motifs depuis le dashboard perdait leur domaine.
-- On le retrouve d'après le libellé généré (« 1ère consultation – Droit du travail »).
update motifs m set domaine_id = d.id
from professionals p, domaines d
where m.professional_id = p.id and m.domaine_id is null
  and d.profession = p.profession
  and m.libelle ilike '% – ' || d.label;

notify pgrst, 'reload schema';
