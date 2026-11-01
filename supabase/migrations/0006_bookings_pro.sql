-- clotere-pro — migration 0006 : demandes de rendez-vous depuis la page publique.
alter table bookings
  add column if not exists client_prenom text,
  add column if not exists suivi_existant boolean not null default false,
  add column if not exists deja_avocat text,     -- non | oui | changer (nouveaux clients)
  add column if not exists mode text;            -- cabinet | visio | telephone

-- Un visiteur anonyme peut créer une demande, uniquement au statut « demandé ».
drop policy if exists "public insert booking" on bookings;
create policy "public insert booking" on bookings for insert to anon, authenticated
  with check (statut = 'demandé');
