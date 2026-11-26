-- Données de démo pour les fiches pro clotere.fr/avocat/audrey-tellier et clotere.fr/comptable/martin-pain
-- (comptes cecile+avocat@clotere.fr et cecile+comptable@clotere.fr). À lancer à la main dans l'éditeur SQL Supabase.

update professionals set
  bio = 'Avocate au barreau de Paris, j''accompagne les salariés, les dirigeants et les particuliers en droit du travail, droit de la famille et droit des entreprises.

Mon cabinet, installé dans le 18e arrondissement, privilégie des échanges clairs : je prends le temps de comprendre votre situation, je vous présente les options possibles et leur coût, puis nous avançons ensemble à chaque étape du dossier.

Les rendez-vous ont lieu en visio ou par téléphone, pour vous éviter un déplacement.',
  honoraires_modes = array['convention', 'forfait', 'horaire'],
  paiement_moyens = array['cb', 'virement', 'cheque'],
  services = array['paiement_plusieurs_fois', 'protection_juridique']
where auth_user_id = (select id from auth.users where email = 'cecile+avocat@clotere.fr');

update professionals set
  bio = 'J''accompagne les créateurs d''entreprise, les indépendants et les particuliers qui veulent une comptabilité tenue avec rigueur et un interlocuteur qui prend le temps d''expliquer.

Pour ceux qui se lancent, je vous aide à choisir le statut adapté à votre projet, à bâtir un prévisionnel solide et à mener l''immatriculation sans mauvaise surprise. Une fois l''activité lancée, je prends en charge la tenue comptable, le bilan annuel et la liasse fiscale, et je vous signale les échéances avant qu''elles n''arrivent.

J''accompagne aussi les particuliers : déclaration de revenus, location meublée en LMNP et questions de patrimoine.

Ma conviction est simple : vos chiffres doivent vous servir à décider, pas seulement à remplir des obligations. Vous avez un interlocuteur unique, des réponses claires et des points réguliers pour piloter votre activité.

Le cabinet est situé rue des Pyrénées, dans le 20e arrondissement de Paris. La plupart de nos échanges peuvent aussi se faire à distance, en visio ou par téléphone. Le premier échange est gratuit.',
  honoraires_modes = array['forfait'],
  paiement_moyens = array['virement', 'cb'],
  services = array['paiement_plusieurs_fois']
where auth_user_id = (select id from auth.users where email = 'cecile+comptable@clotere.fr');
