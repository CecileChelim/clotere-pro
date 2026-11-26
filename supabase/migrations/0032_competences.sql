-- clotere-pro — migration 0032 : domaines de compétence (niveau au-dessus des domaines de 0029).
-- Parcours voulu : l'avocat choisit d'abord ses domaines de compétence (Droit de la famille, Droit du travail…),
-- puis, dans chacun, ses motifs de rendez-vous (Divorce à l'amiable, Pension alimentaire, Adoption…).
-- Additif : les 33 domaines de 0029 (et leurs ids, questionnaires, motifs, rendez-vous) sont conservés,
-- ils sont seulement rattachés à un domaine de compétence. Experts-comptables : leurs domaines sont déjà
-- des domaines de compétence (competence_id reste vide, chaque domaine fait office de compétence).
-- À exécuter APRÈS la 0029.

create table if not exists competences (
  id text primary key,
  profession text not null,
  label text not null,
  description text,
  ordre int not null default 0
);
alter table competences enable row level security;
drop policy if exists "public read competences" on competences;
create policy "public read competences" on competences for select using (true);

alter table domaines add column if not exists competence_id text references competences(id) on delete set null;

insert into competences (id, profession, label, description, ordre) values ('avocat-c-famille', 'avocat', 'Droit de la famille', 'Divorce, enfants, pension alimentaire, filiation, adoption, état civil.', 0) on conflict (id) do update set label = excluded.label, description = excluded.description, ordre = excluded.ordre;
update domaines set competence_id = 'avocat-c-famille' where id in ('avocat-divorce', 'avocat-famille', 'avocat-filiation', 'avocat-etat-civil');
insert into competences (id, profession, label, description, ordre) values ('avocat-c-travail', 'avocat', 'Droit du travail', 'Licenciement, rupture conventionnelle, prud''hommes, harcèlement, contrat de travail.', 1) on conflict (id) do update set label = excluded.label, description = excluded.description, ordre = excluded.ordre;
update domaines set competence_id = 'avocat-c-travail' where id in ('avocat-travail');
insert into competences (id, profession, label, description, ordre) values ('avocat-c-immobilier', 'avocat', 'Droit immobilier', 'Achat, vente, bail d''habitation et commercial, copropriété, construction, voisinage.', 2) on conflict (id) do update set label = excluded.label, description = excluded.description, ordre = excluded.ordre;
update domaines set competence_id = 'avocat-c-immobilier' where id in ('avocat-immobilier', 'avocat-bail-commercial');
insert into competences (id, profession, label, description, ordre) values ('avocat-c-successions', 'avocat', 'Successions & patrimoine', 'Héritage, testament, donation, partage entre héritiers, assurance-vie.', 3) on conflict (id) do update set label = excluded.label, description = excluded.description, ordre = excluded.ordre;
update domaines set competence_id = 'avocat-c-successions' where id in ('avocat-successions');
insert into competences (id, profession, label, description, ordre) values ('avocat-c-penal', 'avocat', 'Droit pénal', 'Garde à vue, plainte, tribunal correctionnel, violences, infractions routières et permis.', 4) on conflict (id) do update set label = excluded.label, description = excluded.description, ordre = excluded.ordre;
update domaines set competence_id = 'avocat-c-penal' where id in ('avocat-penal', 'avocat-routier');
insert into competences (id, profession, label, description, ordre) values ('avocat-c-corporel', 'avocat', 'Préjudice corporel & santé', 'Accident de la route, accident médical, agression, indemnisation, responsabilité médicale.', 5) on conflict (id) do update set label = excluded.label, description = excluded.description, ordre = excluded.ordre;
update domaines set competence_id = 'avocat-c-corporel' where id in ('avocat-dommage-corporel', 'avocat-sante');
insert into competences (id, profession, label, description, ordre) values ('avocat-c-consommation', 'avocat', 'Consommation, banque & assurance', 'Litige avec un professionnel, crédit, banque, surendettement, refus d''assurance.', 6) on conflict (id) do update set label = excluded.label, description = excluded.description, ordre = excluded.ordre;
update domaines set competence_id = 'avocat-c-consommation' where id in ('avocat-consommation', 'avocat-banque', 'avocat-surendettement', 'avocat-assurance');
insert into competences (id, profession, label, description, ordre) values ('avocat-c-affaires', 'avocat', 'Droit des affaires', 'Sociétés, contrats commerciaux, impayés, entreprises en difficulté, associations, transport, sport.', 7) on conflict (id) do update set label = excluded.label, description = excluded.description, ordre = excluded.ordre;
update domaines set competence_id = 'avocat-c-affaires' where id in ('avocat-societes', 'avocat-commercial', 'avocat-difficultes', 'avocat-associations', 'avocat-transports', 'avocat-sport');
insert into competences (id, profession, label, description, ordre) values ('avocat-c-pi-numerique', 'avocat', 'Propriété intellectuelle & numérique', 'Marque, brevet, droits d''auteur, contrefaçon, RGPD, e-commerce, e-réputation.', 8) on conflict (id) do update set label = excluded.label, description = excluded.description, ordre = excluded.ordre;
update domaines set competence_id = 'avocat-c-pi-numerique' where id in ('avocat-propriete-intellectuelle', 'avocat-numerique');
insert into competences (id, profession, label, description, ordre) values ('avocat-c-social', 'avocat', 'Protection sociale', 'Sécurité sociale, CPAM, CAF, URSSAF, retraite, invalidité, chômage.', 9) on conflict (id) do update set label = excluded.label, description = excluded.description, ordre = excluded.ordre;
update domaines set competence_id = 'avocat-c-social' where id in ('avocat-securite-sociale');
insert into competences (id, profession, label, description, ordre) values ('avocat-c-public', 'avocat', 'Droit public & administratif', 'Décision administrative, fonction publique, marchés publics, droit de l''Union européenne.', 10) on conflict (id) do update set label = excluded.label, description = excluded.description, ordre = excluded.ordre;
update domaines set competence_id = 'avocat-c-public' where id in ('avocat-administratif', 'avocat-union-europeenne');
insert into competences (id, profession, label, description, ordre) values ('avocat-c-urbanisme', 'avocat', 'Urbanisme, environnement & rural', 'Permis de construire, PLU, préemption, environnement, bail rural, terres agricoles.', 11) on conflict (id) do update set label = excluded.label, description = excluded.description, ordre = excluded.ordre;
update domaines set competence_id = 'avocat-c-urbanisme' where id in ('avocat-urbanisme', 'avocat-environnement', 'avocat-rural');
insert into competences (id, profession, label, description, ordre) values ('avocat-c-etrangers', 'avocat', 'Droit des étrangers', 'Titre de séjour, naturalisation, visa, asile, regroupement familial, OQTF.', 12) on conflict (id) do update set label = excluded.label, description = excluded.description, ordre = excluded.ordre;
update domaines set competence_id = 'avocat-c-etrangers' where id in ('avocat-etrangers');
insert into competences (id, profession, label, description, ordre) values ('avocat-c-fiscal', 'avocat', 'Droit fiscal', 'Contrôle fiscal, redressement, conseil fiscal, fiscalité du patrimoine.', 13) on conflict (id) do update set label = excluded.label, description = excluded.description, ordre = excluded.ordre;
update domaines set competence_id = 'avocat-c-fiscal' where id in ('avocat-fiscal');
insert into competences (id, profession, label, description, ordre) values ('avocat-c-international', 'avocat', 'Droit international', 'Famille et successions internationales, contrats internationaux, exequatur.', 14) on conflict (id) do update set label = excluded.label, description = excluded.description, ordre = excluded.ordre;
update domaines set competence_id = 'avocat-c-international' where id in ('avocat-international');
