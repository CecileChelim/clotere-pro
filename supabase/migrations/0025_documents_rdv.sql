-- clotere-pro — migration 0025 : documents déposés par le client sur la page de son rendez-vous.
-- Le client (sans compte) dépose des PDF depuis /suivi/<token_client> ; le pro les télécharge depuis /gestion/<token_pro>.
-- Tout passe par le serveur (service_role) : aucune policy publique, ni sur la table ni sur le bucket.
-- À la clôture du rendez-vous (« Supprimer »), les fichiers et les données du client sont effacés.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', false, 10485760, array['application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create table if not exists booking_documents (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  chemin text not null unique,          -- <booking_id>/<uuid>.pdf dans le bucket « documents »
  libelle text not null,                -- « De quels documents s'agit-il ? » (saisi par le client)
  nom_fichier text not null,
  taille integer not null,
  created_at timestamptz not null default now()
);
create index if not exists booking_documents_booking_idx on booking_documents (booking_id, created_at);
alter table booking_documents enable row level security;

-- Date d'effacement des données du client (documents, coordonnées, message, e-mails).
alter table bookings add column if not exists donnees_client_supprimees_le timestamptz;

notify pgrst, 'reload schema';
