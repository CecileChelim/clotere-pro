-- seed démo option Avis — compte cecile+avocat@clotere.fr (cabinet Justifi)
update cabinets set offre_avis = true, offre_avis_depuis = '2026-11-06' where id = 'e9b8bc8d-c482-4439-93d0-08f5db04ea8d';
delete from demandes_avis where cabinet_id = 'e9b8bc8d-c482-4439-93d0-08f5db04ea8d';
delete from avis_google where cabinet_id = 'e9b8bc8d-c482-4439-93d0-08f5db04ea8d';
insert into avis_google (cabinet_id, cle, auteur, note, texte, publie_le, quand, reponse_google, reponse_google_le, reponse_suggeree, statut) values
('e9b8bc8d-c482-4439-93d0-08f5db04ea8d','demo-1','Pierre Tissot',5,'Maître Tellier a été d''une grande disponibilité et d''une clarté remarquable. Je me suis senti écouté et bien conseillé à chaque étape. Je recommande vivement.', now() - interval '1 day','il y a 1 jour',null,null,
 E'Bonjour Pierre,\n\nMerci beaucoup pour votre confiance et pour ce message chaleureux. Ce fut un plaisir de vous accompagner, et nous restons à votre disposition si vous avez besoin de nous à l''avenir.\n\nMaître Audrey Tellier','a_repondre'),
('e9b8bc8d-c482-4439-93d0-08f5db04ea8d','demo-2','Nadia B.',5,'Réponse rapide, rendez-vous fixé en ligne en deux minutes et des explications très claires. Merci !', now() - interval '4 days','il y a 4 jours',null,null,
 E'Bonjour Nadia,\n\nMerci pour votre retour, qui nous fait très plaisir. Nous sommes ravis que la prise de rendez-vous et nos échanges vous aient été utiles. À votre disposition si besoin.\n\nMaître Audrey Tellier','a_repondre'),
('e9b8bc8d-c482-4439-93d0-08f5db04ea8d','demo-3','Julien M.',3,'Bons conseils, mais j''ai trouvé les délais de réponse un peu longs par moments.', now() - interval '9 days','il y a 1 semaine',null,null,
 E'Bonjour Julien,\n\nMerci d''avoir pris le temps de partager votre avis. Vos remarques nous aident à améliorer notre accompagnement, et nous sommes attentifs à nos délais de réponse. N''hésitez pas à nous contacter directement si vous souhaitez en parler.\n\nMaître Audrey Tellier','a_repondre'),
('e9b8bc8d-c482-4439-93d0-08f5db04ea8d','demo-4','Claire Dumont',5,'Excellente avocate en droit du travail, humaine et efficace.', now() - interval '18 days','il y a 2 semaines',
 E'Bonjour Claire, merci infiniment pour votre confiance et ce très beau message. Maître Audrey Tellier', now() - interval '17 days', null,'repondu'),
('e9b8bc8d-c482-4439-93d0-08f5db04ea8d','demo-5','Karim A.',5,null, now() - interval '30 days','il y a 1 mois',
 E'Merci beaucoup pour votre note, Karim. Maître Audrey Tellier', now() - interval '29 days', null,'repondu'),
('e9b8bc8d-c482-4439-93d0-08f5db04ea8d','demo-6','Sophie Laurent',4,'Très professionnelle, je recommande. Cabinet un peu difficile à trouver.', now() - interval '45 days','il y a 1 mois',
 E'Bonjour Sophie, merci pour votre retour et votre recommandation ! Nous ajoutons un plan d''accès à nos confirmations de rendez-vous. Maître Audrey Tellier', now() - interval '44 days', null,'repondu');
insert into demandes_avis (cabinet_id, client_nom, client_email, statut, historique, nb_relances, prochaine_relance_le, avis_id, created_at) values
('e9b8bc8d-c482-4439-93d0-08f5db04ea8d','Pierre Tissot','chelim.cecile+testrdvavocat@gmail.com','avis_recu',
 jsonb_build_array(jsonb_build_object('type','demande','le',now()-interval '6 days','envoye',true), jsonb_build_object('type','relance','le',now()-interval '2 days','envoye',true)),1,null,
 (select id from avis_google where cabinet_id='e9b8bc8d-c482-4439-93d0-08f5db04ea8d' and cle='demo-1'), now()-interval '6 days'),
('e9b8bc8d-c482-4439-93d0-08f5db04ea8d','Marc Lefèvre','marc.lefevre@example.com','en_cours',
 jsonb_build_array(jsonb_build_object('type','demande','le',now()-interval '1 day','envoye',true)),0, now()+interval '3 days', null, now()-interval '1 day'),
('e9b8bc8d-c482-4439-93d0-08f5db04ea8d','Emma Rousseau','emma.rousseau@example.com','en_cours',
 jsonb_build_array(jsonb_build_object('type','demande','le',now()-interval '5 days','envoye',true), jsonb_build_object('type','relance','le',now()-interval '1 day','envoye',true)),1, now()+interval '5 days', null, now()-interval '5 days'),
('e9b8bc8d-c482-4439-93d0-08f5db04ea8d','Nadia Benali','nadia.benali@example.com','avis_recu',
 jsonb_build_array(jsonb_build_object('type','demande','le',now()-interval '5 days','envoye',true)),0,null,
 (select id from avis_google where cabinet_id='e9b8bc8d-c482-4439-93d0-08f5db04ea8d' and cle='demo-2'), now()-interval '5 days'),
('e9b8bc8d-c482-4439-93d0-08f5db04ea8d','Hugo Martin','hugo.martin@example.com','en_cours',
 jsonb_build_array(jsonb_build_object('type','demande','le',now()-interval '11 days','envoye',true), jsonb_build_object('type','relance','le',now()-interval '7 days','envoye',true), jsonb_build_object('type','relance','le',now()-interval '1 day','envoye',true)),2, now()+interval '6 days', null, now()-interval '11 days'),
('e9b8bc8d-c482-4439-93d0-08f5db04ea8d','Lucie Garnier','lucie.garnier@example.com','terminee',
 jsonb_build_array(jsonb_build_object('type','demande','le',now()-interval '25 days','envoye',true), jsonb_build_object('type','relance','le',now()-interval '21 days','envoye',true), jsonb_build_object('type','relance','le',now()-interval '15 days','envoye',true)),2, null, null, now()-interval '25 days');
select (select count(*) from avis_google where cabinet_id='e9b8bc8d-c482-4439-93d0-08f5db04ea8d') avis, (select count(*) from demandes_avis where cabinet_id='e9b8bc8d-c482-4439-93d0-08f5db04ea8d') demandes, (select offre_avis from cabinets where id='e9b8bc8d-c482-4439-93d0-08f5db04ea8d') actif, (select google_business_url from cabinets where id='e9b8bc8d-c482-4439-93d0-08f5db04ea8d') fiche;
