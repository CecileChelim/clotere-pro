-- clotere-pro — migration 0010 : raison d'annulation indiquée par le client.
alter table bookings add column if not exists annulation_raison text;  -- plus_besoin | imprevu | autre_pro | autre
notify pgrst, 'reload schema';
