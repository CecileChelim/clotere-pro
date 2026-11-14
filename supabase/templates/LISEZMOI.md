# Modèles d'e-mails Supabase (en français)

À coller dans Supabase → Authentication → Emails → Templates (onglet « Source »).

| Modèle Supabase | Objet à mettre | Fichier |
|---|---|---|
| Confirm signup | Confirmez votre adresse e-mail | `confirmation.html` |
| Reset password | Votre nouveau mot de passe Clotere | `reset-password.html` |
| Change email address | Confirmez votre nouvelle adresse e-mail | `changement-email.html` |

Ces e-mails sont communs aux avocats et aux experts-comptables (Supabase n'a qu'un modèle par type).

Pour qu'ils partent de `contact@clotere.fr` et pas d'une adresse Supabase : Authentication → Emails → SMTP Settings →
activer « Custom SMTP » avec Google Workspace :
hôte `smtp.gmail.com`, port `465`, identifiant `cecile@clotere.fr`, mot de passe = mot de passe d'application Google,
expéditeur `contact@clotere.fr` (alias « Envoyer en tant que » de cecile@ ; sinon mettre `cecile@clotere.fr`), nom « Clotere ».
Cela lève aussi la limite d'envoi de Supabase (quelques e-mails par heure seulement).
