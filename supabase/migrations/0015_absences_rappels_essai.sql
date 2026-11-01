-- clotere-pro — migration 0015 : absences (périodes sans rendez-vous) + rappels de fin d'essai.

create table if not exists absences (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references professionals(id) on delete cascade,
  debut date not null,
  fin date not null,
  motif text,
  created_at timestamptz not null default now(),
  check (fin >= debut)
);
create index if not exists absences_pro_idx on absences (professional_id, fin);
alter table absences enable row level security;
drop policy if exists "own absences" on absences;
create policy "own absences" on absences for all
  using (professional_id in (select id from professionals where auth_user_id = auth.uid()))
  with check (professional_id in (select id from professionals where auth_user_id = auth.uid()));

-- Rappels envoyés au titulaire : 2 jours avant la fin de l'essai, puis à la fin.
alter table cabinets
  add column if not exists rappel_essai_j2_at timestamptz,
  add column if not exists rappel_essai_fin_at timestamptz,
  -- (rattrapage de la 0014 si elle n'a pas été jouée)
  add column if not exists abonnement_quantite int,
  add column if not exists abonnement_fin_periode timestamptz;

notify pgrst, 'reload schema';
