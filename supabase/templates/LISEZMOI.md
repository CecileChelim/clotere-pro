# Modèles d'e-mails Supabase (en français)

À coller dans Supabase → Authentication → Emails → Templates (onglet « Source »).

| Modèle Supabase | Objet à mettre | Fichier |
|---|---|---|
| Confirm signup | Confirmez votre adresse e-mail | `confirmation.html` |
| Reset password | Votre nouveau mot de passe Clotere | `reset-password.html` |
| Change email address | Confirmez votre nouvelle adresse e-mail | `changement-email.html` |

Ces e-mails sont communs aux avocats et aux experts-comptables (Supabase n'a qu'un modèle par type).

Pour qu'ils partent de `contact@clotere.fr` et pas d'une adresse Supabase : Authentication → Emails → SMTP Settings →
activer « Custom SMTP » avec les identifiants SMTP de Brevo (Brevo → SMTP et API → onglet SMTP) :
hôte `smtp-relay.brevo.com`, port `587`, identifiant et clé SMTP Brevo, expéditeur `contact@clotere.fr`, nom « Clotere ».
Cela lève aussi la limite d'envoi de Supabase (quelques e-mails par heure seulement).
