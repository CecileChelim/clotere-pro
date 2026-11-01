-- clotere-pro — migration 0008 : taxonomie domaines / spécialités + honoraires.

create table if not exists domaines (
  id text primary key,                       -- ex. avocat-travail
  profession text not null check (profession in ('avocat', 'comptable')),
  label text not null,
  ordre int not null default 0
);

create table if not exists specialites (
  id text primary key,                       -- ex. avocat-travail-licenciement
  domaine_id text not null references domaines(id) on delete cascade,
  label text not null,
  ordre int not null default 0,
  populaire boolean not null default false
);

create table if not exists pro_specialites (
  professional_id uuid not null references professionals(id) on delete cascade,
  specialite_id text not null references specialites(id) on delete cascade,
  primary key (professional_id, specialite_id)
);

alter table motifs add column if not exists domaine_id text references domaines(id);

alter table professionals
  add column if not exists honoraires_modes text[] not null default '{}',   -- forfait | horaire | convention | resultat
  add column if not exists paiement_moyens text[] not null default '{}',    -- cb | cheque | virement | especes
  add column if not exists services text[] not null default '{}';           -- aide_juridictionnelle | rdv_offert | paiement_plusieurs_fois | protection_juridique

alter table domaines enable row level security;
alter table specialites enable row level security;
alter table pro_specialites enable row level security;

drop policy if exists "public read domaines" on domaines;
create policy "public read domaines" on domaines for select using (true);
drop policy if exists "public read specialites" on specialites;
create policy "public read specialites" on specialites for select using (true);
drop policy if exists "public read pro_specialites" on pro_specialites;
create policy "public read pro_specialites" on pro_specialites for select using (true);
drop policy if exists "own pro_specialites" on pro_specialites;
create policy "own pro_specialites" on pro_specialites for all
  using (professional_id in (select id from professionals where auth_user_id = auth.uid()))
  with check (professional_id in (select id from professionals where auth_user_id = auth.uid()));

