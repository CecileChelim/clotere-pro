-- clotere-pro — migration 0028 : facturation au lead (apport d'affaires depuis les fiches clotere.fr).
-- Un lead = une demande de rendez-vous prise depuis la fiche clotere.fr (bookings.source = 'clotere').
-- Il est facturable 48 h après le créneau, sauf contestation par le pro ou annulation par le client.
-- Facturation en plus de l'abonnement : la carte est enregistrée à l'activation (Stripe Checkout « setup »),
-- les leads sont ajoutés en lignes de facture Stripe puis facturés chaque mois.

alter table cabinets
  add column if not exists leads_actifs boolean not null default false,  -- carte enregistrée, demandes Clotere activées
  add column if not exists leads_ouverts boolean not null default false, -- actifs ET plafond du mois non atteint (lu par la fiche clotere.fr)
  add column if not exists leads_plafond int,                            -- nombre max de leads facturés par mois (null = sans limite)
  add column if not exists leads_actives_at timestamptz;

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid unique references bookings(id) on delete set null,  -- conservé même si le rdv est purgé
  cabinet_id uuid not null references cabinets(id) on delete cascade,
  professional_id uuid references professionals(id) on delete set null,
  profession text not null,
  montant_ht_cents int not null,
  -- en_attente : contestable jusqu'à contestable_jusqu | a_facturer | facture | conteste | annule
  statut text not null default 'en_attente',
  client_label text,                 -- « Julie M. » (affichage, sans données personnelles complètes)
  motif text,
  creneau_debut timestamptz,
  contestable_jusqu timestamptz not null,
  raison text,                       -- contestation (absent, hors_domaine, doublon, spam, autre) ou annulation (client, doublon_auto)
  raison_detail text,
  conteste_at timestamptz,
  stripe_invoice_item text,
  facture_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists leads_cabinet_idx on leads (cabinet_id, created_at desc);
create index if not exists leads_statut_idx on leads (statut, contestable_jusqu);

alter table leads enable row level security;
drop policy if exists "leads lus par le cabinet" on leads;
create policy "leads lus par le cabinet" on leads for select using (cabinet_id in (select my_cabinet_ids()));
-- Écritures uniquement côté serveur (clé service) : création à la demande, contestation, facturation.

-- Dernier mois (AAAA-MM) pour lequel la facture mensuelle des leads a été émise.
alter table cabinets add column if not exists leads_facture_mois text;
