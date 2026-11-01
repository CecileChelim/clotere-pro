-- clotere-pro — migration 0011 : présence en ligne (LinkedIn, fiche Google).
alter table professionals add column if not exists linkedin_url text;
alter table cabinets add column if not exists google_business_url text;   -- lien de la fiche Google Business
notify pgrst, 'reload schema';
