-- clotere-pro — migration 0020 : e-mail de contact affiché sur le site (distinct de l'e-mail de connexion).
alter table sites add column if not exists email_contact text;
notify pgrst, 'reload schema';
