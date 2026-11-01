-- Démo de l'offre Visibilité sur le cabinet de cecile@clotere.fr (à lancer après la migration 0016).
-- Pour un vrai client : remplacez l'e-mail, puis insérez ses articles / stats / rapports de la même façon.

-- 1. Activer l'offre
update cabinets set offre_visibilite = true, offre_visibilite_depuis = current_date, publication_cible = 'site_client'
where id = (select cabinet_id from professionals where email = 'cecile@clotere.fr');

-- 2. Les 3 articles du mois (à relire) + 3 articles déjà publiés
with c as (select cabinet_id as id from professionals where email = 'cecile@clotere.fr')
insert into articles (cabinet_id, mois, titre, mot_cle, contenu, statut, pousse_le, notifie_le, valide_le, publie_le, url_publication, clics, impressions)
select c.id, v.mois::date, v.titre, v.mot_cle, v.contenu, v.statut, v.pousse::timestamptz, v.pousse::timestamptz,
       case when v.statut = 'publie' then v.pousse::timestamptz + interval '3 days' end,
       case when v.statut = 'publie' then v.pousse::timestamptz + interval '5 days' end,
       v.url, v.clics, v.impressions
from c, (values
  (date_trunc('month', now())::date::text, 'SASU ou EURL : quel statut choisir pour lancer son activité ?', 'sasu ou eurl',
   E'Créer son entreprise commence souvent par une question : **SASU ou EURL** ?\n\n## Ce qui les distingue\n\n- Le régime social du dirigeant\n- La fiscalité des dividendes\n- Les obligations comptables\n\n## Comment choisir\n\nTout dépend de votre rémunération prévue et de vos projets. Un rendez-vous de 30 minutes suffit pour y voir clair.',
   'a_relire', now()::text, null, null::int, null::int),
  (date_trunc('month', now())::date::text, 'Changer d''expert-comptable en cours d''année : mode d''emploi', 'changer d''expert-comptable',
   E'Vous n''êtes pas satisfait de votre expert-comptable ? Bonne nouvelle : **vous pouvez en changer à tout moment**.\n\n## Les étapes\n\n- Prévenir votre cabinet actuel par courrier\n- Choisir votre nouveau cabinet\n- Organiser la reprise du dossier\n\n## Ce que fait votre nouveau cabinet\n\nIl prend contact avec l''ancien et récupère vos documents.',
   'a_relire', now()::text, null, null, null),
  (date_trunc('month', now())::date::text, 'Les 5 erreurs comptables des créateurs d''entreprise', 'erreurs comptables création entreprise',
   E'Les premiers mois d''une entreprise sont décisifs.\n\n## 1. Mélanger comptes perso et pro\n\nC''est l''erreur la plus fréquente.\n\n## 2. Oublier de garder ses justificatifs\n\nChaque dépense doit être justifiée.',
   'a_relire', now()::text, null, null, null),
  ((date_trunc('month', now()) - interval '1 month')::date::text, 'TVA : franchise en base ou régime réel ?', 'franchise tva', E'## Le principe\n\nLa franchise en base dispense de facturer la TVA.', 'publie', (now() - interval '30 days')::text, 'https://www.exemple-cabinet.fr/blog/franchise-tva', 86, 2140),
  ((date_trunc('month', now()) - interval '1 month')::date::text, 'Bilan annuel : quels documents préparer ?', 'documents bilan comptable', E'## La liste\n\n- Relevés bancaires\n- Factures', 'publie', (now() - interval '30 days')::text, 'https://www.exemple-cabinet.fr/blog/documents-bilan', 41, 1180),
  ((date_trunc('month', now()) - interval '1 month')::date::text, 'Expert-comptable en ligne ou de proximité ?', 'expert-comptable lyon', E'## Le meilleur des deux\n\nUn cabinet de proximité qui travaille en ligne.', 'publie', (now() - interval '30 days')::text, 'https://www.exemple-cabinet.fr/blog/expert-comptable-proximite', 127, 3920)
) as v(mois, titre, mot_cle, contenu, statut, pousse, url, clics, impressions);

-- 3. Statistiques Search Console des 6 derniers mois
with c as (select cabinet_id as id from professionals where email = 'cecile@clotere.fr')
insert into visibilite_stats (cabinet_id, mois, clics, impressions, position)
select c.id, (date_trunc('month', now()) - (n || ' month')::interval)::date, v.clics, v.impr, v.pos
from c, (values (5, 48, 1900, 24.3), (4, 71, 2600, 19.8), (3, 112, 4100, 15.2), (2, 168, 6300, 12.1), (1, 254, 9800, 9.6), (0, 331, 12400, 8.2)) as v(n, clics, impr, pos)
on conflict (cabinet_id, mois) do update set clics = excluded.clics, impressions = excluded.impressions, position = excluded.position;

-- 4. Rapport trimestriel : déposez d'abord le PDF dans Storage › bucket « rapports »,
--    dans un dossier au nom de l'id du cabinet (ex. <cabinet_id>/2026-T3.pdf), puis :
-- insert into rapports (cabinet_id, titre, periode, fichier)
-- select cabinet_id, 'Rapport T3 2026', '2026-T3', cabinet_id || '/2026-T3.pdf' from professionals where email = 'cecile@clotere.fr';
