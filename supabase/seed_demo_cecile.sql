-- Données de démo pour le compte de test chelim.cecile@gmail.com (à lancer APRÈS 0007).
update cabinets set
  nom = coalesce(nullif(nom, ''), 'Cabinet Chelim Avocats'),
  adresse = '25 rue de Ponthieu', code_postal = '75008', ville = 'Paris',
  site_web = 'https://www.cabinet-chelim-avocats.fr',
  telephone = '01 42 56 78 90',
  google_rating = 4.8, google_reviews_count = 37,
  google_reviews_url = 'https://www.google.com/maps'
where owner_auth_user_id = (select id from auth.users where email = 'chelim.cecile@gmail.com');

update professionals set
  telephone = '01 42 56 78 90',
  ville = 'Paris',
  bio = 'Avocate au barreau de Paris depuis 2012, j''accompagne particuliers et dirigeants en droit de la famille, droit du travail et droit immobilier.

Je privilégie des échanges clairs, une stratégie expliquée dès le premier rendez-vous et des honoraires annoncés à l''avance.'
where auth_user_id = (select id from auth.users where email = 'chelim.cecile@gmail.com');