-- Données de référence ------------------------------------------------------
insert into domaines (id, profession, label, ordre) values ('avocat-travail', 'avocat', 'Droit du travail', 0) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-travail-contrat', 'avocat-travail', 'Contrat de travail', 0, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-travail-licenciement', 'avocat-travail', 'Licenciement', 1, true) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-travail-rupture-conventionnelle', 'avocat-travail', 'Rupture conventionnelle', 2, true) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-travail-harcelement-travail', 'avocat-travail', 'Harcèlement au travail', 3, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-travail-droit-social', 'avocat-travail', 'Droit social / sécurité sociale', 4, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into domaines (id, profession, label, ordre) values ('avocat-divorce', 'avocat', 'Divorce', 1) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-divorce-amiable', 'avocat-divorce', 'Divorce amiable', 0, true) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-divorce-contentieux', 'avocat-divorce', 'Divorce contentieux', 1, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-divorce-garde-enfants', 'avocat-divorce', 'Garde des enfants', 2, true) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-divorce-pension-alimentaire', 'avocat-divorce', 'Pension alimentaire', 3, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into domaines (id, profession, label, ordre) values ('avocat-famille', 'avocat', 'Droit de la famille', 2) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-famille-mariage-pacs', 'avocat-famille', 'Mariage & PACS', 0, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-famille-successions', 'avocat-famille', 'Successions, héritage & patrimoine', 1, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-famille-protection-enfance', 'avocat-famille', 'Protection de l''enfance', 2, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-famille-protection-majeurs', 'avocat-famille', 'Protection des majeurs', 3, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into domaines (id, profession, label, ordre) values ('avocat-penal', 'avocat', 'Droit pénal', 3) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-penal-agression', 'avocat-penal', 'Agression', 0, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-penal-harcelement', 'avocat-penal', 'Harcèlement', 1, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-penal-violences-conjugales', 'avocat-penal', 'Violences conjugales', 2, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-penal-mineurs', 'avocat-penal', 'Justice des mineurs', 3, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into domaines (id, profession, label, ordre) values ('avocat-routier', 'avocat', 'Droit routier', 4) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-routier-accident', 'avocat-routier', 'Accident de la route', 0, true) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-routier-infractions', 'avocat-routier', 'Infractions routières', 1, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-routier-permis', 'avocat-routier', 'Permis de conduire', 2, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-routier-code-route', 'avocat-routier', 'Code de la route', 3, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into domaines (id, profession, label, ordre) values ('avocat-etrangers', 'avocat', 'Droit des étrangers', 5) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-etrangers-titre-sejour', 'avocat-etrangers', 'Titre de séjour', 0, true) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-etrangers-naturalisation', 'avocat-etrangers', 'Naturalisation', 1, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-etrangers-regroupement-familial', 'avocat-etrangers', 'Regroupement familial', 2, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-etrangers-oqtf', 'avocat-etrangers', 'OQTF', 3, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-etrangers-sans-papiers', 'avocat-etrangers', 'Sans-papiers', 4, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into domaines (id, profession, label, ordre) values ('avocat-entreprises', 'avocat', 'Droit des entreprises', 6) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-entreprises-societes', 'avocat-entreprises', 'Droit des sociétés', 0, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-entreprises-employeur', 'avocat-entreprises', 'Conseil employeur', 1, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-entreprises-difficulte', 'avocat-entreprises', 'Entreprise en difficulté', 2, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-entreprises-recouvrement', 'avocat-entreprises', 'Impayés & recouvrement', 3, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into domaines (id, profession, label, ordre) values ('avocat-immobilier', 'avocat', 'Droit de l''immobilier', 7) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-immobilier-bail-habitation', 'avocat-immobilier', 'Bail d''habitation & loyers impayés', 0, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-immobilier-baux-commerciaux', 'avocat-immobilier', 'Baux commerciaux', 1, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-immobilier-copropriete', 'avocat-immobilier', 'Copropriété', 2, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-immobilier-achat-vente', 'avocat-immobilier', 'Achat / vente', 3, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-immobilier-construction', 'avocat-immobilier', 'Construction & malfaçons', 4, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into domaines (id, profession, label, ordre) values ('avocat-sante', 'avocat', 'Droit de la santé', 8) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-sante-erreur-medicale', 'avocat-sante', 'Erreur médicale', 0, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-sante-dommage-corporel', 'avocat-sante', 'Dommage corporel', 1, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into domaines (id, profession, label, ordre) values ('avocat-consommation', 'avocat', 'Droit de la consommation', 9) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-consommation-litige-pro', 'avocat-consommation', 'Litige avec un professionnel', 0, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-consommation-surendettement', 'avocat-consommation', 'Surendettement', 1, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into domaines (id, profession, label, ordre) values ('avocat-numerique', 'avocat', 'Numérique & informatique', 10) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-numerique-rgpd', 'avocat-numerique', 'RGPD', 0, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-numerique-contrats-informatiques', 'avocat-numerique', 'Contrats informatiques', 1, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-numerique-e-reputation', 'avocat-numerique', 'E-réputation', 2, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into domaines (id, profession, label, ordre) values ('avocat-autres', 'avocat', 'Autres domaines', 11) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-autres-civil', 'avocat-autres', 'Droit civil', 0, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-autres-international', 'avocat-autres', 'Droit international', 1, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-autres-pi', 'avocat-autres', 'Propriété intellectuelle', 2, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-autres-fiscal', 'avocat-autres', 'Droit fiscal', 3, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-autres-sport', 'avocat-autres', 'Droit du sport', 4, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-autres-rural', 'avocat-autres', 'Droit rural', 5, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('avocat-autres-animaux', 'avocat-autres', 'Droit des animaux', 6, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into domaines (id, profession, label, ordre) values ('comptable-creation', 'comptable', 'Création d''entreprise', 0) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('comptable-creation-statut', 'comptable-creation', 'Choix du statut', 0, true) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('comptable-creation-previsionnel', 'comptable-creation', 'Prévisionnel & business plan', 1, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('comptable-creation-immatriculation', 'comptable-creation', 'Immatriculation', 2, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into domaines (id, profession, label, ordre) values ('comptable-changement', 'comptable', 'Changer d''expert-comptable', 1) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('comptable-changement-reprise', 'comptable-changement', 'Reprise du dossier', 0, true) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('comptable-changement-lettre-mission', 'comptable-changement', 'Lettre de mission', 1, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into domaines (id, profession, label, ordre) values ('comptable-bilan', 'comptable', 'Bilan & comptabilité', 2) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('comptable-bilan-tenue', 'comptable-bilan', 'Tenue comptable', 0, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('comptable-bilan-bilan-annuel', 'comptable-bilan', 'Bilan annuel', 1, true) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('comptable-bilan-liasse', 'comptable-bilan', 'Liasse fiscale', 2, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into domaines (id, profession, label, ordre) values ('comptable-fiscalite', 'comptable', 'Fiscalité', 3) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('comptable-fiscalite-tva', 'comptable-fiscalite', 'TVA', 0, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('comptable-fiscalite-is', 'comptable-fiscalite', 'Impôt sur les sociétés', 1, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('comptable-fiscalite-optimisation', 'comptable-fiscalite', 'Optimisation fiscale', 2, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('comptable-fiscalite-controle', 'comptable-fiscalite', 'Contrôle fiscal', 3, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into domaines (id, profession, label, ordre) values ('comptable-social', 'comptable', 'Social & paie', 4) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('comptable-social-paie', 'comptable-social', 'Bulletins de paie', 0, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('comptable-social-embauche', 'comptable-social', 'Embauche', 1, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('comptable-social-charges', 'comptable-social', 'Charges sociales', 2, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into domaines (id, profession, label, ordre) values ('comptable-gestion', 'comptable', 'Conseil de gestion', 5) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('comptable-gestion-tableaux-bord', 'comptable-gestion', 'Tableaux de bord', 0, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('comptable-gestion-tresorerie', 'comptable-gestion', 'Trésorerie', 1, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('comptable-gestion-financement', 'comptable-gestion', 'Financement', 2, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into domaines (id, profession, label, ordre) values ('comptable-particulier', 'comptable', 'Particuliers', 6) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('comptable-particulier-revenus', 'comptable-particulier', 'Déclaration de revenus', 0, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('comptable-particulier-lmnp', 'comptable-particulier', 'LMNP', 1, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;
insert into specialites (id, domaine_id, label, ordre, populaire) values ('comptable-particulier-patrimoine', 'comptable-particulier', 'Patrimoine', 2, false) on conflict (id) do update set label = excluded.label, ordre = excluded.ordre, populaire = excluded.populaire;

notify pgrst, 'reload schema';
