-- clotere-pro — migration 0013 : synchronisation des agendas Google / Outlook.
create table if not exists agenda_connexions (
  professional_id uuid primary key references professionals(id) on delete cascade,
  provider text not null check (provider in ('google', 'outlook')),
  refresh_token text not null,      -- chiffré (AES-256-GCM, clé AGENDA_ENC_KEY)
  access_token text,                -- chiffré
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
-- Aucune policy : seule la clé service_role (serveur) peut lire ou écrire les jetons.
alter table agenda_connexions enable row level security;

alter table professionals add column if not exists agenda_provider text;
alter table bookings
  add column if not exists agenda_event_id text,
  add column if not exists visio_url text;

notify pgrst, 'reload schema';
